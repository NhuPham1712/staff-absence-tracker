KẾ HOẠCH PHÁT TRIỂN DỰ ÁN: HỆ THỐNG QUẢN LÝ NGHỈ PHÉP VÀ ĐIỀU HÀNH NHÂN SỰ (HR & LEAVE MANAGEMENT PORTAL)

1. THÔNG TIN CHUNG

Sinh viên thực hiện: Phạm Như Ý

Đơn vị thực tập: Công ty cổ phần giải pháp công nghệ Unikom 

Mục tiêu dự án: Phân tích, thiết kế và phát triển một hệ thống web-based nhằm số hóa toàn diện quy trình quản lý nhân sự. Hệ thống đóng vai trò như một Cổng thông tin nội bộ (Internal Portal), giúp doanh nghiệp lưu trữ 

tập trung hồ sơ nhân viên, điều phối nguồn lực theo phòng ban, đồng thời tự động hóa và minh bạch hóa quy trình phê duyệt nghỉ phép.

 2. PHẠM VI DỰ ÁN (SCOPE OF WORK)
 
Dự án được chia thành 2 phân hệ (Module) cốt lõi:

Phân hệ Điều hành nhân sự (Core HR): Quản lý vòng đời dữ liệu nhân viên (Thêm mới, Cập nhật, Vô hiệu hóa tài khoản); điều phối và phân bổ nhân sự theo các phòng ban (Departments) và chức vụ (Roles).

Phân hệ Quản lý nghỉ phép (Leave Management):Cung cấp giao diện tự phục vụ (Self-service) cho nhân viên nộp đơn; cung cấp bảng điều khiển (Dashboard) cho Quản lý phê duyệt đơn; hệ thống tự động kiểm tra và trừ quỹ ngày phép tiêu chuẩn.

3. NỀN TẢNG CÔNG NGHỆ (TECH STACK)

Kiến trúc phần mềm: MVC (Model - View - Controller).

Backend: Java (Servlets/JSP), giao tiếp với database qua JDBC.

Frontend: HTML5, CSS3, JavaScript, framework Bootstrap 5 (đảm bảo Responsive UI/UX).

Cơ sở dữ liệu: MySQL (RDBMS).

Môi trường & Công cụ: VS Code, XAMPP, Git/GitHub, StarUML, Figma.

4. QUY TRÌNH PHÁT TRIỂN CÓ ỨNG DỤNG AI (AI-ASSISTED SDLC)

Dự án được phát triển theo mô hình Agile kết hợp tối đa sức mạnh của Trí tuệ Nhân tạo (Generative AI) nhằm tối ưu hóa thời gian và nâng cao chất lượng mã nguồn. Dưới đây là phân chia luồng công việc chi tiết:

4.1. PLAN (Lập kế hoạch)
Sinh viên (Làm chính):** Xác định mục tiêu đồ án, phạm vi nghiệp vụ cần giải quyết cho doanh nghiệp. Lên ý tưởng các module cốt lõi và vạch ra mốc thời gian hoàn thành (Sprint 4 tuần).
AI (Hỗ trợ): Chuẩn hóa ý tưởng thô thành tài liệu Kế hoạch chuyên nghiệp (`PLAN.md`). Gợi ý nền tảng công nghệ phù hợp.

 4.2. KHẢO SÁT & PHÂN TÍCH YÊU CẦU
Sinh viên (Làm chính): Đóng vai trò BA (Business Analyst), tìm hiểu quy trình thực tế tại công ty: quy tắc trừ quỹ phép, công thức tính lương Gross/Net, tỷ lệ đóng bảo hiểm 10.5%. 

<img width="7508" height="1408" alt="Blank diagram" src="https://github.com/user-attachments/assets/682d3fc1-7427-4ff9-af08-b33aafef218a" />

AI (Hỗ trợ): Chuyển đổi các quy tắc nghiệp vụ (Business Rules) thành logic hệ thống. Gợi ý thêm tính năng thực tế (như luồng điều phối công việc bàn giao chéo).

<img width="1852" height="624" alt="Blank diagram - Page 3" src="https://github.com/user-attachments/assets/774d41c3-d5d9-4f84-a837-ea5373e30fb4" />

 4.3. THIẾT KẾ (DB, UI, API)
Sinh viên (Định hướng & Ra quyết định):** Xác định phong cách thiết kế UI. Quyết định các Route (API) cần thiết.

<img width="3760" height="4209" alt="Blank diagram - Page 2" src="https://github.com/user-attachments/assets/7798f80d-c310-408d-9992-fbb627b22c8c" />

AI (Thực thi & Sinh mã nguồn - Làm chính): Viết câu lệnh SQL khởi tạo bảng, thiết lập khóa ngoại và tạo kịch bản Dữ liệu mẫu (Seeding Data). Sinh mã HTML/CSS/EJS xây dựng các component phức tạp.


4.4. LẬP TRÌNH (Implementation)

AI (Viết Code logic - Làm chính): Lập trình các thuật toán lõi trong Controller: tính lương, khấu trừ, cập nhật trạng thái đơn, và viết truy vấn SQL phức tạp (JOIN, COUNT, GROUP BY). Tích hợp thư viện bên thứ 3.

Sinh viên (Ghép nối & Quản lý - Làm chính): Xây dựng môi trường Node.js. Nhận code từ AI, đọc hiểu, lắp ráp các module và quản lý luồng dữ liệu truyền qua Session. (Mô hình Pair-Programming).

4.5. KIỂM THỬ (Testing & Debugging)

Sinh viên (Tìm lỗi - Tester): Chạy thực tế hệ thống, thao tác các luồng nghiệp vụ để tìm lỗi vỡ giao diện (UI) hoặc lỗi logic (Bug). Cung cấp log lỗi cho AI.

AI (Sửa lỗi - Fixer): Phân tích Stack Trace, tìm nguyên nhân gốc rễ. Viết lại mã nguồn sửa lỗi, cung cấp giải pháp phòng tránh lỗi sập hệ thống (Safe Fallback).

4.6. RELEASE (Triển khai & Đóng gói)

Sinh viên (Làm chính): Đẩy mã nguồn lên GitHub. Viết báo cáo thực tập, chuẩn bị kịch bản demo tính năng và bảo vệ trước hội đồng.

AI (Hỗ trợ): Tự động sinh tài liệu kỹ thuật, bổ sung comment giải thích trong code để mã nguồn dễ bảo trì và bàn giao.

---
 5. LỘ TRÌNH TRIỂN KHAI CHI TIẾT (SPRINT 4 TUẦN)

Tuần 1: Phân tích kiến trúc & Thiết lập nền tảng (05/05 - 11/05)

Mô hình hóa hệ thống: Phân tích quy trình nghiệp vụ của Công ty Present, thiết kế các biểu đồ Use Case và ERD (Entity-Relationship Diagram).

Thiết kế Cơ sở dữ liệu: Xây dựng cấu trúc các bảng trên MySQL, bao gồm `departments` (Phòng ban), `users` (Hồ sơ nhân sự), `roles` (Phân quyền) và `leave_requests` (Đơn từ). Thiết lập các khóa ngoại (Foreign Keys) để ràng buộc dữ liệu chặt chẽ.

Khởi tạo dự án: Cài đặt project chuẩn MVC trên NetBeans, viết lớp `DBContext` cấu hình kết nối JDBC, khởi tạo Git repository và đồng bộ mã nguồn lên GitHub.

Phát triển Module Authentication: Viết luồng xử lý Đăng nhập/Đăng xuất, phân quyền truy cập cơ bản dựa trên Role (Admin/HR, Manager, Employee).


Tuần 2: Xây dựng Phân hệ Điều hành Nhân sự (12/05 - 18/05)

Xây dựng giao diện Danh bạ: Thiết kế trang hiển thị danh sách toàn bộ nhân sự, phân trang (pagination) và tích hợp thanh tìm kiếm theo tên hoặc phòng ban.

Xử lý nghiệp vụ CRUD: Lập trình các file Servlets và DAO thực thi các chức năng Thêm mới, Xem chi tiết, Chỉnh sửa hồ sơ và Xóa (hoặc vô hiệu hóa) nhân viên.

Điều phối phòng ban: Xây dựng logic gắn kết nhân viên vào các phòng ban cụ thể, cho phép HR luân chuyển nhân sự giữa các phòng ban thông qua giao diện hệ thống.

Kiểm thử dữ liệu: Thực hiện Unit Test các câu lệnh SQL INSERT/UPDATE, đảm bảo không có dữ liệu rác (Data Integrity) khi thao tác với hồ sơ.

Tuần 3: Xây dựng Phân hệ Nghỉ phép & Tối ưu UI/UX (19/05 - 25/05)

Thiết kế UI/UX: Phác thảo Wireframe và ứng dụng Bootstrap 5 để xây dựng giao diện tương thích tốt trên cả máy tính

Nghiệp vụ Nhân viên (Employee): Phát triển form nộp đơn xin nghỉ, lập trình thuật toán kiểm tra tính hợp lệ của ngày nhập (không chọn ngày trong quá khứ) và chặn gửi đơn nếu vượt quá quỹ ngày phép hiện có.

Nghiệp vụ Quản lý (Manager): Phát triển màn hình xét duyệt, lấy danh sách đơn từ cơ sở dữ liệu và hiển thị theo trạng thái (Pending/Approved/Rejected).

Xử lý đồng bộ dữ liệu: Viết logic tự động trừ số ngày phép (used_leave_days) của nhân viên ngay khi Quản lý bấm duyệt đơn thành công.

Tuần 4: Trực quan hóa dữ liệu, Rà soát & Đóng gói (26/05 - 31/05)

Trực quan hóa thống kê (Dashboard): Nhúng thư viện Chart.js để vẽ các biểu đồ báo cáo dành riêng cho cấp quản lý (ví dụ: Biểu đồ tròn thể hiện cơ cấu nhân sự theo phòng ban, Biểu đồ cột thể hiện tỷ lệ duyệt đơn trong tháng).

Kiểm soát chất lượng (QA): Rà soát bảo mật (sử dụng PreparedStatement để chống SQL Injection), xử lý các ngoại lệ (Exception Handling) để hiển thị thông báo lỗi thân thiện thay vì sập hệ thống (Crash).

Hoàn thiện tài liệu: Viết nội dung file `README.md` bao gồm yêu cầu hệ thống, hướng dẫn cài đặt cơ sở dữ liệu và cách khởi chạy ứng dụng.

Bàn giao dự án: Hoàn tất mã nguồn trên nhánh (branch) chính của GitHub, chuẩn bị kịch bản (Test cases) và dữ liệu mẫu để Demo bảo vệ thực tập.
