/**
 * Hướng dẫn sử dụng:
 * 1. Mở file Google Sheet tổng của bạn.
 * 2. Vào Tiện ích mở rộng -> Apps Script.
 * 3. Bấm vào biểu tượng dấu cộng (+) bên trái để tạo một tệp script mới, đặt tên là Scanner.gs
 * 4. Dán toàn bộ đoạn code dưới đây vào.
 * 5. Bấm Lưu (Ctrl + S). Chọn hàm `scanFolderAndSave` trên thanh công cụ và bấm "Chạy" (Run).
 * 6. Lần đầu tiên chạy, hệ thống sẽ yêu cầu bạn cấp quyền truy cập vào Google Drive. Hãy nhấn "Xem xét quyền" và "Cho phép".
 */

function scanFolderAndSave() {
  const folderId = '1HKUJ8knW6qcyyRahjj_oW7tYA8kyGwVv';
  const sheetName = 'Admin';
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  // Nếu chưa có sheet Admin, tạo mới. Nếu có rồi thì xóa trắng dữ liệu cũ.
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  // Tạo tiêu đề cột
  sheet.appendRow(['Tên File (Video)', 'Link Video', 'Đường dẫn thư mục']);
  sheet.getRange('A1:C1').setFontWeight('bold').setBackground('#f3f3f3');
  
  try {
    const rootFolder = DriveApp.getFolderById(folderId);
    const data = [];
    
    // Hàm đệ quy để quét cả thư mục con
    function processFolder(folder, path) {
      const files = folder.getFiles();
      while (files.hasNext()) {
        const file = files.next();
        // Chỉ lấy những file là Video (nếu cần lấy tất cả thì bỏ dòng if này đi)
        if (file.getMimeType().includes('video') || file.getMimeType().includes('mp4')) {
           data.push([file.getName(), file.getUrl(), path]);
        } else if (file.getMimeType() === 'application/vnd.google-apps.folder') {
           // Bỏ qua thư mục
        } else {
           // Vẫn đẩy vào nếu muốn lấy toàn bộ file
           data.push([file.getName(), file.getUrl(), path]);
        }
      }
      
      const subFolders = folder.getFolders();
      while (subFolders.hasNext()) {
        const subFolder = subFolders.next();
        processFolder(subFolder, path + '/' + subFolder.getName());
      }
    }
    
    // Bắt đầu quét từ thư mục gốc
    processFolder(rootFolder, rootFolder.getName());
    
    // Ghi dữ liệu xuống sheet
    if (data.length > 0) {
      sheet.getRange(2, 1, data.length, 3).setValues(data);
      // Tự động căn chỉnh chiều rộng cột
      sheet.autoResizeColumns(1, 3);
      Logger.log("Đã lưu thành công " + data.length + " file vào sheet Admin.");
    } else {
      Logger.log("Không tìm thấy file nào trong thư mục.");
    }
    
  } catch (e) {
    Logger.log("Có lỗi xảy ra: " + e.toString());
  }
}
