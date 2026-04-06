import axios from 'axios'
import toast from 'react-hot-toast'
import { getAuthStoreState } from '../../store'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const REQUEST_TIMEOUT_MS = 30000

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: REQUEST_TIMEOUT_MS,
})

let refreshRequest = null
let lastNetworkToastAt = 0

function getAuthState() {
  return getAuthStoreState()
}

function clearAuthAndRedirect() {
  getAuthState().logout()
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

function getRefreshPayload(data) {
  return data?.data ?? data
}

/** Full request URL as axios will send it (baseURL may be empty in dev → relative /api/...). */
function getRequestUrl(config) {
  if (!config) return ''
  const u = config.url || ''
  const b = config.baseURL || ''
  try {
    if (u.startsWith('http')) return u
    return `${b}${u}`
  } catch {
    return `${b}${u}`
  }
}

function isAuthRefreshRequest(config) {
  const url = config?.url || ''
  const full = getRequestUrl(config)
  return url.includes('/api/auth/refresh') || full.includes('/api/auth/refresh')
}

async function refreshAccessToken() {
  if (!refreshRequest) {
    const { refreshToken, setTokens } = getAuthState()

    if (!refreshToken) {
      throw new Error('Missing refresh token')
    }

    refreshRequest = api.post('/api/auth/refresh', { refreshToken }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: REQUEST_TIMEOUT_MS,
    })
      .then((response) => {
        const payload = getRefreshPayload(response.data)
        const nextAccessToken = payload?.accessToken
        const nextRefreshToken = payload?.refreshToken

        if (!nextAccessToken) {
          throw new Error('Refresh endpoint did not return an access token')
        }

        setTokens(nextAccessToken, nextRefreshToken ?? refreshToken)
        return nextAccessToken
      })
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

// Request interceptor — attach JWT (never on refresh: expired Bearer can make gateways reject the call)
api.interceptors.request.use(
  (config) => {
    try {
      if (isAuthRefreshRequest(config)) {
        delete config.headers?.Authorization
        delete config.headers?.['X-User-Id']
        delete config.headers?.['X-UserRole']
        delete config.headers?.['X-User-Role']
        delete config.headers?.['X-UserEmail']
        return config
      }
      const { accessToken: token, user } = getAuthState()
      if (token) config.headers.Authorization = `Bearer ${token}`
      const userId = user?.id
      if (userId) config.headers['X-User-Id'] = userId
      const role = user?.role
      if (role) {
        config.headers['X-UserRole'] = role
        config.headers['X-User-Role'] = role
      }
      const email = user?.email
      if (email) config.headers['X-UserEmail'] = email
    } catch {}
    return config
  },
  (err) => Promise.reject(err)
)

// Response interceptor — handle errors + refresh
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    // Network error / CORS / timeout
    if (!err?.response) {
      const now = Date.now()
      if (now - lastNetworkToastAt > 2500) {
        lastNetworkToastAt = now
        toast.error('Network error. Please check your connection and try again.')
      }
      return Promise.reject(err)
    }

    const original = err.config
    const isRefreshRequest = isAuthRefreshRequest(original)
    const isLogoutRequest =
      (original?.url || '').includes('/api/auth/logout') ||
      getRequestUrl(original).includes('/api/auth/logout')

    if (err.response?.status === 401 && original && !original._retry && !isRefreshRequest && !isLogoutRequest) {
      original._retry = true

      try {
        const accessToken = await refreshAccessToken()
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch (refreshErr) {
        clearAuthAndRedirect()
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(err)
  }
)

export default api

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:   (data) => api.post('/api/auth/login', data),
  loginPhone: (data) => api.post('/api/auth/login/phone', data),
  signup:  (data) => api.post('/api/auth/signup', data),
  logout:  (data) => api.post('/api/auth/logout', data),
  sendOtp: (data) => api.post('/api/auth/send-otp', data),
  verifyOtp: (data) => api.post('/api/auth/verify-otp', data),
  forgotPasswordSendOtp: (data) => api.post('/api/auth/forgot-password/send-otp', data),
  forgotPasswordVerifyOtp: (data) => api.post('/api/auth/forgot-password/verify-otp', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  refresh: (data) => api.post('/api/auth/refresh', data),
}

// ─── User / Profile ───────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:    () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
}

// ─── KYC ─────────────────────────────────────────────────────────────────────
export const kycAPI = {
  submit:    (formData, docType, docNumber) =>
    api.post(`/api/kyc/submit?docType=${docType}&docNumber=${docNumber}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getStatus: () => api.get('/api/kyc/status'),
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
export const walletAPI = {
  getBalance:       () => api.get('/api/wallet/balance'),
  getTransactions:  (page = 0, size = 10) => api.get(`/api/wallet/transactions?page=${page}&size=${size}`),
  getLedger:        (page = 0, size = 20) => api.get(`/api/wallet/ledger?page=${page}&size=${size}`),
  getStatement:     (from, to) => api.get(`/api/wallet/statement?from=${from}&to=${to}`),
  downloadStatement:(from, to) => api.get(`/api/wallet/statement/download?from=${from}&to=${to}`, { responseType: 'blob' }),
  transfer:         (data) => api.post('/api/wallet/transfer', data),
  withdraw:         (data) => api.post('/api/wallet/withdraw', data),
  createOrder:      (amount) => api.post(`/api/payment/create-order?amount=${amount}`),
  verifyPayment:    (data) => api.post('/api/payment/verify', data),
}

// ─── Rewards ──────────────────────────────────────────────────────────────────
export const rewardsAPI = {
  getSummary:     () => api.get('/api/rewards/summary'),
  getCatalog:     () => api.get('/api/rewards/catalog'),
  getTransactions: (page = 0, size = 10) => api.get(`/api/rewards/transactions?page=${page}&size=${size}`),
  redeem:         (data) => api.post('/api/rewards/redeem', data),
  redeemPoints:   (points) => api.post(`/api/rewards/redeem-points?points=${points}`),
}

// ─── Rewards (Admin) ───────────────────────────────────────────────────────────
export const rewardsAdminAPI = {
  getCatalog: () => api.get('/api/rewards/admin/catalog'),
  updateItem: (rewardId, data) => api.put(`/api/rewards/admin/catalog/${rewardId}`, data),
  deleteItem: (rewardId) => api.delete(`/api/rewards/admin/catalog/${rewardId}`),
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard:   () => api.get('/api/admin/dashboard'),
  listUsers:      (params) => api.get('/api/admin/users', { params }),
  getUser:       (id) => api.get(`/api/admin/users/${id}`),
  searchUsers:    (q, page = 0) => api.get(`/api/admin/users/search?q=${q}&page=${page}`),
  searchByEmail:  (email) => api.get(`/api/admin/users/search/email?email=${email}`),
  searchByPhone:  (phone) => api.get(`/api/admin/users/search/phone?phone=${phone}`),
  searchByKyc:    (kycStatus, page = 0) => api.get(`/api/admin/users/search/kyc-status?kycStatus=${kycStatus}&page=${page}`),
  blockUser:      (id) => api.patch(`/api/admin/users/${id}/block`),
  unblockUser:    (id) => api.patch(`/api/admin/users/${id}/unblock`),
  changeRole:     (id, newRole) => api.patch(`/api/admin/users/${id}/role?newRole=${newRole}`),
  getPendingKyc:  (page = 0) => api.get(`/api/admin/kyc/pending?page=${page}`),
  approveKyc:     (kycId) => api.post(`/api/admin/kyc/${kycId}/approve`),
  rejectKyc:      (kycId, reason) => api.post(`/api/admin/kyc/${kycId}/reject?reason=${encodeURIComponent(reason)}`),
  approveKycByUser:(userId) => api.post(`/api/admin/kyc/user/${userId}/approve`),
  rejectKycByUser: (userId, reason) => api.post(`/api/admin/kyc/user/${userId}/reject?reason=${encodeURIComponent(reason)}`),
  addRewardItem:  (data) => api.post('/api/rewards/catalog/add', data),
}
