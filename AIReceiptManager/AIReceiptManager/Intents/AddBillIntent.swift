import AppIntents

struct AddBillIntent: AppIntent {
    static var title: LocalizedStringResource = "記下這張帳單"
    static var description = IntentDescription("快速開啟 AIReceiptManager 來記錄新帳單")

    static var openAppWhenRun: Bool = true

    func perform() async throws -> some IntentResult {
        .result(dialog: "已為你打開 AIReceiptManager，請選擇收據照片。")
    }
}
