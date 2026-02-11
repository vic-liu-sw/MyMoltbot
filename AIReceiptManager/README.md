# AIReceiptManager - iOS 發票管理 App

一款功能強大的 iOS 原生發票管理應用程式，使用 SwiftUI 開發，整合 Vision OCR、CoreML、SwiftData 與 CloudKit，支援 Siri 語音指令。

## ✨ 功能特色

### 📸 離線 OCR 掃描
- 使用 Apple Vision 框架的 `VNRecognizeTextRequest` 進行離線文字識別
- 支援繁體中文與英文混合識別
- 高準確度的文字辨識

### 💰 智能解析
- **金額提取**: 使用 Regex 匹配多種金額格式（NT$、NTD、$、總計等）
- **日期提取**: 結合 `NSDataDetector` 和 Regex 識別多種日期格式
  - 西元年: 2024-02-11, 2024/02/11
  - 民國年: 113/02/11
  - 美式格式: 02/11/2024

### 🏪 店家分類
- 整合 CoreML (CreateML Text Classifier) 進行智能分類
- Fallback 規則式分類系統
- 支援類別：餐飲、超市/便利商店、交通、購物、娛樂、醫療、其他
- 使用 `NaturalLanguage` 框架提取店家名稱

### 💾 雲端同步
- 基於 SwiftData 的本地資料持久化
- CloudKit 自動同步（支援跨裝置）
- 離線優先設計

### 🎤 Siri 整合
- **App Intents** 實作
- 支援語音指令：「嘿 Siri，記下這張帳單」
- 快速啟動掃描功能

### 🎨 現代化 UI
- 100% SwiftUI 實作
- 支援淺色/深色模式
- 流暢的動畫與過渡效果
- iPad 多工支援

## 📋 系統需求

- **iOS 17.0+**
- **Xcode 15.0+**
- **Swift 5.9+**
- Apple Developer Account (用於 CloudKit 與 Siri 功能)

## 🏗️ 專案結構

```
AIReceiptManager/
├── AIReceiptManager.xcodeproj/
│   └── project.pbxproj
├── AIReceiptManager/
│   ├── AIReceiptManagerApp.swift      # App 入口點
│   ├── Info.plist                     # App 配置
│   ├── Models/
│   │   └── Receipt.swift              # SwiftData 資料模型
│   ├── Views/
│   │   ├── ContentView.swift          # 主頁面（發票列表）
│   │   ├── ScannerView.swift          # 掃描介面
│   │   ├── ReceiptDetailView.swift    # 發票詳情頁
│   │   └── ManualEntryView.swift      # 手動輸入介面
│   ├── Services/
│   │   ├── OCRService.swift           # Vision OCR 服務
│   │   ├── ReceiptParser.swift        # 金額/日期解析器
│   │   └── MerchantClassifier.swift   # CoreML 店家分類器
│   ├── Intents/
│   │   └── AddReceiptIntent.swift     # Siri App Intents
│   └── Resources/
│       └── Assets.xcassets/           # App 資源
```

## 🚀 快速開始

### 1. Clone 專案

```bash
git clone https://github.com/vic-liu-sw/MyMoltbot.git
cd MyMoltbot/AIReceiptManager
```

### 2. 在 Xcode 中開啟專案

```bash
open AIReceiptManager.xcodeproj
```

### 3. 配置專案設定

#### A. 修改 Bundle Identifier
1. 選擇專案根目錄 `AIReceiptManager`
2. 在 `TARGETS` 中選擇 `AIReceiptManager`
3. 進入 `Signing & Capabilities` 標籤
4. 修改 **Bundle Identifier** 為你的唯一識別碼（例如：`com.yourname.AIReceiptManager`）
5. 選擇你的 **Team**

#### B. 啟用 CloudKit Capability
1. 在 `Signing & Capabilities` 標籤中
2. 點擊 `+ Capability` 按鈕
3. 搜尋並添加 **iCloud**
4. 勾選 **CloudKit**
5. 點擊 `+` 按鈕建立新的 CloudKit Container，或選擇既有的
   - 建議命名：`iCloud.com.yourname.AIReceiptManager`
6. 確認 `Services` 中 **CloudKit** 已勾選

#### C. 啟用 App Groups（可選，用於 Widget 擴充）
1. 點擊 `+ Capability` 按鈕
2. 搜尋並添加 **App Groups**
3. 點擊 `+` 建立新群組
   - 命名格式：`group.com.yourname.AIReceiptManager`

#### D. 配置 Siri & App Intents
1. 點擊 `+ Capability` 按鈕
2. 搜尋並添加 **Siri**
3. 系統會自動配置 App Intents 支援

### 4. 配置 Info.plist 權限

Info.plist 已包含必要的權限描述，但你可以自訂說明文字：

- **NSCameraUsageDescription**: 相機使用說明
- **NSPhotoLibraryUsageDescription**: 相簿讀取說明
- **NSPhotoLibraryAddUsageDescription**: 相簿寫入說明
- **NSSiriUsageDescription**: Siri 使用說明

### 5. 建置並執行

1. 選擇目標裝置（實體裝置或模擬器）
2. 按下 `Cmd + R` 或點擊 Run 按鈕
3. 首次執行會請求相機與相簿權限

## 🧪 CoreML 模型訓練（進階）

專案已包含 Fallback 規則式分類器，但若要使用 CoreML 獲得更好的分類效果，請按照以下步驟：

### 1. 準備訓練資料

建立 CSV 檔案，包含兩個欄位：

```csv
text,label
星巴克咖啡,餐飲
全家便利商店,超市/便利商店
台北捷運,交通
誠品書店,購物
威秀影城,娛樂
台大醫院,醫療
```

### 2. 使用 CreateML 訓練

1. 在 Mac 上開啟 **Create ML** app
2. 建立新的 **Text Classifier** 專案
3. 匯入訓練資料 CSV
4. 設定參數：
   - Algorithm: **Transfer Learning**
   - Language: **Traditional Chinese** 和 **English**
   - Max Iterations: **50-100**
5. 開始訓練
6. 匯出 `.mlmodel` 檔案

### 3. 整合到專案

1. 將訓練好的 `.mlmodel` 拖入 Xcode 專案
2. Xcode 會自動產生 Swift 程式碼
3. 在 `MerchantClassifier.swift` 中取消註解 CoreML 載入程式碼
4. 更新模型名稱為你的模型名稱

```swift
private func loadModel() {
    do {
        let config = MLModelConfiguration()
        self.model = try YourModelName(configuration: config).model
    } catch {
        print("無法載入 CoreML 模型: \(error)")
    }
}
```

## 📱 使用說明

### 掃描發票
1. 點擊右上角 `+` 按鈕
2. 選擇「掃描發票」
3. 使用相機拍攝或從相簿選擇
4. 點擊「處理發票」
5. 系統會自動識別並儲存

### 使用 Siri
對 Siri 說：
- 「嘿 Siri，記下這張帳單」
- 「使用 AIReceiptManager 記帳」
- 「在 AIReceiptManager 中新增發票」

### 查看與編輯
- 點擊任何發票項目查看詳情
- 點擊「編輯」按鈕修改備註
- 使用分享按鈕匯出發票資訊

## 🔧 技術細節

### SwiftData + CloudKit 整合

```swift
let modelConfiguration = ModelConfiguration(
    schema: schema,
    isStoredInMemoryOnly: false,
    cloudKitDatabase: .automatic  // 啟用 CloudKit 同步
)
```

### Vision OCR 設定

```swift
request.recognitionLanguages = ["zh-Hant", "en-US"]
request.recognitionLevel = .accurate
request.usesLanguageCorrection = true
```

### Regex 金額匹配範例

```swift
let patterns = [
    #"(?:NT\$|NTD|[$])\s*([0-9,]+\.?[0-9]*)"#,
    #"(?:總計|合計|小計|金額|Total|Amount)\s*[:：]?\s*[$]?\s*([0-9,]+\.?[0-9]*)"#,
]
```

## 🐛 已知問題與限制

1. **OCR 準確度**: 依賴於圖片品質與光線條件
2. **日期格式**: 某些非標準格式可能無法正確識別
3. **CoreML 模型**: 需要自行訓練或使用規則式 fallback
4. **CloudKit 同步**: 需要使用者登入 iCloud 帳號

## 🔮 未來規劃

- [ ] 匯出報表功能（CSV、PDF）
- [ ] 統計圖表（按類別、時間）
- [ ] Widget 支援（Today Extension）
- [ ] Apple Watch 配套 App
- [ ] 發票掃描歷史記錄
- [ ] 批次處理多張發票
- [ ] 語音輸入金額功能
- [ ] 整合發票載具條碼掃描

## 🤝 貢獻指南

歡迎提交 Issue 或 Pull Request！

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 👨‍💻 作者

**Victor Liu**

## 🙏 致謝

- Apple Vision Framework
- Apple SwiftData & CloudKit
- Apple CreateML
- SwiftUI Community

## 📞 聯絡方式

如有問題或建議，請開啟 [Issue](https://github.com/vic-liu-sw/MyMoltbot/issues)

---

**享受更智能的發票管理體驗！📱💰**
