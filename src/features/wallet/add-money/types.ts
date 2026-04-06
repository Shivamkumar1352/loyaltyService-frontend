export type AddMoneyStep = 'form' | 'processing' | 'success' | 'failed'

export type AddMoneyFormData = {
  amount: number | string
}

export type AddMoneyResult = {
  amount: number | string
  status: 'SUCCESS' | 'FAILED'
  ref?: string
  error?: string
} | null
