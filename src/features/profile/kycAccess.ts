import { kycAPI } from '../../core/api'

export const KYC_REQUIRED_ROUTE = '/profile?tab=kyc&kycRequired=1'

export function normalizeKycStatus(status?: string | null) {
  return status || 'NOT_SUBMITTED'
}

export function isKycApproved(status?: string | null) {
  return normalizeKycStatus(status) === 'APPROVED'
}

export function getKycRequiredMessage(status?: string | null) {
  const normalizedStatus = normalizeKycStatus(status)

  if (normalizedStatus === 'PENDING') {
    return 'Your KYC is under review. Your wallet will be created after approval.'
  }

  if (normalizedStatus === 'REJECTED') {
    return 'Your KYC was rejected. Re-submit your KYC to continue.'
  }

  return 'Submit your KYC to continue. Your wallet will be created after approval.'
}

export async function fetchKycGate() {
  const response = await kycAPI.getStatus()
  const status = normalizeKycStatus(response.data?.data?.status)

  return {
    status,
    approved: isKycApproved(status),
    redirectTo: `${KYC_REQUIRED_ROUTE}&status=${encodeURIComponent(status)}`,
    message: getKycRequiredMessage(status),
  }
}
