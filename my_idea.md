# Tổng hợp ý tưởng trang workshop

## 1. Mục tiêu sản phẩm

Xây dựng một website tổng hợp các buổi workshop/bài giảng đã ghi âm hoặc ghi hình cho học sinh IELTS.

Website này dùng để học sinh truy cập nhanh vào các bài giảng theo từng kỹ năng hoặc từng nhóm nội dung, ví dụ:

- Writing Task 1
- Writing Task 2
- Reading
- Listening
- Speaking
- Các workshop khác

Trang web dự kiến host trên GitHub, ưu tiên GitHub Pages, không muốn phụ thuộc vào các nền tảng hosting/database phức tạp.

## 2. Luồng sử dụng chính

1. Học sinh truy cập website.
2. Website hiển thị màn hình đăng nhập hoặc nhập mật khẩu.
3. Khi đăng nhập đúng, học sinh vào trang tổng hợp.
4. Trang tổng hợp hiển thị các nhóm nội dung lớn như `Task 1`, `Task 2`, `Reading`, `Listening`, `Speaking`, `Writing`, `Workshop khác`.
5. Học sinh bấm vào từng nhóm để xem danh sách workshop của nhóm đó.
6. Mỗi workshop hiển thị dưới dạng bảng hoặc danh sách.
7. Học sinh bấm nút/link để mở video workshop trên Google Drive.

## 3. Nội dung mỗi workshop cần hiển thị

Mỗi nhóm nội dung được trình bày dạng bảng, gồm các cột:

- Số thứ tự
- Tên workshop
- Nội dung/tóm tắt workshop
- Link xem video
- Tài liệu đi kèm
- Ghi chú cho học sinh

## 4. Cách lưu và cập nhật dữ liệu

Tôi cung cấp một file Google Sheet tổng cho cả dự án này

Ý tưởng dữ liệu:

- `DB` chứa các thông tin liên quan tới dự án này 
  - `task1` chứa bảng nội dung của workshop task 1
  - `task2`
  - `reading`
  - `listening`
  - `speaking`
  - `Account` (gồm danh sách tài khoản học viên kèm mật khẩu)

Phương án cập nhật:
- Có google App Scripts nếu cần
- Có script chạy định kỳ hằng ngày hoặc hằng tuần.
- Script đọc dữ liệu từ Google Sheet.
- Script xuất dữ liệu sang file JSON hoặc cập nhật nội dung website.
- Website đọc dữ liệu đã được xuất để hiển thị cho học sinh.

## 5. Phương án đăng nhập

Mỗi học sinh có tài khoản riêng.

Tài khoản và Mật khẩu thì lấy ở trong file Google Sheet (sheet `Account`) có thể chứa:

- Email học sinh
- Student ID
- Mật khẩu
- Lớp/khóa học
- Trạng thái tài khoản (Chỉ đồng bộ lên nếu trạng thái là đang học)

Học sinh đăng nhập bằng:

- Email + mật khẩu
- Hoặc Student ID + mật khẩu

Mật khẩu sẽ được tôi reset hàng tuần và gửi cho từng học viên.
Hàng ngày vào một thời điểm trong ngày thì mật khẩu và tài khoản này sẽ tự đồng bộ lên cho website (dạng JSON). => Cân phương án nào phù hợp để tự động chạy. Lưu ý, tôi chỉ muốn dùng Github Pages thôi. Có thể dùng Google Apps Script làm API trung gian để bảo mật
Nếu đăng nhập sai mật khẩu và password thì hiện thông tin vui lòng liên hệ giáo viên để truy cập.


## 7. Gợi ý giao diện và UX

Giao diện phù hợp cho mobile responsive
Website song ngữ English/Việt
Chặn tính năng chuột phải (để tránh copy)
Màu sắc/nhận diện thương hiệu nếu có: mã màu: #174891

### Trang đăng nhập

Nên đơn giản và rõ ràng:

- Tên website/trung tâm: Saola Edtech Workshop Hub
- Logo nếu có: file logo trong folder logo
- Ô nhập mật khẩu hoặc email/Student ID + mật khẩu
- Nút đăng nhập
- Thông báo lỗi ngắn gọn nếu nhập sai

### Trang tổng hợp

Nên thiết kế như một thư viện học liệu:

- Menu hoặc tab cho từng kỹ năng (làm menu to)

### Trang danh sách workshop

Mỗi kỹ năng có một trang riêng.

Giao diện desktop:

- Hiển thị dạng bảng.
- Cột nên có:
  - STT
  - Tên workshop
  - Nội dung
  - Ngày đăng/ngày học
  - Nút xem video

Giao diện mobile:

- Không nên ép bảng quá rộng.
- Nên chuyển thành dạng card.
- Mỗi card hiển thị tên workshop, tóm tắt ngắn và nút xem video.

### Nút xem video

- Nên đặt label rõ ràng như `Xem video`.
- Mở link Google Drive trong tab mới.