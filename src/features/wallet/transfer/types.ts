export type TransferMode = 'transfer' | 'withdraw'
export type TransferStep = 'form' | 'confirm' | 'success' | 'failed'
export type TransferRecipientType = 'id' | 'email' | 'phone'

export type TransferFormData = {
  recipientType?: TransferRecipientType
  recipientValue?: string
  destination?: string
  amount: number
  description?: string
}

export type TransferResult = Partial<TransferFormData> & {
  status: 'SUCCESS' | 'FAILED'
  error?: string
}

export type WalletTransferPayload = {
  receiverId?: number
  recipientEmail?: string
  recipientPhone?: string
  amount: number
  description: string
  idempotencyKey: string
}

export type WalletWithdrawPayload = {
  amount: number
  description: string
  idempotencyKey: string
}
