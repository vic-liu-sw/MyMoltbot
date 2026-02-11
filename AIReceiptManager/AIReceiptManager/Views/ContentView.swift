//
//  ContentView.swift
//  AIReceiptManager
//
//  Created on 2026-02-11.
//

import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Receipt.createdAt, order: .reverse) private var receipts: [Receipt]
    @State private var showingScanner = false
    @State private var showingAddManual = false
    
    var body: some View {
        NavigationStack {
            List {
                ForEach(receipts) { receipt in
                    NavigationLink(destination: ReceiptDetailView(receipt: receipt)) {
                        ReceiptRowView(receipt: receipt)
                    }
                }
                .onDelete(perform: deleteReceipts)
            }
            .navigationTitle("發票管理")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button {
                            showingScanner = true
                        } label: {
                            Label("掃描發票", systemImage: "camera")
                        }
                        
                        Button {
                            showingAddManual = true
                        } label: {
                            Label("手動新增", systemImage: "plus")
                        }
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingScanner) {
                ScannerView(modelContext: modelContext)
            }
            .sheet(isPresented: $showingAddManual) {
                ManualEntryView(modelContext: modelContext)
            }
            .overlay {
                if receipts.isEmpty {
                    ContentUnavailableView {
                        Label("尚無發票", systemImage: "doc.text.magnifyingglass")
                    } description: {
                        Text("點擊右上角 + 開始掃描或新增發票")
                    }
                }
            }
        }
    }
    
    private func deleteReceipts(at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(receipts[index])
        }
    }
}

struct ReceiptRowView: View {
    let receipt: Receipt
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                if let merchantName = receipt.merchantName {
                    Text(merchantName)
                        .font(.headline)
                } else {
                    Text("未知店家")
                        .font(.headline)
                        .foregroundStyle(.secondary)
                }
                
                Spacer()
                
                if let amount = receipt.amount {
                    Text("NT$ \(amount, specifier: "%.2f")")
                        .font(.headline)
                        .foregroundStyle(.blue)
                }
            }
            
            HStack {
                if let category = receipt.category {
                    Text(category)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.blue.opacity(0.1))
                        .foregroundStyle(.blue)
                        .cornerRadius(4)
                }
                
                if let date = receipt.date {
                    Text(date, style: .date)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    ContentView()
        .modelContainer(for: Receipt.self, inMemory: true)
}
