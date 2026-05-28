# TÀI LIỆU SƠ ĐỒ THIẾT KẾ HỆ THỐNG (SYSTEM UML DIAGRAMS)

> [!NOTE]
> ### 🔗 LIÊN KẾT HỆ THỐNG TÀI LIỆU DỰ ÁN
> *   **Kế hoạch dự án (Project Plan):** [PROJECT_PLAN](file:///d:/staff-absence-tracker-main/staff-absence-tracker-main/PROJECT_PLAN)
> *   **Đặc tả Use Case & Sơ đồ:** [USE_CASE_SPEC.md](file:///d:/staff-absence-tracker-main/staff-absence-tracker-main/USE_CASE_SPEC.md)
> *   **Sơ đồ thiết kế hệ thống (UML):** [SYSTEM_DIAGRAMS.md](file:///d:/staff-absence-tracker-main/staff-absence-tracker-main/SYSTEM_DIAGRAMS.md)
> *   **Kịch bản kiểm thử (50 Test Cases):** [TEST_CASES.md](file:///d:/staff-absence-tracker-main/staff-absence-tracker-main/TEST_CASES.md)

---

Tài liệu này cung cấp các sơ đồ tuần tự (Sequence Diagrams) và sơ đồ trạng thái (State Diagram) mô tả chi tiết luồng xử lý dữ liệu và logic nghiệp vụ thực tế trong mã nguồn của bạn.

---

## 1. SƠ ĐỒ TUẦN TỰ: ĐĂNG NHẬP BẢO MẬT (UC01)
Sơ đồ này mô tả chi tiết quy trình đăng nhập từ Trình duyệt (Browser) đi qua bộ lọc chống Brute Force (`express-rate-limit`), truy vấn cơ sở dữ liệu MySQL, thực hiện so khớp mật khẩu và tự động băm mật khẩu thô bằng `Bcrypt`.

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Người dùng (Browser)
    participant Server as ⚙️ Node.js Server (index.js)
    participant Limit as 🛡️ Rate Limiter (express-rate-limit)
    participant DB as 🗄️ MySQL Database
    
    User->>Server: Gửi POST /xu-ly-dang-nhap (Email, Mật khẩu)
    Server->>Limit: Kiểm tra số lần thử sai của IP
    alt Sai quá 5 lần trong 15 phút
        Limit-->>User: Trả về alert chặn đăng nhập (Khóa 15 phút)
    else Hợp lệ
        Server->>DB: Query: SELECT * FROM nhan_vien WHERE email = ?
        DB-->>Server: Trả về thông tin Nhân sự (User data)
        alt Không tìm thấy Email
            Server-->>User: Hiển thị alert "Email không tồn tại!"
        else Tìm thấy Email
            alt Mật khẩu dạng thô (plain-text) trong DB
                Server->>Server: Băm mật khẩu bằng bcrypt.hash(pass, 10)
                Server->>DB: Query: UPDATE nhan_vien SET mat_khau = ? WHERE ma_nhan_vien = ?
                DB-->>Server: Xác nhận cập nhật đè mật khẩu băm thành công
            end
            Server->>Server: Đối chiếu mật khẩu bằng bcrypt.compare(pass, hash)
            alt Mật khẩu đúng
                Server->>Server: Khởi tạo Session người dùng (maxAge = 10 phút)
                Server-->>User: Chuyển hướng vào trang /dashboard (Đăng nhập thành công)
            else Mật khẩu sai
                Server-->>User: Hiển thị alert "Sai mật khẩu! Còn Y lần thử"
            end
        end
    end
```

---

## 2. SƠ ĐỒ TUẦN TỰ: QUY TRÌNH TẠO & PHÊ DUYỆT ĐƠN NGHỈ PHÉP
Sơ đồ mô tả quy trình nộp đơn xin nghỉ phép của Nhân viên và các hành động xử lý, chỉ định bàn giao chéo, cũng như logic trừ ngày phép tự động của cấp Quản trị/HR.

```mermaid
sequenceDiagram
    autonumber
    actor Staff as 👤 Nhân viên (Staff)
    actor Manager as 💼 Quản lý (HR/Manager)
    participant Server as ⚙️ Node.js Server
    participant DB as 🗄️ MySQL Database

    %% Luồng tạo đơn
    Note over Staff, Server: TIẾN TRÌNH TẠO ĐƠN XIN NGHỈ
    Staff->>Server: Gửi POST /xu-ly-tao-don (loai_nghi, nguoi_ban_giao, ngay_bat_dau, ngay_ket_thuc, ly_do)
    Server->>DB: Query: INSERT INTO don_nghi_phep (ma_nhan_vien, loai_nghi,...) VALUES (?, ?,...)
    DB-->>Server: Xác nhận lưu đơn thành công
    Server-->>Staff: Trả về alert nộp đơn thành công và chuyển hướng về Dashboard (Trạng thái đơn: 'Chờ duyệt')

    %% Luồng duyệt đơn
    Note over Manager, DB: TIẾN TRÌNH PHÊ DUYỆT ĐƠN
    Manager->>Server: Gửi POST /xu-ly-duyet-don (ma_don, trang_thai_moi = 'Đã duyệt', loai_nghi)
    Server->>DB: Query: UPDATE don_nghi_phep SET trang_thai = 'Đã duyệt' WHERE ma_don = ?
    DB-->>Server: Xác nhận cập nhật trạng thái thành công
    alt Loại nghỉ là "Phép năm"
        Server->>Server: Tính số ngày nghỉ = (ngay_ket_thuc - ngay_bat_dau) + 1
        Server->>DB: Query: UPDATE nhan_vien SET ngay_phep_da_dung = ngay_phep_da_dung + soNgayNghi WHERE ma_nhan_vien = ?
        DB-->>Server: Cập nhật quỹ ngày phép của nhân viên thành công
    end
    Server-->>Manager: Tải lại trang duyệt đơn /duyet-don
```

---

## 3. SƠ ĐỒ TRẠNG THÁI: VÒNG ĐỜI CỦA ĐƠN XIN NGHỈ PHÉP
Sơ đồ này trực quan hóa các trạng thái chuyển đổi của một đơn nghỉ phép từ khi khởi tạo, hủy bỏ, phê duyệt hoặc từ chối và tác động của nó đến quỹ phép hoặc bảng lương.

```mermaid
stateDiagram-v2
    [*] --> ChoDuyet : Nhân viên nộp đơn (POST /xu-ly-tao-don)
    
    state ChoDuyet {
        [*] --> Pending
        Pending --> HuyDon : Nhân viên tự hủy (POST /huy-don)
    }

    ChoDuyet --> DaDuyet : Quản lý duyệt (POST /xu-ly-duyet-don)
    ChoDuyet --> TuChoi : Quản lý từ chối (POST /xu-ly-duyet-don)

    HuyDon --> [*] : Kết thúc (Lưu vết đơn)
    TuChoi --> [*] : Kết thúc (Không trừ phép)
    
    state DaDuyet {
        [*] --> CheckLoaiNghi
        CheckLoaiNghi --> TruPhepNam : Loại nghỉ là 'Phép năm'
        CheckLoaiNghi --> TruLuongThang : Loại nghỉ là 'Việc riêng'
    }

    TruPhepNam --> [*] : Kết thúc (Trừ quỹ phép năm)
    TruLuongThang --> [*] : Kết thúc (Trừ tiền công trên phiếu lương)
```

