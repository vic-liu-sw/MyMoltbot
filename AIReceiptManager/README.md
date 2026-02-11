# AIReceiptManager (iOS SwiftUI)

原生 iOS SwiftUI 專案骨架，包含 OCR、Parser、CoreML 分類 wrapper、SwiftData 離線儲存與 Siri Shortcut。

## 需求對應

1. **OCR**
   - `Services/OCRService.swift`
   - 使用 `VNRecognizeTextRequest`
   - `recognitionLevel = .accurate`
   - `recognitionLanguages = ["zh-Hant", "en-US"]`

2. **Parser**
   - `Services/ReceiptParser.swift`
   - Regex 抓 `Total / 總計 / 小計` 後金額
   - `NSDataDetector` 抓日期

3. **Classifier**
   - `Services/ExpenseClassifierService.swift`
   - 已建立 wrapper 與 TODO，等待 `ExpenseClassifier.mlmodel`

4. **Data**
   - `Models/Bill.swift` 使用 `@Model`
   - `App/AIReceiptManagerApp.swift` 使用 SwiftData `ModelContainer`

5. **Siri**
   - `Intents/AddBillIntent.swift`
   - `Intents/AIReceiptShortcuts.swift`
   - 關鍵短語：**「記下這張帳單」**

## 在 Xcode 建立與掛接

> 目前 repo 內已提供完整 Swift 檔案結構。請在 Mac 上用 Xcode 建立 iOS App target 後，把 `AIReceiptManager/AIReceiptManager/` 下的檔案加入 target。

### 建議 Xcode 設定

- iOS Deployment Target: 17+
- Frameworks: SwiftUI, SwiftData, Vision, CoreML, AppIntents, PhotosUI

### CloudKit Capability 勾選步驟

1. 開啟 Target → **Signing & Capabilities**
2. 點 `+ Capability`
3. 加入 **iCloud**
4. 勾選 **CloudKit**
5. Container 可先用預設（如 `iCloud.<bundle-id>`）
6. SwiftData 雲端同步可於後續加上 CloudKit-backed configuration

## 模型接入（待辦）

1. 把 `ExpenseClassifier.mlmodel` 拖進 Xcode 專案
2. 確認勾選 AIReceiptManager target
3. 在 `ExpenseClassifierService.classify` 內解除 TODO，接 generated model class

## 注意

- 本骨架可作為功能起點；若你要我下一步，我可以補：
  - 拍照掃描（相機）
  - 更精準的金額抽取規則
  - CloudKit 同步實作與衝突處理
  - 單元測試
