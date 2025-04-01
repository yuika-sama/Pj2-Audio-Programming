// Lấy tham số từ URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        audioId: params.get("audioId"),
        audioTitle: params.get("audioTitle"),
        audioPath: params.get("audioPath"),
        difficulty: params.get("difficulty"),
        questionCount: parseInt(params.get("questions"), 10) || 100
    };
}

const { audioId, audioTitle, audioPath, difficulty, questionCount } = getQueryParams();


const difficultyMapping = {
    easy: "Dễ",
    moderate: "Vừa phải",
    medium: "Trung bình",
    hard: "Khó",
    extreme: "Huỷ diệt"
};

const difficultyText = difficultyMapping[difficulty] || "Không xác định";

// Cập nhật thông tin UI
const difficultyElement = document.getElementById("difficultyLevel");
difficultyElement.textContent = difficultyText;
difficultyElement.className = `difficulty-indicator difficulty-${difficulty}`;

// Lấy dữ liệu audio từ tham số URL được truyền từ trang examSelection
function loadLocalAudio() {
    // Cập nhật UI và audio source
    const examTitleElement = document.getElementById("examTitle");
    const pageTitleElement = document.getElementById("pageTitle")
    
    // Kiểm tra xem có tiêu đề không, nếu không thì hiển thị ID hoặc thông báo mặc định
    if (audioTitle) {
        examTitleElement.textContent = audioTitle;
        pageTitleElement.textContent = "Bài luyện nghe số " + audioTitle.substr(5, 7)
    } else if (audioId) {
        examTitleElement.textContent = `${audioId}`;
        pageTitleElement.textContent = "Bài luyện nghe số " + audioTitle.substr(5, 7)
    } else {
        examTitleElement.textContent = "Bài nghe chưa xác định";
    }
    
    const audioPlayer = document.getElementById("audioPlayer");
    const audioSource = document.getElementById("audioSource");
    
    // Đảm bảo có đường dẫn audio, nếu không thì sử dụng đường dẫn mặc định
    if (audioPath) {
        audioSource.src = decodeURIComponent(audioPath);
    } else {
        console.error("Không tìm thấy đường dẫn audio!");
        audioSource.src = "assets/default.mp3"; // Đường dẫn mặc định
    }
    
    audioPlayer.load();

    // Chặn menu chuột phải để ngăn tải xuống
    audioPlayer.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });

    // Thêm sự kiện chỉ áp dụng hiệu ứng khi nhấn phát
    audioPlayer.addEventListener('play', async () => {
        await applyDifficultyEffects(audioPlayer, difficulty);
    });
}
loadLocalAudio();

// Tải PDF viewer
function loadPDFViewer(audioTitle) {
    const pdfViewer = document.getElementById("pdfViewer");
    if (audioTitle) {
        pdfViewer.src = `../assets/tests/${audioTitle}.pdf`;
    } else {
        console.error("Không tìm thấy tên audio để tải PDF!");
        pdfViewer.src = "../assets/tests/default.pdf"; // Đường dẫn mặc định
    }
}
loadPDFViewer(audioId);

// Áp dụng bộ lọc cho audio dựa trên độ khó
async function applyDifficultyEffects(audioElement, difficulty) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audioElement);
    
    // Tạo các audio nodes cho các hiệu ứng âm thanh
    const gainNode = audioContext.createGain();
    const biquadFilter1 = audioContext.createBiquadFilter();
    const biquadFilter2 = audioContext.createBiquadFilter();
    const distortionNode = audioContext.createWaveShaper();
    
    let speed = 1;
    
    // Hàm tạo méo âm thanh
    function createDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; ++i) {
            const x = (i * 2) / samples - 1;
            curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
        }
        
        return curve;
    }
    
    // Thiết lập độ méo cho âm thanh
    function applyDistortion(amount) {
        distortionNode.curve = createDistortionCurve(amount);
        distortionNode.oversample = '4x';
    }
    
    // Áp dụng các hiệu ứng âm thanh dựa trên độ khó
    switch (difficulty) {
        case 'easy':
            // Chỉ áp dụng lọc lowshelf nhẹ, tăng bass
            biquadFilter1.type = "lowshelf";
            biquadFilter1.frequency.setValueAtTime(1000, audioContext.currentTime);
            biquadFilter1.gain.setValueAtTime(3, audioContext.currentTime);
            
            // Kết nối: source -> filter -> gain -> destination
            source.connect(biquadFilter1);
            biquadFilter1.connect(gainNode);
            gainNode.connect(audioContext.destination);

            break;
            
        case 'moderate':
            speed = 1.25;
            
            // Áp dụng bộ lọc peaking - tăng một dải tần số
            biquadFilter1.type = "peaking";
            biquadFilter1.frequency.setValueAtTime(1500, audioContext.currentTime);
            biquadFilter1.Q.setValueAtTime(2, audioContext.currentTime);
            biquadFilter1.gain.setValueAtTime(5, audioContext.currentTime);
            
            // Kết nối: source -> filter -> gain -> destination
            source.connect(biquadFilter1);
            biquadFilter1.connect(gainNode);
            gainNode.connect(audioContext.destination);

            break;
            
        case 'medium':
            speed = 1.25;
            
            // Sử dụng bộ lọc kép: highshelf + lowpass
            biquadFilter1.type = "highshelf";
            biquadFilter1.frequency.setValueAtTime(2000, audioContext.currentTime);
            biquadFilter1.gain.setValueAtTime(6, audioContext.currentTime);
            
            biquadFilter2.type = "lowpass";
            biquadFilter2.frequency.setValueAtTime(3500, audioContext.currentTime);
            biquadFilter2.Q.setValueAtTime(1, audioContext.currentTime);
            
            // Kết nối: source -> filter1 -> filter2 -> gain -> destination
            source.connect(biquadFilter1);
            biquadFilter1.connect(biquadFilter2);
            biquadFilter2.connect(gainNode);
            gainNode.connect(audioContext.destination);

            break;
            
        case 'hard':
            speed = 1.5;
            
            // Sử dụng bandpass filter để chỉ nghe được một dải tần số
            biquadFilter1.type = "bandpass";
            biquadFilter1.frequency.setValueAtTime(2500, audioContext.currentTime);
            biquadFilter1.Q.setValueAtTime(5, audioContext.currentTime);
            
            // Thêm một chút méo âm thanh nhẹ
            applyDistortion(10);
            
            // Kết nối: source -> filter -> distortion -> gain -> destination
            source.connect(biquadFilter1);
            biquadFilter1.connect(distortionNode);
            distortionNode.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Thêm sự kiện để thay đổi tần số bandpass theo thời gian
            const frequencyInterval = setInterval(() => {
                // Di chuyển tần số trong khoảng 1800-2200Hz
                const randomFreq = 1800 + Math.random() * 400;
                biquadFilter1.frequency.linearRampToValueAtTime(
                    randomFreq, 
                    audioContext.currentTime + 2
                );
            }, 5000);
            
            // Dừng interval khi audio dừng
            audioElement.addEventListener('pause', () => clearInterval(frequencyInterval));
            audioElement.addEventListener('ended', () => clearInterval(frequencyInterval));
            break;
            
        case 'extreme':
            speed = 1.5;
            
            // Áp dụng notch filter (loại bỏ một dải tần số quan trọng)
            biquadFilter1.type = "notch";
            biquadFilter1.frequency.setValueAtTime(3000, audioContext.currentTime);
            biquadFilter1.Q.setValueAtTime(10, audioContext.currentTime);
            
            // Thêm highpass filter (loại bỏ tần số thấp)
            biquadFilter2.type = "highpass";
            biquadFilter2.frequency.setValueAtTime(800, audioContext.currentTime);
            biquadFilter2.Q.setValueAtTime(2, audioContext.currentTime);
            
            // Áp dụng méo âm thanh mạnh
            applyDistortion(60);
            
            // Kết nối: source -> filter1 -> filter2 -> distortion -> gain -> destination
            source.connect(biquadFilter1);
            biquadFilter1.connect(biquadFilter2);
            biquadFilter2.connect(distortionNode);
            distortionNode.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Thêm sự kiện để thay đổi cả tần số và độ méo theo thời gian
            const extremeInterval = setInterval(() => {
                // Thay đổi notch filter
                const notchFreq = 2000 + Math.random() * 1000;
                biquadFilter1.frequency.linearRampToValueAtTime(
                    notchFreq, 
                    audioContext.currentTime + 1
                );
                
                // Thay đổi highpass filter
                const highpassFreq = 600 + Math.random() * 400;
                biquadFilter2.frequency.linearRampToValueAtTime(
                    highpassFreq, 
                    audioContext.currentTime + 1
                );
                
                // Thay đổi gain không quá 0.8 để tránh tiếng quá to
                const randomGain = 0.5 + Math.random() * 0.3;
                gainNode.gain.linearRampToValueAtTime(
                    randomGain, 
                    audioContext.currentTime + 1
                );
            }, 3000);
            
            // Dừng interval khi audio dừng
            audioElement.addEventListener('pause', () => clearInterval(extremeInterval));
            audioElement.addEventListener('ended', () => clearInterval(extremeInterval));
            break;
            
        default:
            console.log('Chế độ khó không xác định');
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
    }
    
    // Thay đổi tốc độ phát
    changePlaybackSpeed(audioElement, speed);
}



// Thay đổi tốc độ phát lại
function changePlaybackSpeed(audioElement, speed) {
    if (speed < 0.1 || speed > 5) {
        console.error("Tốc độ không hợp lệ! Vui lòng chọn giá trị từ 0.1 đến 5.");
        return;
    }
    audioElement.playbackRate = speed;
}

// Tạo câu hỏi trắc nghiệm
function generateQuestions(count) {
    const questionsContainer = document.getElementById("questionsContainer");
    questionsContainer.innerHTML = "";
    
    for (let i = 1; i <= count; i++) {
        const questionDiv = document.createElement("div");
        questionDiv.classList.add("question-card");
        questionDiv.innerHTML = `
            <strong>Câu hỏi ${i}</strong>
            <div>
                <span id = "question-input"><input type="radio" name="question${i}" value="A"> A</span>
                <span id = "question-input"><input type="radio" name="question${i}" value="B"> B</span>
                <span id = "question-input"><input type="radio" name="question${i}" value="C"> C</span>
                <span id = "question-input"><input type="radio" name="question${i}" value="D"> D</span>
            </div>
        `;
        questionsContainer.appendChild(questionDiv);
    }
}
generateQuestions(questionCount || 100);

// Nộp bài
document.getElementById("submitBtn").addEventListener("click", () => {
    alert("Bài làm đã được gửi! Cảm ơn bạn.");
});

