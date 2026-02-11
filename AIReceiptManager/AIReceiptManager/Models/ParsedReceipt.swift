import Foundation

struct ParsedReceipt {
    let merchantName: String
    let totalAmount: Decimal?
    let subtotalAmount: Decimal?
    let purchaseDate: Date?
    let rawText: String
}
