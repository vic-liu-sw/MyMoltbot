import SwiftUI
import SwiftData

struct BillListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Bill.createdAt, order: .reverse) private var bills: [Bill]
    @StateObject private var viewModel = BillViewModel()

    var body: some View {
        NavigationStack {
            List {
                ForEach(bills) { bill in
                    VStack(alignment: .leading, spacing: 6) {
                        Text(bill.merchantName)
                            .font(.headline)

                        Text("金額：\(bill.totalAmount.formatted(.currency(code: "TWD")))")
                            .font(.subheadline)

                        if let date = bill.purchaseDate {
                            Text("日期：\(date.formatted(date: .numeric, time: .omitted))")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }

                        Text("分類：\(bill.category)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle("AIReceiptManager")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink("新增") {
                        AddBillView(viewModel: viewModel)
                    }
                }
            }
            .alert("錯誤", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("確定") { viewModel.errorMessage = nil }
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
        }
    }
}

#Preview {
    BillListView()
}
