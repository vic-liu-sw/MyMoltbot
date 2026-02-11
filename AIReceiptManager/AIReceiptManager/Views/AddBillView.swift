import SwiftUI
import SwiftData
import PhotosUI

struct AddBillView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @ObservedObject var viewModel: BillViewModel
    @State private var selectedPhoto: PhotosPickerItem?
    @State private var selectedImage: UIImage?

    var body: some View {
        Form {
            Section("收據影像") {
                PhotosPicker(selection: $selectedPhoto, matching: .images) {
                    Text("選擇照片")
                }

                if let selectedImage {
                    Image(uiImage: selectedImage)
                        .resizable()
                        .scaledToFit()
                        .frame(maxHeight: 220)
                }
            }

            Section {
                Button {
                    Task {
                        guard let selectedImage else { return }
                        await viewModel.processReceipt(image: selectedImage, modelContext: modelContext)
                        if viewModel.errorMessage == nil {
                            dismiss()
                        }
                    }
                } label: {
                    if viewModel.isProcessing {
                        ProgressView()
                    } else {
                        Text("辨識並儲存")
                    }
                }
                .disabled(selectedImage == nil || viewModel.isProcessing)
            }
        }
        .navigationTitle("新增帳單")
        .task(id: selectedPhoto) {
            guard let selectedPhoto,
                  let data = try? await selectedPhoto.loadTransferable(type: Data.self),
                  let image = UIImage(data: data) else { return }
            selectedImage = image
        }
    }
}
