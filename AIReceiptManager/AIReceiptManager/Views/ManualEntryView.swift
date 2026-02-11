//
//  ManualEntryView.swift
//  AIReceiptManager
//
//  Created on 2026-02-11.
//

import SwiftUI
import SwiftData

struct ManualEntryView: View {
    @Environment(\.dismiss) private var dismiss
    let modelContext: ModelContext
    
    @State private var merchantName = ""
    @State private var amount = ""
    @State private var date = Date()
    @State private var category = "其他"
    @State private var notes = ""
    
    let categories = ["餐飲", "超市/便利商店", "交通", "購物", "娛樂", "醫療", "其他"]
    
    var body: some View {
        NavigationStack {
            Form {
                Section("基本資訊") {
                    TextField("店家名稱", text: $merchantName)
                    
                    TextField("金額", text: $amount)
                        .keyboardType(.decimalPad)
                    
                    DatePicker("日期", selection: $date, displayedComponents: .date)
                    
                    Picker("類別", selection: $category) {
                        ForEach(categories, id: \.self) { category in
                            Text(category)
                        }
                    }
                }
                
                Section("備註") {
                    TextField("備註", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("手動新增發票")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("儲存") {
                        saveReceipt()
                    }
                    .disabled(merchantName.isEmpty || amount.isEmpty)
                }
            }
        }
    }
    
    private func saveReceipt() {
        guard let amountValue = Double(amount) else { return }
        
        let receipt = Receipt(
            recognizedText: "手動輸入",
            amount: amountValue,
            date: date,
            merchantName: merchantName.isEmpty ? nil : merchantName,
            category: category,
            notes: notes.isEmpty ? nil : notes
        )
        
        modelContext.insert(receipt)
        try? modelContext.save()
        
        dismiss()
    }
}

#Preview {
    ManualEntryView(modelContext: ModelContext(
        try! ModelContainer(for: Receipt.self, configurations: ModelConfiguration(isStoredInMemoryOnly: true))
    ))
}
