# Xcode 配置指南

本文檔詳細說明如何在 Xcode 中配置 AIReceiptManager 專案的所有必要設定。

## 📋 目錄

1. [基本專案設定](#基本專案設定)
2. [CloudKit 配置](#cloudkit-配置)
3. [Siri & App Intents 配置](#siri--app-intents-配置)
4. [權限配置](#權限配置)
5. [Build Settings](#build-settings)
6. [常見問題](#常見問題)

---

## 基本專案設定

### 1. 開啟專案

```bash
cd AIReceiptManager
open AIReceiptManager.xcodeproj
```

### 2. 配置 Signing & Capabilities

1. 在 Xcode 左側專案導覽器中，選擇最上層的 **AIReceiptManager** 專案
2. 在 `TARGETS` 區域選擇 **AIReceiptManager**
3. 選擇 **Signing & Capabilities** 標籤

### 3. 設定 Team 與 Bundle Identifier

**重要**: 必須修改 Bundle Identifier 為唯一值！

```
原始值: com.yourcompany.AIReceiptManager
修改為: com.[你的名字].AIReceiptManager
```

範例：
```
com.victorliu.AIReceiptManager
com.johnsmith.AIReceiptManager
```

步驟：
1. 在 **Signing** 區域
2. 勾選 **Automatically manage signing**
3. 從下拉選單選擇你的 **Team**
   - 如果沒有 Team，需要在 Xcode > Preferences > Accounts 中添加 Apple ID
4. 修改 **Bundle Identifier**

---

## CloudKit 配置

### 為什麼需要 CloudKit？

CloudKit 讓你的發票資料可以在 iPhone、iPad 之間自動同步。

### 步驟 1: 添加 iCloud Capability

1. 在 **Signing & Capabilities** 標籤
2. 點擊左上角 **+ Capability** 按鈕
3. 在搜尋框輸入 "iCloud"
4. 雙擊添加 **iCloud**

### 步驟 2: 配置 CloudKit

添加後會看到 iCloud 設定區域：

1. 勾選 **CloudKit**
2. 在 **Containers** 區域：
   - 點擊 **+** 按鈕
   - 選擇 **Create a new CloudKit container**
   - 命名格式：`iCloud.com.[你的名字].AIReceiptManager`
   
範例：
```
iCloud.com.victorliu.AIReceiptManager
```

3. 確認 Container 已被選中（勾選框打勾）

### 步驟 3: 驗證 CloudKit 設定

在 **AIReceiptManagerApp.swift** 中，確認以下程式碼：

```swift
let modelConfiguration = ModelConfiguration(
    schema: schema,
    isStoredInMemoryOnly: false,
    cloudKitDatabase: .automatic  // ← 這行啟用 CloudKit
)
```

`.automatic` 會自動使用預設的 CloudKit Container。

### CloudKit Dashboard（可選）

1. 訪問 [CloudKit Dashboard](https://icloud.developer.apple.com/dashboard/)
2. 選擇你的 Container
3. 查看資料結構（SwiftData 會自動建立 Schema）

---

## Siri & App Intents 配置

### 步驟 1: 添加 Siri Capability

1. 在 **Signing & Capabilities** 標籤
2. 點擊 **+ Capability**
3. 搜尋 "Siri"
4. 添加 **Siri**

### 步驟 2: 確認 Info.plist 設定

在 **Info.plist** 中應該已包含：

```xml
<key>NSSiriUsageDescription</key>
<string>使用 Siri 快速記錄發票</string>
```

如果沒有，請手動添加：

1. 右鍵 **Info.plist** > Open As > Source Code
2. 在 `<dict>` 標籤內添加上述內容

### 步驟 3: 測試 Siri 快捷指令

在實體裝置上（模擬器不支援 Siri）：

1. 執行 App 至少一次
2. 對 Siri 說：「嘿 Siri，記下這張帳單」
3. 如果第一次使用，Siri 會請求權限

### App Shortcuts 配置

在 **AddReceiptIntent.swift** 中已定義：

```swift
struct AIReceiptManagerShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AddReceiptIntent(),
            phrases: [
                "嘿 Siri，記下這張帳單",
                "使用 \(.applicationName) 記帳",
                // 更多短語...
            ]
        )
    }
}
```

你可以自訂更多短語！

---

## 權限配置

### 必要權限

AIReceiptManager 需要以下權限（已在 Info.plist 中配置）：

#### 1. 相機權限
```xml
<key>NSCameraUsageDescription</key>
<string>需要使用相機來掃描發票</string>
```

#### 2. 相簿讀取權限
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>需要存取相簿來選擇發票照片</string>
```

#### 3. 相簿寫入權限
```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>需要儲存掃描的發票照片到相簿</string>
```

#### 4. Siri 權限
```xml
<key>NSSiriUsageDescription</key>
<string>使用 Siri 快速記錄發票</string>
```

### 自訂權限說明

你可以修改這些說明文字讓使用者更容易理解：

1. 在 Xcode 中打開 **Info.plist**
2. 找到對應的 Key
3. 修改 Value 欄位的文字

---

## Build Settings

### 最低部署版本

專案需要 **iOS 17.0** 或更高版本（因為使用了 SwiftData）。

確認設定：
1. 選擇專案 > **Build Settings** 標籤
2. 搜尋 "iOS Deployment Target"
3. 確認值為 **17.0** 或更高

### Swift 版本

確認使用 **Swift 5.9** 或更高：

1. **Build Settings** 標籤
2. 搜尋 "Swift Language Version"
3. 確認為 **Swift 5**

---

## 常見問題

### Q1: CloudKit 同步不工作？

**檢查事項：**
1. ✅ 確認裝置已登入 iCloud 帳號（設定 > [你的名字]）
2. ✅ 確認 iCloud Drive 已開啟
3. ✅ 確認 App 的 iCloud Capability 已正確配置
4. ✅ 確認網路連接正常

**除錯步驟：**
```swift
// 在 AIReceiptManagerApp.swift 的 init() 中加入
do {
    let container = try ModelContainer(for: schema, configurations: [modelConfiguration])
    print("✅ SwiftData container 建立成功")
} catch {
    print("❌ SwiftData container 建立失敗: \(error)")
}
```

### Q2: Siri 無法識別指令？

**可能原因：**
1. 使用模擬器（模擬器不支援 Siri）
2. 裝置語言設定與 Siri 語言不一致
3. App 尚未執行過（需要先執行一次註冊 Intent）

**解決方法：**
1. 使用實體裝置測試
2. 設定 > Siri 與搜尋 > 語言：選擇「繁體中文」
3. 執行 App 至少一次
4. 重新啟動裝置

### Q3: OCR 識別率低？

**改善建議：**
1. 確保光線充足
2. 發票平整、無折痕
3. 對焦清晰
4. 嘗試不同角度拍攝

**程式碼調整：**

在 `OCRService.swift` 中：

```swift
// 提高識別等級
request.recognitionLevel = .accurate  // 已是最高等級

// 添加更多語言支援
request.recognitionLanguages = ["zh-Hant", "zh-Hans", "en-US", "ja-JP"]

// 啟用語言校正
request.usesLanguageCorrection = true  // 已啟用
```

### Q4: Bundle Identifier 衝突？

**錯誤訊息：**
```
An App ID with Identifier 'com.yourcompany.AIReceiptManager' is not available.
```

**解決方法：**
修改為唯一的 Bundle Identifier：
```
com.[你的 GitHub 用戶名].AIReceiptManager
com.[你的公司/個人網域].AIReceiptManager
```

### Q5: Team 選項是空的？

**原因：**
沒有添加 Apple ID 到 Xcode。

**解決方法：**
1. Xcode > Preferences (Cmd + ,)
2. Accounts 標籤
3. 點擊左下角 **+** 按鈕
4. 選擇 **Apple ID**
5. 登入你的 Apple ID
6. 返回專案設定，Team 下拉選單會出現你的帳號

### Q6: CoreML 模型載入失敗？

**錯誤訊息：**
```
無法載入 CoreML 模型: [錯誤訊息]
```

**原因：**
專案預設使用 Fallback 規則式分類，沒有實際的 `.mlmodel` 檔案。

**解決方法：**
1. **選項 A**: 繼續使用規則式分類（已足夠應付一般使用）
2. **選項 B**: 按照 README 中的 "CoreML 模型訓練" 章節建立並整合模型

---

## 部署到實體裝置

### 步驟 1: 連接裝置

1. 用 USB 連接 iPhone/iPad 到 Mac
2. 在裝置上信任此電腦
3. Xcode 工具列會顯示你的裝置

### 步驟 2: 選擇裝置

點擊 Xcode 工具列的裝置選擇器，選擇你的實體裝置。

### 步驟 3: 建置並執行

按下 **Cmd + R** 或點擊 Run 按鈕 (▶️)

### 步驟 4: 信任開發者

首次執行時，裝置會顯示：
```
"AIReceiptManager" 來自未受信任的開發者
```

解決方法：
1. 設定 > 一般 > VPN 與裝置管理
2. 找到你的開發者帳號
3. 點擊「信任」

---

## 除錯技巧

### 啟用詳細日誌

在各個 Service 檔案中添加 print 語句：

```swift
// OCRService.swift
print("🔍 開始 OCR 識別")
print("📄 識別結果: \(recognizedText)")

// ReceiptParser.swift
print("💰 解析金額: \(amount ?? 0)")
print("📅 解析日期: \(date?.description ?? "無")")

// MerchantClassifier.swift
print("🏪 店家類別: \(category)")
```

### 使用 Xcode Console

執行 App 後，開啟 Console (Cmd + Shift + Y) 查看所有日誌輸出。

---

## 總結檢查清單

部署前確認：

- [ ] Bundle Identifier 已修改為唯一值
- [ ] Team 已選擇
- [ ] iCloud Capability 已添加
- [ ] CloudKit Container 已建立並選中
- [ ] Siri Capability 已添加
- [ ] Info.plist 權限說明已配置
- [ ] 部署目標為 iOS 17.0+
- [ ] 在實體裝置上測試過

---

**設定完成！🎉 開始使用 AIReceiptManager 吧！**

如有問題，請參考主 [README.md](README.md) 或開啟 [Issue](https://github.com/vic-liu-sw/MyMoltbot/issues)。
