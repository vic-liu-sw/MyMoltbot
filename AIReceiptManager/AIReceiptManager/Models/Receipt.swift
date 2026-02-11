//
//  Receipt.swift
//  AIReceiptManager
//
//  Created on 2026-02-11.
//

import Foundation
import SwiftData

@Model
final class Receipt {
    var id: UUID
    var imageData: Data?
    var recognizedText: String
    var amount: Double?
    var date: Date?
    var merchantName: String?
    var category: String?
    var createdAt: Date
    var notes: String?
    
    init(
        id: UUID = UUID(),
        imageData: Data? = nil,
        recognizedText: String = "",
        amount: Double? = nil,
        date: Date? = nil,
        merchantName: String? = nil,
        category: String? = nil,
        createdAt: Date = Date(),
        notes: String? = nil
    ) {
        self.id = id
        self.imageData = imageData
        self.recognizedText = recognizedText
        self.amount = amount
        self.date = date
        self.merchantName = merchantName
        self.category = category
        self.createdAt = createdAt
        self.notes = notes
    }
}
