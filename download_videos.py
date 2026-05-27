import sys
import os
import io
import re
import json
import time
import requests

# Đảm bảo mã hóa UTF-8 khi chạy trên terminal Windows để tránh lỗi ký tự tiếng Việt
if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

API_URL = "https://script.google.com/macros/s/AKfycbwNI9P3KS5bKGiAUW0nhwWF63Gp4lkYqNlvWKUDvLCo5_H-HpG4Ebgsqclq4mH0nbGLzA/exec?action=getData"
OUTPUT_DIR = "Workshop Downloads"
PROGRESS_FILE = "progress.json"

def sanitize_filename(name):
    # Thay thế các ký tự cấm trên Windows bằng dấu gạch ngang
    return re.sub(r'[<>:"/\\|?*]', '-', name).strip()

def sanitize_path(path_str):
    if not path_str:
        return ""
    # Thay thế dấu gạch chéo ngược thành xuôi rồi tách
    parts = path_str.replace('\\', '/').split('/')
    sanitized_parts = [re.sub(r'[<>:"/\\|?*]', '-', p).strip() for p in parts if p.strip()]
    return os.path.join(*sanitized_parts) if sanitized_parts else ""

def get_drive_id(url):
    # Trích xuất file ID từ URL chia sẻ Google Drive
    match = re.search(r'/file/d/([a-zA-Z0-9_-]+)', url)
    if match:
        return match.group(1)
    match = re.search(r'id=([a-zA-Z0-9_-]+)', url)
    if match:
        return match.group(1)
    return None

def write_progress(data):
    # Ghi dữ liệu ra file temp sau đó đổi tên để tránh lỗi đọc ghi đồng thời của file monitor.html
    temp_file = PROGRESS_FILE + ".tmp"
    try:
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        if os.path.exists(PROGRESS_FILE):
            os.remove(PROGRESS_FILE)
        os.rename(temp_file, PROGRESS_FILE)
    except Exception as e:
        print(f"Lỗi khi cập nhật file tiến độ: {e}")

def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            return value
    return None

def download_file(file_id, dest_path, file_info, progress_state, file_index):
    url = "https://docs.google.com/uc?export=download"
    session = requests.Session()
    
    # Gửi request ban đầu để check cảnh báo quét virus của Google Drive
    response = session.get(url, params={'id': file_id}, stream=True)
    token = get_confirm_token(response)
    
    if token:
        # Nếu có cảnh báo virus (với file lớn), gửi kèm token xác nhận
        response = session.get(url, params={'id': file_id, 'confirm': token}, stream=True)
        
    try:
        total_size = int(response.headers.get('content-length', 0))
    except (ValueError, TypeError):
        total_size = 0
    
    # Nếu file đã tải xong trước đó (kiểm tra kích thước), bỏ qua để Resume
    if os.path.exists(dest_path) and total_size > 0:
        if os.path.getsize(dest_path) == total_size:
            progress_state["files"][file_index]["status"] = "completed"
            progress_state["files"][file_index]["progress"] = "100%"
            progress_state["files"][file_index]["size"] = f"{total_size / (1024*1024):.1f} MB"
            progress_state["completed_files"] += 1
            write_progress(progress_state)
            print(f" -> Đã có sẵn trên máy (Bỏ qua)")
            return True

    # Cập nhật trạng thái bắt đầu tải
    progress_state["files"][file_index]["status"] = "downloading"
    progress_state["current_file"] = {
        "name": file_info["name"],
        "size_bytes": total_size,
        "downloaded_bytes": 0,
        "percent": 0.0,
        "speed_mbps": 0.0
    }
    write_progress(progress_state)

    # Đảm bảo thư mục lưu trữ đã được tạo
    parent_dir = os.path.dirname(dest_path)
    if parent_dir and not os.path.exists(parent_dir):
        os.makedirs(parent_dir)

    downloaded = 0
    start_time = time.time()
    last_update_time = time.time()
    
    with open(dest_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=1024*1024): # 1 MB chunk
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                
                # Cập nhật tiến độ mỗi 1 giây
                now = time.time()
                if now - last_update_time >= 1.0:
                    elapsed = now - start_time
                    speed = (downloaded / (1024*1024)) / elapsed if elapsed > 0 else 0
                    percent = (downloaded / total_size * 100) if total_size > 0 else 0.0
                    
                    progress_state["current_file"]["downloaded_bytes"] = downloaded
                    progress_state["current_file"]["percent"] = round(percent, 1)
                    progress_state["current_file"]["speed_mbps"] = round(speed, 2)
                    
                    progress_state["files"][file_index]["progress"] = f"{round(percent, 1)}%"
                    progress_state["files"][file_index]["size"] = f"{total_size / (1024*1024):.1f} MB" if total_size > 0 else f"{downloaded / (1024*1024):.1f} MB"
                    write_progress(progress_state)
                    last_update_time = now

    # Cập nhật trạng thái hoàn thành file
    progress_state["files"][file_index]["status"] = "completed"
    progress_state["files"][file_index]["progress"] = "100%"
    progress_state["files"][file_index]["size"] = f"{downloaded / (1024*1024):.1f} MB"
    progress_state["completed_files"] += 1
    progress_state["current_file"] = None
    write_progress(progress_state)
    print(f" -> Tải xong ({downloaded / (1024*1024):.1f} MB)")
    return True

def main():
    print("====================================================")
    print("      Saola Edtech - BẮT ĐẦU TẢI VIDEO HỌC TẬP      ")
    print("====================================================")
    print("Đang lấy danh sách file từ Google Sheets...")
    
    try:
        response = requests.get(API_URL)
        if response.status_code != 200:
            print(f"Lỗi: Không thể kết nối tới API Google Sheet (HTTP {response.status_code})")
            return
            
        result = response.json()
        admin_data = result.get("data", {}).get("Admin", [])
        
        if not admin_data:
            print("Lỗi: Không tìm thấy dữ liệu trong sheet 'Admin'.")
            print("Vui lòng kiểm tra lại xem bạn đã chạy hàm quét Drive trên Sheet chưa.")
            return
            
        print(f"Tìm thấy {len(admin_data)} file cần tải.")
        
        # Khởi tạo file trạng thái ban đầu
        progress_state = {
            "total_files": len(admin_data),
            "completed_files": 0,
            "current_file": None,
            "files": []
        }
        
        for item in admin_data:
            file_name = item.get("Tên File (Video)", "Unnamed")
            folder_path = item.get("Đường dẫn thư mục", "")
            progress_state["files"].append({
                "name": file_name,
                "folder": folder_path,
                "status": "pending",
                "progress": "0%",
                "size": "Unknown"
            })
            
        write_progress(progress_state)
        print("Đã tạo file tiến trình progress.json. Bạn có thể mở monitor.html để xem giao diện.")
        
        # Bắt đầu vòng lặp tải
        for idx, item in enumerate(admin_data):
            file_name = item.get("Tên File (Video)", "")
            file_url = item.get("Link Video", "")
            folder_path = item.get("Đường dẫn thư mục", "")
            
            if not file_name or not file_url:
                progress_state["files"][idx]["status"] = "failed"
                write_progress(progress_state)
                continue
                
            file_id = get_drive_id(file_url)
            if not file_id:
                print(f"[{idx+1}/{len(admin_data)}] Bỏ qua (Link không đúng định dạng): {file_name}")
                progress_state["files"][idx]["status"] = "failed"
                write_progress(progress_state)
                continue
            
            # Làm sạch tên file và thư mục để tránh lỗi Windows
            sanitized_name = sanitize_filename(file_name)
            sanitized_folder = sanitize_path(folder_path)
            dest_path = os.path.join(OUTPUT_DIR, sanitized_folder, sanitized_name)
            
            print(f"[{idx+1}/{len(admin_data)}] Đang tải: {file_name}", end="", flush=True)
            try:
                download_file(file_id, dest_path, {"name": file_name}, progress_state, idx)
            except Exception as e:
                print(f" -> LỖI: {e}")
                progress_state["files"][idx]["status"] = "failed"
                write_progress(progress_state)
                
        print("\nChúc mừng! Đã hoàn thành tải toàn bộ danh sách.")
        
    except Exception as e:
        print(f"\nLỗi hệ thống: {e}")

if __name__ == "__main__":
    main()
