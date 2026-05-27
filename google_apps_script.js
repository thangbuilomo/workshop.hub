// Tên các sheet trong file Google Sheet của bạn
const SHEET_NAMES = {
  ACCOUNT: 'Account',
  TASK1: 'task1',
  TASK2: 'task2',
  READING: 'reading',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  OTHER: 'other'
};

function doGet(e) {  
  var action = e.parameter.action;
  
  try {
    if (action === 'login') {
      return handleLogin(e.parameter.username, e.parameter.password);
    } else if (action === 'getData') {
      return handleGetData();
    } else {
      return createJsonResponse({ status: 'error', message: 'Hành động không hợp lệ' });
    }
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function handleLogin(username, password) {
  if (!username || !password) {
    return createJsonResponse({ status: 'error', message: 'Vui lòng nhập tài khoản và mật khẩu' });
  }
  
  username = username.toString().trim().toLowerCase();
  password = password.toString().trim();
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.ACCOUNT);
  
  if (!sheet) {
    return createJsonResponse({ status: 'error', message: 'Lỗi hệ thống: Không tìm thấy Sheet Account' });
  }
  
  var data = sheet.getDataRange().getValues();
  // Giả sử dòng 1 là tiêu đề: Email | Student ID | Mật khẩu | Lớp/Khóa học | Trạng thái
  for (var i = 1; i < data.length; i++) {
    var email = data[i][0].toString().trim().toLowerCase();
    var studentId = data[i][1].toString().trim().toLowerCase();
    var sheetPassword = data[i][2].toString().trim();
    var status = data[i][4].toString().trim();
    
    if ((username === email || username === studentId) && password === sheetPassword) {
      if (status.toLowerCase() !== 'đang học') {
         return createJsonResponse({ 
           status: 'error', 
           message: 'Tài khoản của bạn đang bị khóa hoặc hết hạn. Vui lòng liên hệ giáo viên để được hỗ trợ.' 
         });
      }
      
      // Đăng nhập thành công
      return createJsonResponse({ 
        status: 'success', 
        data: {
          email: data[i][0],
          studentId: data[i][1],
          course: data[i][3]
        }
      });
    }
  }
  
  return createJsonResponse({ status: 'error', message: 'Sai thông tin tài khoản hoặc mật khẩu. Vui lòng thử lại.' });
}

function handleGetData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {};
  
  var sheetsToFetch = [
    SHEET_NAMES.TASK1, 
    SHEET_NAMES.TASK2, 
    SHEET_NAMES.READING, 
    SHEET_NAMES.LISTENING, 
    SHEET_NAMES.SPEAKING, 
    SHEET_NAMES.OTHER,
    'Admin'
  ];
  
  sheetsToFetch.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      result[sheetName] = sheetToJson(sheet);
    } else {
      result[sheetName] = []; // Nếu chưa tạo sheet thì trả về mảng rỗng tránh lỗi
    }
  });
  
  return createJsonResponse({ status: 'success', data: result });
}

// Hàm phụ trợ chuyển đổi dữ liệu từ dạng bảng sang dạng JSON (Array of Objects)
function sheetToJson(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; 
  
  var headers = data[0];
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      // Map tên cột với dữ liệu tương ứng
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  
  return result;
}

function createJsonResponse(responseObject) {
  return ContentService.createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
}
