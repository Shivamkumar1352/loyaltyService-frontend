import { fmt } from '../../../shared/utils'
import type { AddMoneyResult } from './types'

export function downloadAddMoneyReceipt(txResult: AddMoneyResult) {
  const content = `WalletPay Receipt\n------------------\nAmount: ${fmt.currency(txResult?.amount)}\nStatus: ${txResult?.status}\nRef: ${txResult?.ref}\nDate: ${new Date().toLocaleString()}`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'receipt.txt'
  anchor.click()
  URL.revokeObjectURL(url)
}
