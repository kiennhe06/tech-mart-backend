# 🏪 TechMart Backend - Máy Chủ & Trang Quản Trị Cửa Hàng

Dự án này là hệ thống máy chủ (Backend) và bảng quản trị (Admin Dashboard) của hệ sinh thái mua sắm công nghệ **TechMart**. Hệ thống đóng vai trò trung tâm xử lý dữ liệu cho ứng dụng di động (Android Client), đồng thời cung cấp giao diện Web trực quan giúp chủ cửa hàng quản lý đơn hàng, theo dõi kho và báo cáo doanh số trong thời gian thực.

---

## 🛠️ Công Nghệ Sử Dụng

Dự án được xây dựng trên nền tảng tối giản, chạy mượt mà và dễ dàng triển khai:

![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![ExpressJS](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS_Templates-B3C8FF?style=for-the-badge&logo=ejs&logoColor=black)
![Mongoose](https://img.shields.io/badge/Mongoose_ODM-880000?style=for-the-badge&logo=mongoose&logoColor=white)

---

## ⚡ Các Điểm Sáng Kỹ Thuật Thực Tế

Thay vì chỉ làm những chức năng CRUD cơ bản, dự án này đã giải quyết triệt để các bài toán thực tế của một hệ thống bán hàng thực thụ:

### 1. Đồng Bộ & Tự Động Hóa Kho Hàng (Inventory Sync Engine)
*   **Trừ kho tự động**: Ngay khi khách đặt hàng thành công trên App Android, hệ thống lập tức cập nhật số lượng tồn kho của từng sản phẩm tương ứng.
*   **Cơ chế hoàn kho thông minh (Stock Rollback)**: Nếu khách hàng bấm **Hủy đơn** trên App di động (khi đơn ở trạng thái chờ duyệt), hệ thống tự động cộng trả lại đúng số lượng sản phẩm vào kho, ngăn chặn tối đa lỗi quá bán (overselling) và sai lệch tồn kho.

### 2. Thống Kê Doanh Thu Động Đa Năng
*   **Bộ lọc thời gian linh hoạt**: Cho phép chủ cửa hàng chọn xem doanh số theo ngày tùy biến (Hôm nay, Hôm qua, 7 ngày gần nhất, Tháng này, hoặc chọn khoảng lịch bất kỳ).
*   **Phân tách doanh số thực tế**: Tự động tính toán rõ ràng giữa **Doanh thu thực tế** (các đơn đã giao thành công) và **Doanh thu tạm tính** (các đơn đang trong quá trình xử lý/giao hàng).
*   **Biểu đồ phân tích thanh toán**: Thống kê chi tiết tỷ trọng số tiền thu về qua các kênh (Tiền mặt COD, Chuyển khoản VietQR, Thẻ tín dụng) bằng biểu đồ thanh ngang trực quan.

### 3. Vòng Phản Hồi Tương Tác 2 Chiều (Feedback Loop)
*   Khách hàng đánh giá sao kèm bình luận trên ứng dụng di động sau khi nhận hàng thành công.
*   Ý kiến phản hồi hiển thị ngay lập tức trong mục quản lý của trang Web Admin.
*   Admin có thể gửi trả lời trực tiếp từ trang quản trị. Câu trả lời này lập tức đồng bộ ngược lại App Android để khách hàng đọc được.

### 4. Setup 1-Click & Tự Tạo Dữ Liệu Mẫu (Auto DB Seeder)
*   Backend tích hợp bộ quét tự động thông minh. Khi khởi chạy lần đầu tiên trên môi trường mới (Database rỗng), hệ thống tự động đọc tệp cấu hình `db.json` và nạp toàn bộ danh mục sản phẩm, banner quảng cáo, sản phẩm flash sale và đơn hàng mẫu vào MongoDB.
*   Giúp lập trình viên mới tham gia dự án có thể chạy ngay hệ thống trong 10 giây mà không cần cấu hình database thủ công.

---

## 📊 Mô Hình Dữ Liệu (MongoDB Schema)

Cơ sở dữ liệu được tổ chức chuẩn hóa thông qua **Mongoose ODM**:

*   **Product (Sản phẩm)**: Hỗ trợ cả sản phẩm thường và sản phẩm giảm giá giờ vàng (Flash Sale) với thông số kỹ thuật (RAM, ROM, Pin...) lưu dưới dạng danh sách động.
*   **User (Người dùng)**: Quản lý thông tin tài khoản đăng nhập của khách hàng.
*   **Order (Đơn hàng & Đánh giá)**: Lưu thông tin giỏ hàng, thông tin giao nhận, trạng thái đơn hàng (`0`: Chờ duyệt, `1`: Đang xử lý, `2`: Đang giao, `3`: Hoàn tất, `-1`: Đã hủy). Tích hợp sẵn trường `Review` và `adminReply` để tối ưu hóa truy vấn.
*   **Category (Danh mục)** & **Banner (Quảng cáo)**: Phục vụ hiển thị giao diện động trên ứng dụng di động.

---

## 📱 Hệ Thống RESTful API Cho Lập Trình Viên Mobile

Backend cung cấp các API được tối ưu hóa cực kỳ tốt giúp App Android chạy nhanh và tiết kiệm băng thông mạng:

### 🛍️ APIs Sản phẩm & Trang chủ

| Method | Endpoint | Chức năng | Đặc điểm nổi bật |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/home-data` | Lấy toàn bộ dữ liệu trang chủ | Gộp Banner, Danh mục, Flash sale & Sản phẩm trong **1 request duy nhất** giúp tăng tốc độ tải trang trên di động. |
| **GET** | `/api/products/:id` | Xem chi tiết sản phẩm | Tự động trả về mô tả và thông số kỹ thuật mặc định chuyên nghiệp nếu sản phẩm chưa được cấu hình specs. |
| **POST** | `/api/add-product` | Thêm mới sản phẩm | Hỗ trợ tạo mã định danh duy nhất tự động theo thời gian (`P_timestamp`). |

### 📦 APIs Quản lý Đơn hàng & Tương tác

| Method | Endpoint | Chức năng | Đặc điểm nổi bật |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/orders/create` | Gửi đơn hàng mới | Thực hiện trừ số lượng sản phẩm trong kho tương ứng của giỏ hàng. |
| **GET** | `/api/orders/user/:email` | Xem lịch sử mua hàng | Trả về danh sách đơn hàng đã mua của user sắp xếp theo thời gian mới nhất. |
| **PATCH** | `/api/orders/:id/cancel` | Khách hàng tự hủy đơn | Chỉ cho phép hủy khi đơn ở trạng thái chờ xác nhận (`status = 0`). Đồng thời **tự động cộng trả kho hàng**. |
| **POST** | `/api/orders/:id/review` | Đánh giá đơn hàng | Chỉ cho phép đánh giá khi đơn hàng đã hoàn tất giao hàng thành công (`status = 3`). |

---

## 🎨 Giao Diện Trang Quản Trị (Admin Web Panel)

Trang Admin được tích hợp sẵn giúp quản lý cửa hàng cực kỳ tiện lợi:

*   **Báo cáo**: Xem tổng quan doanh số thực tế, đơn thành công, đơn hủy và biểu đồ tỷ trọng thanh toán.
*   **Sản phẩm**: Thêm, sửa, xóa sản phẩm. Hỗ trợ cấu hình Flash Sale trực tiếp (nhập % giảm giá, % thanh tiến trình ảo).
*   **Đơn hàng**: Cập nhật trạng thái xử lý đơn hàng theo thời gian thực.
*   **Phản hồi**: Trả lời ý kiến khách hàng.
*   **Người dùng**: Quản lý thành viên đã đăng ký.

*(Ảnh chụp màn hình giao diện được lưu trữ trực tiếp trong thư mục `images/` của dự án)*

---

## 🚀 Hướng Dẫn Cài Đặt Nhanh (10 Giây)

### 1. Yêu cầu hệ thống
*   Máy tính đã cài sẵn **Node.js** và **MongoDB** (cổng mặc định `27017`).

### 2. Các bước khởi chạy
1.  Mở Terminal tại thư mục dự án và tải toàn bộ thư viện:
    ```bash
    npm install
    ```
2.  Tạo tệp `.env` tại thư mục gốc và cấu hình kết nối database (hoặc bỏ qua để hệ thống tự kết nối MongoDB Local mặc định):
    ```env
    PORT=3000
    MONGO_URI=mongodb://127.0.0.1:27017/techmart
    ```
3.  Khởi động server ở chế độ phát triển (Tự reload khi thay đổi code):
    ```bash
    npm run dev
    ```
4.  Mở trình duyệt truy cập: **`http://localhost:3000`** để bắt đầu trải nghiệm bảng quản trị!
