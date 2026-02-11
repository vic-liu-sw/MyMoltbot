//
//  ReceiptDetailView.swift
//  AIReceiptManager
//
//  Created on 2026-02-11.
//

import SwiftUI
import SwiftData

struct ReceiptDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Bindable var receipt: Receipt
    @State private var isEditing = false
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // 圖片預覽
                if let imageData = receipt.imageData,
                   let uiImage = UIImage(data: imageData) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFit()
                        .cornerRadius(12)
                        .shadow(radius: 4)
                }
                
                // 基本資訊
                GroupBox {
                    VStack(alignment: .leading, spacing: 12) {
                        DetailRow(title: "店家名稱", value: receipt.merchantName ?? "未知")
                        
                        if let amount = receipt.amount {
                            DetailRow(title: "金額", value: "NT$ \(amount, specifier: "%.2f")")
                        }
                        
                        if let date = receipt.date {
                            DetailRow(title: "日期", value: date.formatted(date: .long, time: .omitted))
                        }
                        
                        if let category = receipt.category {
                            DetailRow(title: "類別", value: category)
                        }
                        
                        DetailRow(title: "建立時間", value: receipt.createdAt.formatted(date: .long, time: .shortened))
                    }
                } label: {
                    Label("基本資訊", systemImage: "info.circle")
                }
                
                // 備註
                GroupBox {
                    if isEditing {
                        TextField("備註", text: Binding(
                            get: { receipt.notes ?? "" },
                            set: { receipt.notes = $0.isEmpty ? nil : $0 }
                        ), axis: .vertical)
                        .textFieldStyle(.roundedBorder)
                        .lineLimit(5...10)
                    } else {
                        Text(receipt.notes ?? "無備註")
                            .foregroundStyle(receipt.notes == nil ? .secondary : .primary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                } label: {
                    Label("備註", systemImage: "note.text")
                }
                
                // OCR 原始文字
                GroupBox {
                    ScrollView {
                        Text(receipt.recognizedText)
                            .font(.system(.body, design: .monospaced))
                            .textSelection(.enabled)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .frame(maxHeight: 200)
                } label: {
                    Label("辨識文字", systemImage: "doc.text")
                }
            }
            .padding()
        }
        .navigationTitle("發票詳情")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(isEditing ? "完成" : "編輯") {
                    isEditing.toggle()
                    if !isEditing {
                        try? modelContext.save()
                    }
                }
            }
            
            ToolbarItem(placement: .secondaryAction) {
                ShareLink(item: generateShareText(), preview: SharePreview("分享發票"))
            }
        }
    }
    
    private func generateShareText() -> String {
        var text = "發票資訊\n"
        text += "─────────\n"
        if let merchant = receipt.merchantName {
            text += "店家: \(merchant)\n"
        }
        if let amount = receipt.amount {
            text += "金額: NT$ \(String(format: "%.2f", amount))\n"
        }
        if let date = receipt.date {
            text += "日期: \(date.formatted(date: .long, time: .omitted))\n"
        }
        if let category = receipt.category {
            text += "類別: \(category)\n"
        }
        if let notes = receipt.notes {
            text += "備註: \(notes)\n"
        }
        return text
    }
}

struct DetailRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .bold()
        }
    }
}

#Preview {
    NavigationStack {
        ReceiptDetailView(receipt: Receipt(
            recognizedText: "測試發票\n總計: NT$ 150\n2024-02-11",
            amount: 150.0,
            date: Date(),
            merchantName: "測試商店",
            category: "餐飲"
        ))
    }
    .modelContainer(for: Receipt.self, inMemory: true)
}
