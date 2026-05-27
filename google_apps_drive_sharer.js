/**
 * Hướng dẫn sử dụng:
 * 1. Mở file Google Sheet tổng của bạn.
 * 2. Vào Tiện ích mở rộng -> Apps Script.
 * 3. Tạo một file script mới (ví dụ đặt tên là Sharer.gs).
 * 4. Dán toàn bộ đoạn code dưới đây vào.
 * 5. Bấm Lưu (Ctrl + S). Chọn hàm `makeFolderDownloadable` trên thanh công cụ và bấm "Chạy" (Run).
 * 6. Đợi script chạy xong (nó sẽ duyệt qua từng file để mở khóa tính năng tải xuống).
 */

function makeFolderDownloadable() {
  const folderId = '1HKUJ8knW6qcyyRahjj_oW7tYA8kyGwVv';
  
  try {
    const rootFolder = DriveApp.getFolderById(folderId);
    
    // 1. Đặt quyền cho thư mục gốc: Bất kỳ ai có link đều có thể Xem
    rootFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    Logger.log("Đã mở quyền Xem cho thư mục gốc.");
    
    function processFolder(folder) {
      // Đặt quyền cho các file trong thư mục
      const files = folder.getFiles();
      while (files.hasNext()) {
        const file = files.next();
        const fileId = file.getId();
        
        // A. Cấp quyền Xem (VIEW) cho bất kỳ ai có liên kết
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        // B. Mở khóa chặn Download/Copy/Print (sử dụng API Drive v3)
        try {
          allowDownload(fileId);
          Logger.log("Đã mở khóa tải xuống cho file: " + file.getName());
        } catch (apiError) {
          Logger.log("Lỗi mở khóa tải cho file " + file.getName() + ": " + apiError.toString());
        }
      }
      
      // Quét tiếp các thư mục con (đệ quy)
      const subFolders = folder.getFolders();
      while (subFolders.hasNext()) {
        const subFolder = subFolders.next();
        subFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        processFolder(subFolder);
      }
    }
    
    processFolder(rootFolder);
    Logger.log("HOÀN THÀNH! Toàn bộ file đã được cấu hình cho phép tải xuống công khai.");
    
  } catch (e) {
    Logger.log("Lỗi hệ thống: " + e.toString());
  }
}

// Hàm gửi request PATCH tới API Google Drive để bỏ thuộc tính chặn copy/download
function allowDownload(fileId) {
  const url = "https://www.googleapis.com/drive/v3/files/" + fileId;
  
  const params = {
    method: "patch",
    contentType: "application/json",
    payload: JSON.stringify({
      "copyRequiresWriterPermission": false
    }),
    headers: {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken()
    },
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch(url, params);
  const responseCode = response.getResponseCode();
  
  // Nếu gặp lỗi token hoặc API chưa được cấp quyền
  if (responseCode !== 200) {
    throw new Error("HTTP " + responseCode + ": " + response.getContentText());
  }
}
