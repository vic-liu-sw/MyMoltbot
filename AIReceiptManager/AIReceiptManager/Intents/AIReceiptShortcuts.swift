import AppIntents

struct AIReceiptShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        [
            AppShortcut(
                intent: AddBillIntent(),
                phrases: [
                    "記下這張帳單",
                    "用 \(.applicationName) 記下這張帳單"
                ],
                shortTitle: "記下帳單",
                systemImageName: "doc.text.viewfinder"
            )
        ]
    }
}
