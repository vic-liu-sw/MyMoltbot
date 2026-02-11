import Foundation

final class ReceiptParser {
    // 抓取 Total / 總計 / 小計 後面的金額（支援 $, NT$, 千分位與小數）
    private let amountPattern = #"(?im)(total|總計|小計)\s*[:：]?\s*(?:nt\$|n\.?t\.?\$|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)"#

    func parse(from text: String) -> ParsedReceipt {
        let nsText = text as NSString
        let fullRange = NSRange(location: 0, length: nsText.length)

        var totalAmount: Decimal?
        var subtotalAmount: Decimal?

        if let regex = try? NSRegularExpression(pattern: amountPattern) {
            let matches = regex.matches(in: text, options: [], range: fullRange)

            for match in matches {
                guard match.numberOfRanges >= 3 else { continue }
                let key = nsText.substring(with: match.range(at: 1)).lowercased()
                let amountString = nsText.substring(with: match.range(at: 2)).replacingOccurrences(of: ",", with: "")
                let amount = Decimal(string: amountString)

                if key.contains("小計") {
                    subtotalAmount = amount ?? subtotalAmount
                } else {
                    totalAmount = amount ?? totalAmount
                }
            }
        }

        // NSDataDetector 抓日期
        var detectedDate: Date?
        if let detector = try? NSDataDetector(types: NSTextCheckingResult.CheckingType.date.rawValue) {
            let dateMatches = detector.matches(in: text, options: [], range: fullRange)
            detectedDate = dateMatches.compactMap(\.date).first
        }

        // 簡易店家推測：第一個非空行
        let merchant = text
            .split(separator: "\n")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .first(where: { !$0.isEmpty }) ?? "Unknown Merchant"

        return ParsedReceipt(
            merchantName: merchant,
            totalAmount: totalAmount,
            subtotalAmount: subtotalAmount,
            purchaseDate: detectedDate,
            rawText: text
        )
    }
}
