//
//  MerchantClassifier.swift
//  AIReceiptManager
//
//  Created on 2026-02-11.
//

import Foundation
import CoreML
import NaturalLanguage

class MerchantClassifier {
    
    // CoreML 模型（需要使用 CreateML 訓練）
    // 這裡提供介面，實際模型需要在 Xcode 中使用 CreateML 建立
    private var model: MLModel?
    
    init() {
        // 嘗試載入 CoreML 模型
        // 實際使用時需要將訓練好的 .mlmodel 檔案加入專案
        // loadModel()
    }
    
    /// 載入 CoreML 模型（需要先使用 CreateML 訓練）
    private func loadModel() {
        // 實際實作時：
        // do {
        //     let config = MLModelConfiguration()
        //     self.model = try MerchantClassifierModel(configuration: config).model
        // } catch {
        //     print("無法載入 CoreML 模型: \(error)")
        // }
    }
    
    /// 分類店家類別
    /// - Parameter text: 發票文字
    /// - Returns: 店家類別
    func classifyMerchant(from text: String) -> String {
        // 如果 CoreML 模型已載入，使用模型預測
        if let model = model {
            return classifyWithCoreML(text: text, model: model)
        }
        
        // Fallback：使用規則式分類（當 CoreML 模型未載入時）
        return classifyWithRules(text: text)
    }
    
    /// 使用 CoreML 模型進行分類
    /// - Parameters:
    ///   - text: 輸入文字
    ///   - model: CoreML 模型
    /// - Returns: 類別名稱
    private func classifyWithCoreML(text: String, model: MLModel) -> String {
        // 實際實作時使用 CoreML 預測
        // 這裡需要根據訓練模型的輸入輸出格式調整
        
        // 範例程式碼（需要根據實際模型調整）：
        // do {
        //     let input = MerchantClassifierModelInput(text: text)
        //     let prediction = try model.prediction(from: input)
        //     return prediction.label
        // } catch {
        //     print("預測失敗: \(error)")
        //     return "其他"
        // }
        
        return "其他"
    }
    
    /// 使用規則式分類（Fallback 方案）
    /// - Parameter text: 發票文字
    /// - Returns: 店家類別
    private func classifyWithRules(text: String) -> String {
        let lowercasedText = text.lowercased()
        
        // 餐飲類
        let foodKeywords = ["餐廳", "restaurant", "cafe", "coffee", "食堂", "buffet", "麥當勞", "肯德基", 
                           "星巴克", "starbucks", "便當", "小吃", "飲料", "茶", "飯店"]
        if foodKeywords.contains(where: { lowercasedText.contains($0) }) {
            return "餐飲"
        }
        
        // 超市/便利商店
        let groceryKeywords = ["超市", "超商", "7-11", "全家", "萊爾富", "ok mart", "家樂福", 
                              "好市多", "costco", "全聯", "便利商店"]
        if groceryKeywords.contains(where: { lowercasedText.contains($0) }) {
            return "超市/便利商店"
        }
        
        // 交通
        let transportKeywords = ["uber", "計程車", "taxi", "捷運", "高鐵", "台鐵", "公車", "停車"]
        if transportKeywords.contains(where: { lowercasedText.contains($0) }) {
            return "交通"
        }
        
        // 購物
        let shoppingKeywords = ["百貨", "商場", "mall", "outlet", "購物", "服飾", "鞋", "包"]
        if shoppingKeywords.contains(where: { lowercasedText.contains($0) }) {
            return "購物"
        }
        
        // 娛樂
        let entertainmentKeywords = ["電影", "cinema", "ktv", "遊樂", "健身", "spa", "按摩"]
        if entertainmentKeywords.contains(where: { lowercasedText.contains($0) }) {
            return "娛樂"
        }
        
        // 醫療
        let medicalKeywords = ["醫院", "診所", "藥局", "pharmacy", "健保"]
        if medicalKeywords.contains(where: { lowercasedText.contains($0) }) {
            return "醫療"
        }
        
        return "其他"
    }
    
    /// 從發票文字中提取店家名稱
    /// - Parameter text: 發票文字
    /// - Returns: 店家名稱
    func extractMerchantName(from text: String) -> String? {
        // 使用 NaturalLanguage 框架找出組織名稱
        let tagger = NLTagger(tagSchemes: [.nameType])
        tagger.string = text
        
        var merchantName: String?
        
        tagger.enumerateTags(in: text.startIndex..<text.endIndex, unit: .word, 
                            scheme: .nameType, options: [.omitWhitespace, .omitPunctuation]) { tag, range in
            if tag == .organizationName {
                merchantName = String(text[range])
                return false // 找到第一個就停止
            }
            return true
        }
        
        if merchantName != nil {
            return merchantName
        }
        
        // Fallback：取第一行非數字開頭的文字作為店家名稱
        let lines = text.components(separatedBy: .newlines)
        for line in lines {
            let trimmed = line.trimmingCharacters(in: .whitespaces)
            if !trimmed.isEmpty && !trimmed.first!.isNumber && trimmed.count > 2 {
                return trimmed
            }
        }
        
        return nil
    }
}
