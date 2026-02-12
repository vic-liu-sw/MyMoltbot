export const amountRegex = /(total|總計|小計)\s*[:：]?\s*(?:nt\$|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gim
export const dateRegex = /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/

export function parseReceipt(rawText: string) {
  let amount = 0
  for (const m of rawText.matchAll(amountRegex)) {
    amount = Number((m[2] ?? '0').replaceAll(',', '')) || amount
  }
  const merchantName = rawText.split('\n').map((v) => v.trim()).find(Boolean) ?? 'Unknown Merchant'
  const date = rawText.match(dateRegex)?.[0]
  const source = rawText.toLowerCase()
  const category =
    source.includes('uber') || source.includes('車隊')
      ? '交通'
      : source.includes('7-eleven') || source.includes('全家')
        ? '飲食'
        : '未分類'

  return { amount, merchantName, date, category }
}
