// Hàm điều hướng đến trang khác
function navigateTo(page) {
    window.location.href = page; // Chuyển hướng đến trang được chỉ định
}

// Xử lý nút đăng xuất
document.getElementById("logoutBtn").addEventListener("click", function () {
    // Xóa trạng thái đăng nhập trong localStorage
    localStorage.removeItem("isLoggedIn");
    // Chuyển hướng về trang đăng nhập
    window.location.href = "login.html";
});

// Kiểm tra trạng thái đăng nhập (bắt buộc phải đăng nhập để vào trang này)
if (!localStorage.getItem("isLoggedIn")) {
    window.location.href = "login.html"; // Nếu chưa đăng nhập, quay về trang login
}
