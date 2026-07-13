# 🎓 Frontend Developer Test Task - Learning App

Ứng dụng học tập trực tuyến (Learning Dashboard) được phát triển bằng **React 18**, **TypeScript** và **Tailwind CSS**. Ứng dụng tích hợp đầy đủ các tính năng xác thực, tìm kiếm lọc khóa học, chi tiết lộ trình học tập, theo dõi tiến độ thời gian thực và thiết kế đáp ứng hoàn hảo trên mọi thiết bị di động (Mobile-First Design).

---

## 🚀 Hướng dẫn Chạy Dự án

Thực hiện các bước sau để cài đặt và khởi chạy ứng dụng cục bộ:

### 1. Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
```

### 2. Chạy ứng dụng ở chế độ phát triển (Development)
```bash
npm run dev
```
Ứng dụng sẽ được khởi chạy tại địa chỉ: `http://localhost:3000`

### 3. Biên dịch và Đóng gói dự án (Production Build)
```bash
npm run build
```

---

## 🔑 Tài khoản Đăng nhập Demo
Sử dụng tài khoản sau để đăng nhập vào hệ thống:
*   **Email**: `demo@gmail.com`
*   **Mật khẩu**: `123456`

---

## ✨ Danh sách Tính năng đã Phát triển

### 1. Tính năng Cốt lõi (Core Features)
*   **Xác thực Bảo mật (Auth & Protected Routes)**:
    *   Form đăng nhập đầy đủ các điều kiện validation (Email đúng định dạng, Mật khẩu >= 6 ký tự).
    *   Tự động khóa (disable) nút Đăng nhập khi form chưa hợp lệ và hiển thị thông báo lỗi chi tiết.
    *   Bảo vệ các tuyến đường (routes) yêu cầu đăng nhập bằng `ProtectedRoute` (người dùng chưa đăng nhập sẽ tự động bị điều hướng về trang `/auth/login`).
    *   Hỗ trợ Đăng xuất (Logout) nhanh từ thanh điều hướng.
*   **Dashboard Khóa học (Courses List & Paging)**:
    *   Hiển thị danh sách khóa học lấy từ API mock (DummyJSON Recipes).
    *   Tích hợp phân trang (Pagination) chuẩn 9 bản ghi một trang.
    *   Mỗi thẻ khóa học hiển thị đầy đủ: Ảnh thumbnail tỉ lệ chuẩn 16:9, Tên, Loại khóa học (Kind), Mức độ khó (Level), Mô tả ngắn gọn (truncate 2 dòng) và số lượng bài học con.
*   **Chi tiết Khóa học (Course Detail)**:
    *   Giao diện Cover Header bắt mắt kèm thông tin giảng viên và đánh giá.
    *   Hiển thị mô tả đầy đủ của khóa học.
    *   Thanh tiến độ tổng thể của khóa học (%).
    *   Danh sách bài học con hiển thị theo dạng bảng trực quan: Thứ tự, Tên bài học, Thời lượng (phút), Trạng thái học tập chi tiết.
    *   Nút bấm thông minh "Tiếp tục học" tự động chuyển hướng đến bài học đầu tiên chưa hoàn thành (hoặc bài đang học dở).
*   **Trang Học bài học (Lesson Detail)**:
    *   Khai báo URL bài học theo chuẩn RESTful dạng `/courses/:courseId/lessons/:lessonIndex` hỗ trợ chia sẻ link trực tiếp và chuyển đổi bài bằng nút Back/Forward của trình duyệt.
    *   Bảng playlist danh sách bài học con cuộn độc lập ở Sidebar bên trái (trên Desktop) giúp chuyển bài nhanh.
    *   Nút "Đánh dấu hoàn thành" và nút quay lại khóa học đồng bộ dữ liệu ngay lập tức.
*   **Tìm kiếm & Lọc nâng cao**:
    *   Tìm kiếm khóa học theo thời gian thực (Real-time Search) theo tên khóa học.
    *   Lọc khóa học theo độ khó (Level): `All`, `S`, `Pres`, `TC`, `MTC`.
    *   Hiển thị trạng thái "No results found" đẹp mắt kèm nút Reset Filters khi không tìm thấy kết quả phù hợp.
*   **Theo dõi Tiến độ & Lưu trữ (Progress Tracking)**:
    *   Lưu trữ trạng thái bài học con và tiến trình khóa học vào `localStorage`.
    *   Khi người dùng click vào một bài học, trạng thái bài học đó tự động chuyển từ `not-started` sang `in-progress`. Khi nhấn nút hoàn thành, bài học chuyển sang `completed`.
*   **Thiết kế Đáp ứng (Responsive Design)**:
    *   Áp dụng phương pháp tiếp cận **Mobile-First** (Tối thiểu 375px).
    *   **Mobile (< 768px)**: Ẩn đồ họa đăng nhập, Sidebar chuyển thành ngăn kéo ẩn hiện (Drawer Navigation) có nút Hamburger mượt mà.
    *   **Tablet (768px - 1024px)**: Grid danh sách khóa học hiển thị 2 cột.
    *   **Desktop (>= 1024px)**: Grid khóa học hiển thị 3 cột và Sidebar cố định bên trái.
    *   Đảm bảo tất cả các nút bấm tương tác cảm ứng đều có kích thước tối thiểu **44px** (Touch Targets >= 44px) bảo vệ ngón tay người dùng.

### 2. Tính năng Cộng thêm (Bonus Features)
*   **Chế độ Sáng/Tối (Dark Mode Toggle)**: Hỗ trợ chuyển đổi giao diện Dark/Light mode toàn diện, ghi nhớ tùy chọn qua `localStorage`.
*   **Hiệu ứng Loading Skeletons**: Sử dụng hiệu ứng khung xương tải giả lập cấu trúc thật (`animate-pulse`) khi gọi API giúp cải thiện đáng kể trải nghiệm người dùng (UX).
*   **Transitions & Animations mượt mà**: Tích hợp các hiệu ứng chuyển động mượt cho Drawer, hover thẻ khóa học và các nút bấm.

---

## 📁 Cấu trúc Thư mục Dự án

Dự án được tổ chức gọn gàng theo chuẩn React Best Practices:

```text
src/
  ├─ assets/             # Hình ảnh, icons và tài nguyên tĩnh
  ├─ components/         # Các components dùng chung (ProgressBar, CourseCard, v.v.)
  ├─ hooks/              # Custom hooks (useAuth)
  ├─ pages/              # Các trang giao diện chính
  │   ├─ Auth/           # Đăng nhập (Login.tsx)
  │   └─ Courses/        # Danh sách khóa học, Chi tiết khóa học và Bài học chi tiết
  ├─ routes/             # Cấu hình định tuyến và bảo vệ router (AppRouter, ProtectedRoute)
  ├─ types/              # Khai báo kiểu dữ liệu TypeScript (course.ts)
  ├─ App.tsx             # File khởi chạy chính của App
  ├─ index.css           # Cấu hình Tailwind CSS và biến toàn cục
  └─ main.tsx            # Entry point của ứng dụng
```

---

## 🛠️ Công nghệ Sử dụng
*   **Core**: React 18, Vite, TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Routing**: React Router DOM v6
