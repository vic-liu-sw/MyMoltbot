//
//  ReceiptParser.swift
//  AIReceiptManager
//
//  Created on 2026-02-11.
//

import Foundation

class ReceiptParser {
    
    /// 解析發票文字，提取金額和日期
    /// - Parameter text: OCR 識別的原始文字
    /// - Returns: 包含金額和日期的元組
    func parse(text: String) -> (amount: Double?, date: Date?) {
        let amount = extractAmount(from: text)
        let date = extractDate(from: text)
        return (amount, date)
    }
    
    /// 使用 Regex 提取金額
    /// - Parameter text: 原始文字
    /// - Returns: 金額（Double）
    private func extractAmount(from text: String) -> Double? {
        // 匹配模式：
        // 1. NT$ 123.45 或 NTD 123.45
        // 2. $ 123.45
        // 3. 總計 123.45 或 合計 123.45
        // 4. Total 123.45
        // 5. 純數字（可能包含逗號）: 1,234.56 or 1234.56
        
        let patterns = [
            #"(?:NT\$|NTD|[$])\s*([0-9,]+\.?[0-9]*)"#,
            #"(?:總計|合計|小計|金額|Total|Amount|TOTAL)\s*[:：]?\s*[$]?\s*([0-9,]+\.?[0-9]*)"#,
            #"\b([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)\b"#,
            #"\b([0-9]+\.[0-9]{2})\b"#
        ]
        
        for pattern in patterns {
            if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) {
                let nsString = text as NSString
                let matches = regex.matches(in: text, range: NSRange(location: 0, length: nsString.length))
                
                for match in matches {
                    if match.numberOfRanges > 1 {
                        let range = match.range(at: 1)
                        let amountString = nsString.substring(with: range)
                        let cleanedString = amountString.replacingOccurrences(of: ",", with: "")
                        
                        if let amount = Double(cleanedString), amount > 0 && amount < 1_000_000 {
                            return amount
                        }
                    }
                }
            }
        }
        
        return nil
    }
    
    /// 使用 NSDataDetector 提取日期
    /// - Parameter text: 原始文字
    /// - Returns: 日期（Date）
    private func extractDate(from text: String) -> Date? {
        do {
            let detector = try NSDataDetector(types: NSTextCheckingResult.CheckingType.date.rawValue)
            let matches = detector.matches(in: text, range: NSRange(location: 0, length: text.utf16.count))
            
            // 尋找最近的日期（不超過今天）
            let today = Date()
            var closestDate: Date?
            
            for match in matches {
                if let date = match.date, date <= today {
                    if closestDate == nil || abs(date.timeIntervalSince(today)) < abs(closestDate!.timeIntervalSince(today)) {
                        closestDate = date
                    }
                }
            }
            
            if closestDate != nil {
                return closestDate
            }
            
            // 如果 NSDataDetector 沒找到，使用額外的 Regex 匹配台灣常見格式
            return extractDateWithRegex(from: text)
            
        } catch {
            print("日期檢測器建立失敗: \(error)")
            return extractDateWithRegex(from: text)
        }
    }
    
    /// 使用 Regex 提取台灣常見的日期格式
    /// - Parameter text: 原始文字
    /// - Returns: 日期（Date）
    private func extractDateWithRegex(from text: String) -> Date? {
        // 匹配格式：
        // 1. 2024-02-11, 2024/02/11, 2024.02.11
        // 2. 113/02/11 (民國年)
        // 3. 02/11/2024
        
        let patterns = [
            (#"(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})"#, "yyyy-MM-dd"),
            (#"(\d{3})[-/.](\d{1,2})[-/.](\d{1,2})"#, "roc"), // 民國年
            (#"(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})"#, "MM-dd-yyyy")
        ]
        
        for (pattern, format) in patterns {
            if let regex = try? NSRegularExpression(pattern: pattern) {
                let nsString = text as NSString
                let matches = regex.matches(in: text, range: NSRange(location: 0, length: nsString.length))
                
                for match in matches {
                    if match.numberOfRanges > 3 {
                        let year = nsString.substring(with: match.range(at: 1))
                        let month = nsString.substring(with: match.range(at: 2))
                        let day = nsString.substring(with: match.range(at: 3))
                        
                        if format == "roc" {
                            // 民國年轉西元年
                            if let rocYear = Int(year), let m = Int(month), let d = Int(day) {
                                let westernYear = rocYear + 1911
                                let dateString = String(format: "%04d-%02d-%02d", westernYear, m, d)
                                let formatter = DateFormatter()
                                formatter.dateFormat = "yyyy-MM-dd"
                                if let date = formatter.date(from: dateString) {
                                    return date
                                }
                            }
                        } else {
                            let formatter = DateFormatter()
                            formatter.dateFormat = format
                            let dateString: String
                            
                            if format == "MM-dd-yyyy" {
                                dateString = "\(month)-\(day)-\(year)"
                            } else {
                                dateString = "\(year)-\(month)-\(day)"
                            }
                            
                            if let date = formatter.date(from: dateString) {
                                return date
                            }
                        }
                    }
                }
            }
        }
        
        return nil
    }
}
