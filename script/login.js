// Danh sách tài khoản hợp lệ
const validAccounts = [
    { username: "user1", password: "1" },
    { username: "user2", password: "password2" },
    { username: "admin", password: "admin123" }
];

// Hàm xử lý đăng nhập
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Ngăn không cho form reload trang

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    // Kiểm tra tài khoản hợp lệ
    const isValidAccount = validAccounts.some(
        (account) => account.username === username && account.password === password
    );

    if (isValidAccount) {
        // Nếu đúng tài khoản, chuyển hướng đến trang landing page
        window.location.href = "landingPage.html";
    } else {
        // Nếu sai tài khoản, hiển thị thông báo lỗi
        errorMessage.textContent = "Tên đăng nhập hoặc mật khẩu không đúng!";
    }
    if (isValidAccount) {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "landingPage.html";
    }
    
});
