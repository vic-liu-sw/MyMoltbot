//
//  ScannerView.swift
//  AIReceiptManager
//
//  Created on 2026-02-11.
//

import SwiftUI
import SwiftData
import PhotosUI

struct ScannerView: View {
    @Environment(\.dismiss) private var dismiss
    let modelContext: ModelContext
    
    @State private var selectedItem: PhotosPickerItem?
    @State private var selectedImage: UIImage?
    @State private var isProcessing = false
    @State private var showingCamera = false
    @State private var errorMessage: String?
    
    private let ocrService = OCRService()
    private let parser = ReceiptParser()
    private let classifier = MerchantClassifier()
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                if let image = selectedImage {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                        .frame(maxHeight: 400)
                        .cornerRadius(12)
                        .shadow(radius: 4)
                } else {
                    Image(systemName: "doc.text.viewfinder")
                        .font(.system(size: 100))
                        .foregroundStyle(.secondary)
                        .padding()
                }
                
                if isProcessing {
                    ProgressView("正在處理...")
                        .padding()
                } else if selectedImage == nil {
                    VStack(spacing: 16) {
                        Button {
                            showingCamera = true
                        } label: {
                            Label("拍攝發票", systemImage: "camera.fill")
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue)
                                .foregroundStyle(.white)
                                .cornerRadius(10)
                        }
                        
                        PhotosPicker(selection: $selectedItem, matching: .images) {
                            Label("從相簿選擇", systemImage: "photo.on.rectangle")
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue.opacity(0.1))
                                .foregroundStyle(.blue)
                                .cornerRadius(10)
                        }
                    }
                    .padding(.horizontal)
                } else {
                    Button {
                        Task {
                            await processReceipt()
                        }
                    } label: {
                        Label("處理發票", systemImage: "checkmark.circle.fill")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .foregroundStyle(.white)
                            .cornerRadius(10)
                    }
                    .padding(.horizontal)
                }
                
                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundStyle(.red)
                        .font(.caption)
                        .padding()
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle("掃描發票")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") {
                        dismiss()
                    }
                }
            }
            .onChange(of: selectedItem) { oldValue, newValue in
                Task {
                    if let data = try? await newValue?.loadTransferable(type: Data.self),
                       let uiImage = UIImage(data: data) {
                        selectedImage = uiImage
                    }
                }
            }
            .fullScreenCover(isPresented: $showingCamera) {
                CameraView { image in
                    selectedImage = image
                    showingCamera = false
                }
            }
        }
    }
    
    private func processReceipt() async {
        guard let image = selectedImage else { return }
        
        isProcessing = true
        errorMessage = nil
        
        do {
            // 步驟 1: OCR 識別
            let recognizedText = try await ocrService.recognizeText(from: image)
            
            // 步驟 2: 解析金額和日期
            let (amount, date) = parser.parse(text: recognizedText)
            
            // 步驟 3: 分類店家
            let category = classifier.classifyMerchant(from: recognizedText)
            let merchantName = classifier.extractMerchantName(from: recognizedText)
            
            // 步驟 4: 儲存到 SwiftData
            let imageData = image.jpegData(compressionQuality: 0.8)
            
            let receipt = Receipt(
                imageData: imageData,
                recognizedText: recognizedText,
                amount: amount,
                date: date,
                merchantName: merchantName,
                category: category
            )
            
            modelContext.insert(receipt)
            try modelContext.save()
            
            isProcessing = false
            dismiss()
            
        } catch {
            isProcessing = false
            errorMessage = "處理失敗: \(error.localizedDescription)"
        }
    }
}

// 相機視圖（簡化版）
struct CameraView: UIViewControllerRepresentable {
    let onCapture: (UIImage) -> Void
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(onCapture: onCapture)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let onCapture: (UIImage) -> Void
        
        init(onCapture: @escaping (UIImage) -> Void) {
            self.onCapture = onCapture
        }
        
        func imagePickerController(_ picker: UIImagePickerController, 
                                  didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                onCapture(image)
            }
            picker.dismiss(animated: true)
        }
    }
}

#Preview {
    ScannerView(modelContext: ModelContext(
        try! ModelContainer(for: Receipt.self, configurations: ModelConfiguration(isStoredInMemoryOnly: true))
    ))
}
