export type BillCategory = '飲食' | '交通' | '生活' | '辦公' | '其他'

export function classifyMerchant(merchantName: string): BillCategory {
  const name = merchantName.toLowerCase()
  if (/(7-eleven|全家|麥當勞|starbucks|cafe)/i.test(name)) return '飲食'
  if (/(uber|taxi|車隊|捷運|高鐵)/i.test(name)) return '交通'
  if (/(屈臣氏|康是美|家樂福|全聯)/i.test(name)) return '生活'
  if (/(誠品|文具|office|staples)/i.test(name)) return '辦公'
  return '其他'
}

export function parseReceiptText(text: string) {
  const amountRegex = /(total|總計|小計)\s*[:：]?\s*(?:nt\$|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gim
  const dateRegex = /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/

  let total = 0
  for (const m of text.matchAll(amountRegex)) {
    total = Number((m[2] ?? '0').replaceAll(',', '')) || total
  }

  const merchantName =
    text
      .split('\n')
      .map((v) => v.trim())
      .find(Boolean) ?? 'Unknown Merchant'

  const dateText = text.match(dateRegex)?.[0]
  const date = dateText ? new Date(dateText.replace(/\//g, '-')).toISOString() : new Date().toISOString()

  return {
    merchantName,
    total,
    date,
    category: classifyMerchant(merchantName),
  }
}
