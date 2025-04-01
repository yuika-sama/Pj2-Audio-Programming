// Danh sách các bài nghe có sẵn
const localAudios = [
    {
        "id": "Test_01",
        "name": "Bài nghe Test 01",
        "duration": 45,
        "path": "../assets/audio/Test_01.mp3"
    },
    {
        "id": "Test_02",
        "name": "Bài nghe Test 02",
        "duration": 45,
        "path": "../assets/audio/Test_02.mp3"
    },
    {
        "id": "Test_03",
        "name": "Bài nghe Test 03",
        "duration": 45,
        "path": "../assets/audio/Test_03.mp3"
    },
    {
        "id": "Test_04",
        "name": "Bài nghe Test 04",
        "duration": 45,
        "path": "../assets/audio/Test_04.mp3"
    },
    {
        "id": "Test_05",
        "name": "Bài nghe Test 05",
        "duration": 45,
        "path": "../assets/audio/Test_05.mp3"
    },
    {
        "id": "Test_06",
        "name": "Bài nghe Test 06",
        "duration": 45,
        "path": "../assets/audio/Test_06.mp3"
    },
    {
        "id": "Test_07",
        "name": "Bài nghe Test 07",
        "duration": 45,
        "path": "../assets/audio/Test_07.mp3"
    },
    {
        "id": "Test_08",
        "name": "Bài nghe Test 08",
        "duration": 45,
        "path": "../assets/audio/Test_08.mp3"
    },
    {
        "id": "Test_09",
        "name": "Bài nghe Test 09",
        "duration": 45,
        "path": "../assets/audio/Test_09.mp3"
    },
    {
        "id": "Test_10",
        "name": "Bài nghe Test 10",
        "duration": 45,
        "path": "../assets/audio/Test_10.mp3"
    }
]

const difficultyLevels = {
    easy: 100,
    moderate: 100,
    medium: 100,
    hard: 100,
    extreme: 100
};

// Chọn ngẫu nhiên một bài nghe từ danh sách
const selectedAudio = localAudios[Math.floor(Math.random() * (localAudios.length))];

function loadLocalAudioInfo() {
    // Cập nhật UI với thông tin bài nghe
    document.getElementById("examTitle").textContent = selectedAudio.name;
    document.getElementById("examDuration").textContent = selectedAudio.duration + " phút";
}

// Gọi hàm tải thông tin bài nghe
loadLocalAudioInfo();

// Cập nhật số câu hỏi khi chọn độ khó
document.querySelectorAll("input[name='difficulty']").forEach(input => {
    input.addEventListener("change", function () {
        document.getElementById("questionCount").textContent = difficultyLevels[this.value];
    });
});

// Xử lý sự kiện khi bấm nút "Bắt đầu làm bài"
document.getElementById("startButton").addEventListener("click", function () {
    const selectedDifficulty = document.querySelector("input[name='difficulty']:checked").value;
    const questionCount = difficultyLevels[selectedDifficulty];
    
    // Lấy ID của audio để sử dụng làm tên file PDF
    const audioId = selectedAudio.id;
    
    // Chuyển hướng đến trang exam.html với đầy đủ thông tin bài nghe được chọn và độ khó
    window.location.href = `exam.html?audioId=${encodeURIComponent(audioId)}&audioTitle=${encodeURIComponent(audioId)}&audioPath=${encodeURIComponent(selectedAudio.path)}&difficulty=${encodeURIComponent(selectedDifficulty)}&questions=${encodeURIComponent(questionCount)}`;
});
