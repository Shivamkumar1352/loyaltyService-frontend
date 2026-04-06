export type TransferMode = 'transfer' | 'withdraw'
export type TransferStep = 'form' | 'confirm' | 'success' | 'failed'

export type TransferFormData = {
  receiverId?: number
  destination?: string
  amount: number
  description?: string
}

export type TransferResult = Partial<TransferFormData> & {
  status: 'SUCCESS' | 'FAILED'
  error?: string
}

export type WalletTransferPayload = {
  receiverId: number
  amount: number
  description: string
  idempotencyKey: string
}

export type WalletWithdrawPayload = {
  amount: number
  description: string
  idempotencyKey: string
}
