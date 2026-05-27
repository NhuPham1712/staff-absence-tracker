const express = require('express');
const session = require('express-session');
const app = express();
const cong_chay = 3000;

const db = require('./ket_noi_csdl');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

// CHỐNG BRUTE FORCE: Khóa mõm tài khoản sau 5 lần đăng nhập sai
const blockSpamDangNhap = rateLimit({
    windowMs: 15 * 60 * 1000, // Khóa trong 15 phút
    max: 5, // Chỉ cho phép thử tối đa 5 lần
    message: '<script>alert("Bạn đã đăng nhập sai quá nhiều lần! Hệ thống tạm khóa trong 15 phút để bảo vệ tài khoản."); window.location.href="/";</script>'
});

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));

// Cấu hình Session (Cấp thẻ từ cho người dùng)
app.use(session({
    secret: 'bi_mat_cua_cong_ty_present',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 } // Thẻ có hạn trong 10 phút
}));

// 1. Route trang Đăng nhập
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('dang_nhap');
});

// 2. Route xử lý Đăng nhập
// 2. Route xử lý Đăng nhập (Đã gắn Khiên chống Spam và Mã hóa Bcrypt)
app.post('/xu-ly-dang-nhap', blockSpamDangNhap, async (req, res) => {
    const emailNhap = req.body.email;
    const matKhauNhap = req.body.mat_khau;

    // Chỉ tìm User theo Email, không tìm pass nữa
    const cauLenhSQL = "SELECT * FROM nhan_vien WHERE email = ?";
    
    db.query(cauLenhSQL, [emailNhap], async (loi, ketQua) => {
        if (loi) {
            console.error("Lỗi truy vấn đăng nhập:", loi);
            return res.send("Lỗi máy chủ! Chi tiết: " + loi.message);
        }

        if (ketQua.length > 0) {
            const user = ketQua[0];

            // CƠ CHẾ THÔNG MINH: Nếu pass trong CSDL chưa mã hóa (vd: 123456)
            if (user.mat_khau === matKhauNhap) {
                // Đem đi mã hóa ngay lập tức và lưu đè vào CSDL
                const maHoaMoi = await bcrypt.hash(matKhauNhap, 10);
                db.query("UPDATE nhan_vien SET mat_khau = ? WHERE ma_nhan_vien = ?", [maHoaMoi, user.ma_nhan_vien]);
                
                req.session.user = user;
                return res.redirect('/dashboard');
            }

            // Nếu pass trong CSDL ĐÃ ĐƯỢC MÃ HÓA (Chuỗi dài loằng ngoằng) -> Dùng Bcrypt để đối chiếu
            let dungMatKhau = false;
            try {
                if (user.mat_khau.startsWith('$2a$') || user.mat_khau.startsWith('$2b$') || user.mat_khau.startsWith('$2y$')) {
                    dungMatKhau = await bcrypt.compare(matKhauNhap, user.mat_khau);
                }
            } catch (error) {
                console.error("Lỗi khi so khớp mật khẩu bằng bcrypt:", error);
            }
            
            if (dungMatKhau) {
                req.session.user = user;
                res.redirect('/dashboard');
            } else {
                res.send(`<script>alert('Sai mật khẩu! Bạn còn ${5 - req.rateLimit.current} lần thử.'); window.location.href='/';</script>`);
            }
        } else {
            res.send(`<script>alert('Email không tồn tại trong hệ thống!'); window.location.href='/';</script>`);
        }
    });
});

// 3. Route hiển thị Dashboard (Đã nâng cấp: Kèm dữ liệu vẽ Biểu đồ Thống kê)
app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const user = req.session.user;

    // Lệnh 1: Ai đang vắng mặt hôm nay?
    const sqlVangMat = `SELECT n.ho_ten, d.loai_nghi, d.nguoi_ban_giao FROM don_nghi_phep d JOIN nhan_vien n ON d.ma_nhan_vien = n.ma_nhan_vien WHERE d.trang_thai = 'Đã duyệt' AND CURDATE() BETWEEN d.ngay_bat_dau AND d.ngay_ket_thuc`;

    db.query(sqlVangMat, (loi1, vangMat) => {
        // Lệnh 2: Bàn giao cho TÔI
        const sqlBanGiao = `SELECT d.*, n.ho_ten AS nguoi_nghi, n.email AS email_nguoi_nghi FROM don_nghi_phep d JOIN nhan_vien n ON d.ma_nhan_vien = n.ma_nhan_vien WHERE d.nguoi_ban_giao = ? AND d.trang_thai = 'Đã duyệt' ORDER BY d.ngay_bat_dau DESC`;

        db.query(sqlBanGiao, [user.ho_ten], (loi2, banGiao) => {
            // Lệnh 3: Hộp thư ĐƠN CHỜ DUYỆT (Cho Sếp)
            const sqlChoDuyet = `SELECT d.*, n.ho_ten FROM don_nghi_phep d JOIN nhan_vien n ON d.ma_nhan_vien = n.ma_nhan_vien WHERE d.trang_thai = 'Chờ duyệt' ORDER BY d.ma_don DESC`;
            
            db.query(sqlChoDuyet, (loi3, choDuyet) => {
                
                // Lệnh 4: Thống kê loại nghỉ phép (Biểu đồ Tròn)
                const sqlThongKeLoai = `SELECT loai_nghi, COUNT(*) as so_luong FROM don_nghi_phep WHERE ma_nhan_vien = ? AND trang_thai = 'Đã duyệt' GROUP BY loai_nghi`;
                
                db.query(sqlThongKeLoai, [user.ma_nhan_vien], (loi4, thongKeLoai) => {
                    
                    // Lệnh 5: Thống kê số ngày nghỉ theo từng tháng trong năm (Biểu đồ Cột)
                    const sqlThongKeThang = `SELECT MONTH(ngay_bat_dau) as thang, SUM(DATEDIFF(ngay_ket_thuc, ngay_bat_dau) + 1) as tong_ngay FROM don_nghi_phep WHERE ma_nhan_vien = ? AND trang_thai = 'Đã duyệt' AND YEAR(ngay_bat_dau) = YEAR(CURDATE()) GROUP BY MONTH(ngay_bat_dau)`;
                    
                    db.query(sqlThongKeThang, [user.ma_nhan_vien], (loi5, thongKeThang) => {
                        
                        // Đẩy toàn bộ dữ liệu ra giao diện (Mảng Data được truyền trực tiếp, EJS sẽ stringify để Chart.js đọc được)
                        res.render('dashboard', { 
                            user: user, 
                            danhSachVangMat: vangMat || [],
                            danhSachBanGiao: banGiao || [],
                            danhSachSepCanDuyet: choDuyet || [], 
                            soDonChoDuyet: choDuyet ? choDuyet.length : 0,
                            thongKeLoai: thongKeLoai || [],
                            thongKeThang: thongKeThang || []
                        });
                    });
                });
            });
        });
    });
});
// 4. Route Đăng xuất
app.get('/dang-xuat', (req, res) => {
    req.session.destroy((loi) => {
        if (loi) console.log(loi);
        res.redirect('/'); 
    });
});

// 5. Route hiển thị Form Tạo đơn xin nghỉ (Có Dropdown thông minh)
app.get('/tao-don', (req, res) => {
    if (!req.session.user) return res.redirect('/');

    const idNguoiNop = req.session.user.ma_nhan_vien;
    const sqlLayNhanVien = "SELECT ho_ten, email FROM nhan_vien WHERE ma_nhan_vien != ?";
    
    db.query(sqlLayNhanVien, [idNguoiNop], (loi, danhSachNhanVien) => {
        if (loi) {
            console.error("Lỗi lấy danh sách nhân viên:", loi);
            danhSachNhanVien = []; 
        }
        res.render('tao_don', { 
            user: req.session.user, 
            danhSachNhanVien: danhSachNhanVien 
        });
    });
});

// 6. Route xử lý nộp đơn
app.post('/xu-ly-tao-don', (req, res) => {
    if (!req.session.user) return res.redirect('/');

    const loai_nghi = req.body.loai_nghi;
    const nguoi_ban_giao = req.body.nguoi_ban_giao;
    const ngay_bat_dau = req.body.ngay_bat_dau;
    const ngay_ket_thuc = req.body.ngay_ket_thuc;
    const ly_do = req.body.ly_do;
    const ma_nhan_vien = req.session.user.ma_nhan_vien; 

    const cauLenhSQL = `
        INSERT INTO don_nghi_phep 
        (ma_nhan_vien, loai_nghi, nguoi_ban_giao, ngay_bat_dau, ngay_ket_thuc, ly_do) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(cauLenhSQL, [ma_nhan_vien, loai_nghi, nguoi_ban_giao, ngay_bat_dau, ngay_ket_thuc, ly_do], (loi, ketQua) => {
        if (loi) {
            console.error("Lỗi khi lưu đơn:", loi);
            return res.send("Có lỗi xảy ra khi nộp đơn, vui lòng thử lại!");
        }
        res.send(`
            <script>
                alert('🎉 Gửi đơn xin nghỉ phép thành công! Vui lòng chờ Quản lý phê duyệt.');
                window.location.href = '/dashboard';
            </script>
        `);
    });
});

// 7. Route hiển thị trang Duyệt Đơn (Cho phép Sếp đổi người bàn giao)
app.get('/duyet-don', (req, res) => {
    if (!req.session.user || req.session.user.ma_chuc_vu > 2) return res.redirect('/dashboard');

    const sqlDon = `
        SELECT d.*, n.ho_ten, n.email 
        FROM don_nghi_phep d 
        JOIN nhan_vien n ON d.ma_nhan_vien = n.ma_nhan_vien 
        WHERE d.trang_thai = 'Chờ duyệt'
        ORDER BY d.ngay_tao DESC
    `;

    db.query(sqlDon, (loi, danhSachDon) => {
        if (loi) return res.send("Lỗi máy chủ!");

        db.query("SELECT ho_ten FROM nhan_vien", (loi2, danhSachNhanVien) => {
            res.render('duyet_don', { 
                user: req.session.user, 
                danhSachDon: danhSachDon,
                danhSachNhanVien: danhSachNhanVien 
            });
        });
    });
});

// 8. Route xử lý Phê duyệt
app.post('/xu-ly-duyet-don', (req, res) => {
    if (!req.session.user || req.session.user.ma_chuc_vu > 2) return res.redirect('/');

    const ma_don = req.body.ma_don;
    const trang_thai_moi = req.body.trang_thai_moi;
    const nguoi_ban_giao_moi = req.body.nguoi_ban_giao_moi; 
    const loai_nghi = req.body.loai_nghi;
    
    let sqlUpdateDon = "UPDATE don_nghi_phep SET trang_thai = ? WHERE ma_don = ?";
    let params = [trang_thai_moi, ma_don];

    if (trang_thai_moi === 'Đã duyệt' && nguoi_ban_giao_moi) {
        sqlUpdateDon = "UPDATE don_nghi_phep SET trang_thai = ?, nguoi_ban_giao = ? WHERE ma_don = ?";
        params = [trang_thai_moi, nguoi_ban_giao_moi, ma_don];
    }

    db.query(sqlUpdateDon, params, (loi) => {
        if (loi) return res.send("Lỗi cập nhật!");

        if (trang_thai_moi === 'Đã duyệt') {
            // Chỉ trừ phép nếu là loại nghỉ phép năm có lương (gửi lên là "Phép năm")
            if (loai_nghi === 'Phép năm') {
                const ma_nhan_vien = req.body.ma_nhan_vien;
                const ngay_bat_dau = new Date(req.body.ngay_bat_dau);
                const ngay_ket_thuc = new Date(req.body.ngay_ket_thuc);
                
                const thoiGianNghi = Math.abs(ngay_ket_thuc - ngay_bat_dau);
                const soNgayNghi = Math.ceil(thoiGianNghi / (1000 * 60 * 60 * 24)) + 1;

                const sqlUpdatePhep = "UPDATE nhan_vien SET ngay_phep_da_dung = ngay_phep_da_dung + ? WHERE ma_nhan_vien = ?";
                db.query(sqlUpdatePhep, [soNgayNghi, ma_nhan_vien], () => {
                    res.redirect('/duyet-don');
                });
            } else {
                res.redirect('/duyet-don');
            }
        } else {
            res.redirect('/duyet-don');
        }
    });
});

// 9. Route Lịch sử đơn từ (Góc nhìn Cá nhân)
app.get('/lich-su-nghi', (req, res) => {
    if (!req.session.user) return res.redirect('/');

    const ma_nhan_vien = req.session.user.ma_nhan_vien;
    const cauLenhSQL = "SELECT * FROM don_nghi_phep WHERE ma_nhan_vien = ? ORDER BY ngay_tao DESC";

    db.query(cauLenhSQL, [ma_nhan_vien], (loi, danhSach) => {
        if (loi) {
            console.error("Lỗi lấy lịch sử:", loi);
            return res.send("Lỗi máy chủ!");
        }
        res.render('lich_su', { user: req.session.user, danhSach: danhSach });
    });
});
// 10. Route xử lý Hủy đơn xin nghỉ (Chỉ hủy khi đang Chờ duyệt)
app.post('/huy-don', (req, res) => {
    if (!req.session.user) return res.redirect('/');

    const ma_don = req.body.ma_don;
    const ma_nhan_vien = req.session.user.ma_nhan_vien; // Đảm bảo chỉ chính chủ mới được hủy

    // Chỉ đổi trạng thái thành 'Đã hủy' (Không xóa hẳn khỏi Database để lưu vết)
    const sqlHuy = "UPDATE don_nghi_phep SET trang_thai = 'Đã hủy' WHERE ma_don = ? AND ma_nhan_vien = ? AND trang_thai = 'Chờ duyệt'";
    
    db.query(sqlHuy, [ma_don, ma_nhan_vien], (loi) => {
        if (loi) console.error("Lỗi hủy đơn:", loi);
        res.redirect('/lich-su-nghi'); // Hủy xong tải lại trang Lịch sử
    });
});
// ================= MODULE QUẢN LÝ NHÂN SỰ =================

// 11. Route hiển thị danh sách Nhân viên (Chỉ Admin/HR)
app.get('/quan-ly-nhan-su', (req, res) => {
    // Nếu không phải Sếp (ma_chuc_vu = 1) hoặc HR (ma_chuc_vu = 2) thì cấm vào
    if (!req.session.user || req.session.user.ma_chuc_vu > 2) return res.redirect('/dashboard');

    const sqlLayNhanVien = "SELECT * FROM nhan_vien ORDER BY ma_chuc_vu ASC, ma_nhan_vien DESC";
    db.query(sqlLayNhanVien, (loi, danhSachNV) => {
        if (loi) return res.send("Lỗi máy chủ!");
        res.render('quan_ly_nhan_su', { user: req.session.user, danhSachNV: danhSachNV });
    });
});

// 12. Route xử lý Thêm Nhân viên mới (Mã hóa mật khẩu tự động)
app.post('/them-nhan-vien', async (req, res) => {
    if (!req.session.user || req.session.user.ma_chuc_vu > 2) return res.redirect('/');

    const { ho_ten, email, mat_khau, so_dien_thoai, phong_ban, luong_co_ban, ma_chuc_vu } = req.body;

    // Mã hóa mật khẩu của nhân viên mới trước khi lưu vào Database
    const matKhauMaHoa = await bcrypt.hash(mat_khau, 10);

    const sqlThemNV = `
        INSERT INTO nhan_vien (ho_ten, email, mat_khau, so_dien_thoai, phong_ban, luong_co_ban, ma_chuc_vu, tong_ngay_phep) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 12)
    `;

    db.query(sqlThemNV, [ho_ten, email, matKhauMaHoa, so_dien_thoai, phong_ban, luong_co_ban, ma_chuc_vu], (loi) => {
        if (loi) {
            console.error(loi);
            return res.send("<script>alert('Lỗi! Có thể Email này đã tồn tại.'); window.location.href='/quan-ly-nhan-su';</script>");
        }
        res.redirect('/quan-ly-nhan-su');
    });
});
// 13. Route hiển thị Phiếu lương cá nhân (Tự động phân bậc lương theo Vị trí/Phòng ban)
app.get('/bang-luong', (req, res) => {
    if (!req.session.user) return res.redirect('/');

    const ma_nhan_vien = req.session.user.ma_nhan_vien;
    const ngayHienTai = new Date();
    const thangHienTai = ngayHienTai.getMonth() + 1;
    const namHienTai = ngayHienTai.getFullYear();

    // Bước 1: Lấy thông tin phòng ban, tiền OT, thưởng từ CSDL để đảm bảo tính chính xác
    db.query("SELECT * FROM nhan_vien WHERE ma_nhan_vien = ?", [ma_nhan_vien], (err, dataNV) => {
        if (err || dataNV.length === 0) return res.send("Lỗi tải dữ liệu nhân viên");
        
        const nv = dataNV[0];
        
        // Bước 2: Tự động phân loại mức lương cơ bản dựa trên vị trí / phòng ban (Logic switch-case)
        let luongCoBan = 5000000; // Mức mặc định nếu không khớp vị trí nào
        const viTri = nv.phong_ban; 

        switch (viTri) {
            case 'Tester':
                luongCoBan = 9000000;
                break;
            case 'Business Analyst (BA)':
            case 'Phòng BA': // Thêm các trường hợp viết khác nếu có
                luongCoBan = 15000000;
                break;
            case 'Fullstack Developer':
            case 'Fullstacks':
                luongCoBan = 30000000;
                break;
            case 'Data Analyst (DA)':
            case 'Phòng DA':
                luongCoBan = 12000000;
                break;
            case 'Software Developer':
            case 'Phòng IT': // Nếu bạn đang gán lập trình viên vào phòng IT
                luongCoBan = 12000000;
                break;
            case 'UI-UX Designer':
            case 'Phòng Thiết kế':
                luongCoBan = 13000000;
                break;
            default:
                // Nếu CSDL đang lưu mức lương cụ thể từ trước thì giữ nguyên, không thì dùng mặc định
                luongCoBan = nv.luong_co_ban || 5000000;
                break;
        }

        // Lấy các khoản phụ cấp và thu nhập khác phát sinh
        const phuCap = nv.phu_cap || 1000000; // Mặc định phụ cấp ăn trưa, xăng xe 1 triệu
        const tienOT = nv.tien_ot || 0;
        const thuong = nv.thuong || 0;
        
        const soNgayCongChuan = 22;
        const luongMotNgay = Math.round(luongCoBan / soNgayCongChuan);

        // Bước 3: Đếm số ngày nghỉ không lương (Việc riêng) trong tháng
        const sqlNghiKhongLuong = `
            SELECT SUM(DATEDIFF(ngay_ket_thuc, ngay_bat_dau) + 1) as tong_ngay_tru 
            FROM don_nghi_phep 
            WHERE ma_nhan_vien = ? AND trang_thai = 'Đã duyệt' AND loai_nghi = 'Việc riêng'
            AND MONTH(ngay_bat_dau) = ? AND YEAR(ngay_bat_dau) = ?
        `;

        db.query(sqlNghiKhongLuong, [ma_nhan_vien, thangHienTai, namHienTai], (loi, ketQua) => {
            let soNgayBiTru = 0;
            if (!loi && ketQua[0].tong_ngay_tru) {
                soNgayBiTru = ketQua[0].tong_ngay_tru;
            }

            // 1. TÍNH TỔNG THU NHẬP (GROSS)
            const tongThuNhap = luongCoBan + phuCap + tienOT + thuong;

            // 2. TÍNH CÁC KHOẢN KHẤU TRỪ
            const truNghiViecRieng = soNgayBiTru * luongMotNgay;
            // Bảo hiểm bắt buộc trích từ lương cơ bản (10.5% gồm: BHXH 8%, BHYT 1.5%, BHTN 1%)
            const baoHiem = Math.round(luongCoBan * 0.105); 
            const tongKhauTru = truNghiViecRieng + baoHiem;

            // 3. TÍNH THỰC LÃNH (NET)
            const thucLanh = tongThuNhap - tongKhauTru;

            // Đóng gói toàn bộ thông số chi tiết để gửi lên giao diện
            const chiTietLuong = {
                thang: thangHienTai,
                nam: namHienTai,
                luongCoBan: luongCoBan,
                phuCap: phuCap,
                tienOT: tienOT,
                thuong: thuong,
                tongThuNhap: tongThuNhap,
                soNgayBiTru: soNgayBiTru,
                truNghiViecRieng: truNghiViecRieng,
                baoHiem: baoHiem,
                tongKhauTru: tongKhauTru,
                thucLanh: thucLanh
            };

            // Tiến hành render ra file views/bang_luong.ejs đã đổi tên chuẩn
            res.render('bang_luong', { user: nv, chiTietLuong: chiTietLuong });
        });
    });
});

app.listen(cong_chay, () => {
    console.log(`Server đang chạy tại: http://localhost:${cong_chay}`);
});