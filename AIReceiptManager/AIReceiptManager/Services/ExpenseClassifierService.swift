import Foundation
import CoreML

enum ExpenseClassifierError: Error, LocalizedError {
    case modelNotConfigured

    var errorDescription: String? {
        switch self {
        case .modelNotConfigured:
            return "ExpenseClassifier.mlmodel 尚未加入專案。請先將模型拖入 Xcode Target。"
        }
    }
}

/// CoreML Text Classifier wrapper（先保留接口，模型可後續接入）
final class ExpenseClassifierService {
    func classify(merchantName: String, receiptText: String) throws -> String {
        // TODO: 接入 ExpenseClassifier.mlmodel 的 generated class
        // Example:
        // let model = try ExpenseClassifier(configuration: MLModelConfiguration())
        // let prediction = try model.prediction(text: "\(merchantName) \(receiptText)")
        // return prediction.label
        throw ExpenseClassifierError.modelNotConfigured
    }
}
