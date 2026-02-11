import Foundation
import SwiftData
import UIKit

@MainActor
final class BillViewModel: ObservableObject {
    @Published var isProcessing = false
    @Published var errorMessage: String?

    private let ocrService = OCRService()
    private let parser = ReceiptParser()
    private let classifier = ExpenseClassifierService()

    func processReceipt(image: UIImage, modelContext: ModelContext) async {
        isProcessing = true
        defer { isProcessing = false }

        do {
            let text = try await ocrService.recognizeText(from: image)
            let parsed = parser.parse(from: text)

            let category: String
            do {
                category = try classifier.classify(merchantName: parsed.merchantName, receiptText: parsed.rawText)
            } catch {
                // 模型尚未配置時，先給 fallback
                category = "Uncategorized"
            }

            let bill = Bill(
                merchantName: parsed.merchantName,
                totalAmount: parsed.totalAmount ?? 0,
                subtotalAmount: parsed.subtotalAmount,
                purchaseDate: parsed.purchaseDate,
                category: category,
                rawOCRText: parsed.rawText
            )

            modelContext.insert(bill)
            try modelContext.save()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
