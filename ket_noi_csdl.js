const mysql = require('mysql2');

// Cấu hình đường dẫn đến XAMPP
const ketNoi = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
    database: 'he_thong_nhan_su' // Tên CSDL tiếng Việt bạn đã tạo trong phpMyAdmin
});

// Chạy thử kết nối
ketNoi.connect((loi) => {
    if (loi) {
        console.error('Lỗi kết nối Cơ sở dữ liệu. Nhớ bật XAMPP nhé!', loi.message);
        return;
    }
    console.log('Chúc mừng! Kết nối Cơ sở dữ liệu thành công với Node.js.');
});

// Xuất ra để các file khác dùng chung
module.exports = ketNoi;