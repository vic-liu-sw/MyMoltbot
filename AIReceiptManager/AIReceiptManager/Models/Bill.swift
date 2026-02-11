import Foundation
import SwiftData

@Model
final class Bill {
    var id: UUID
    var merchantName: String
    var totalAmount: Decimal
    var subtotalAmount: Decimal?
    var purchaseDate: Date?
    var createdAt: Date
    var category: String
    var rawOCRText: String

    init(
        id: UUID = UUID(),
        merchantName: String,
        totalAmount: Decimal,
        subtotalAmount: Decimal? = nil,
        purchaseDate: Date? = nil,
        createdAt: Date = Date(),
        category: String,
        rawOCRText: String
    ) {
        self.id = id
        self.merchantName = merchantName
        self.totalAmount = totalAmount
        self.subtotalAmount = subtotalAmount
        self.purchaseDate = purchaseDate
        self.createdAt = createdAt
        self.category = category
        self.rawOCRText = rawOCRText
    }
}
