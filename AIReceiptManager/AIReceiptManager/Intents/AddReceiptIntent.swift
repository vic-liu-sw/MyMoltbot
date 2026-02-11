//
//  AddReceiptIntent.swift
//  AIReceiptManager
//
//  Created on 2026-02-11.
//

import AppIntents
import SwiftUI
import SwiftData

@available(iOS 16.0, *)
struct AddReceiptIntent: AppIntent {
    static var title: LocalizedStringResource = "記下帳單"
    static var description: IntentDescription = IntentDescription("使用 OCR 掃描並記錄新的發票")
    
    static var openAppWhenRun: Bool = true
    
    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        // 由於 Siri Intent 無法直接存取相機，我們回傳提示訊息引導使用者
        // 實際掃描功能需要在 App 中完成
        
        return .result(dialog: "已開啟 AIReceiptManager，請使用相機掃描發票")
    }
}

// App Shortcuts 配置
@available(iOS 16.0, *)
struct AIReceiptManagerShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AddReceiptIntent(),
            phrases: [
                "嘿 Siri，記下這張帳單",
                "使用 \(.applicationName) 記帳",
                "在 \(.applicationName) 中新增發票",
                "用 \(.applicationName) 掃描發票"
            ],
            shortTitle: "記下帳單",
            systemImageName: "doc.text.viewfinder"
        )
    }
}

// 查詢最近發票的 Intent
@available(iOS 16.0, *)
struct ViewRecentReceiptsIntent: AppIntent {
    static var title: LocalizedStringResource = "查看最近的發票"
    static var description: IntentDescription = IntentDescription("顯示最近記錄的發票")
    
    static var openAppWhenRun: Bool = true
    
    @Parameter(title: "數量")
    var count: Int?
    
    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let limitCount = count ?? 5
        
        // 這裡可以整合 SwiftData 查詢
        // 由於 Intent 的限制，建議在 App 中顯示結果
        
        return .result(dialog: "正在顯示最近 \(limitCount) 筆發票記錄")
    }
}

// 統計支出的 Intent
@available(iOS 16.0, *)
struct GetSpendingSummaryIntent: AppIntent {
    static var title: LocalizedStringResource = "統計支出"
    static var description: IntentDescription = IntentDescription("統計特定時期的支出總額")
    
    @Parameter(title: "時間範圍")
    var period: TimePeriod
    
    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog & ShowsSnippetView {
        // 這裡可以整合實際的 SwiftData 查詢邏輯
        
        let message = "正在統計\(period.rawValue)的支出"
        
        return .result(
            dialog: message,
            view: SpendingSummaryView(period: period)
        )
    }
}

@available(iOS 16.0, *)
enum TimePeriod: String, AppEnum {
    case today = "今天"
    case thisWeek = "本週"
    case thisMonth = "本月"
    case thisYear = "今年"
    
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "時間範圍"
    static var caseDisplayRepresentations: [TimePeriod: DisplayRepresentation] = [
        .today: "今天",
        .thisWeek: "本週",
        .thisMonth: "本月",
        .thisYear: "今年"
    ]
}

// Snippet View for Siri results
@available(iOS 16.0, *)
struct SpendingSummaryView: View {
    let period: TimePeriod
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("\(period.rawValue)支出統計")
                .font(.headline)
            
            HStack {
                Image(systemName: "dollarsign.circle.fill")
                    .foregroundStyle(.green)
                Text("NT$ 0.00")
                    .font(.title2)
                    .bold()
            }
            
            Text("打開 App 查看詳細資訊")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
    }
}
