// Danh sách từ thường gặp
const commonWords = ['hello', 'goodbye', 'computer', 'beautiful', 'education'];

document.getElementById('searchInput').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        searchWord(); // Gọi hàm tra từ khi nhấn Enter
    }
});

// Khởi tạo danh sách từ
function initFeaturedWords() {
    const container = document.getElementById('featuredWords');
    commonWords.forEach(word => {
        const card = document.createElement('div');
        card.className = 'word-card';
        card.textContent = word;
        card.onclick = () => searchWord(word);
        container.appendChild(card);
    });
}  

// Xử lý tra từ
async function searchWord(inputWord) {
    const word = inputWord || document.getElementById('searchInput').value.trim();
    
    // Ẩn các từ gợi ý ngay khi bắt đầu tìm kiếm
    document.getElementById('featuredWords').style.display = 'none';
    
    if (!word) {
        // Hiển thị lại từ gợi ý nếu input rỗng
        document.getElementById('featuredWords').style.display = 'grid';
        return;
    }

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();
        displayResult(data[0]);
    } catch (error) {
        document.getElementById('result').innerHTML = `
            <h3>Không tìm thấy từ "${word}"</h3>
            <p>Vui lòng kiểm tra lại chính tả</p>
        `;
    }
}


// Hiển thị kết quả tra từ
function displayResult(data) {
    const resultDiv = document.getElementById('result');

    // Lọc phiên âm hợp lệ (chỉ lấy những phiên âm có nghĩa hoặc có audio)
    const validPhonetics = data.phonetics.filter(ph => ph.text || ph.audio);

    let html = `
        <div class="result-header">
            <h2>${data.word}</h2>
            <span class="close-button" onclick="closeResult()">×</span>
        </div>
        ${validPhonetics.map(ph => `
            <div class="phonetic">
                Phiên âm: ${ph.text || ''} 
                ${ph.audio ? `<span class="audio-icon" onclick="playAudio('${ph.audio}')">▶️ Nghe</span>` : ''}
            </div>
        `).join('')}
    `;

    if (validPhonetics.length === 0) {
        html += `<p>Không có thông tin phiên âm.</p>`;
    }

    data.meanings.forEach(meaning => {
        html += `
            <div class="meaning">
                <h3>Loại từ: ${meaning.partOfSpeech}</h3>
                <ul>
                    ${meaning.definitions.slice(0, 3).map(def => `
                        <li>
                            Định nghĩa: ${def.definition}
                            ${def.example ? `<div class="example">
                                📝 Ví dụ: "${def.example}" 
                                <span class="audio-icon" onclick="speakText('${def.example}')">▶️ Nghe</span>
                            </div>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    });

    resultDiv.innerHTML = html;
    resultDiv.style.display = 'block';
}

// Xóa kết quả tra từ và hiển thị lại danh sách từ thường gặp
function clearResult() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Xóa nội dung kết quả
    document.getElementById('featuredWords').style.display = 'grid'; // Hiển thị lại danh sách từ thường gặp
}

function closeResult() {
    document.getElementById('result').style.display = 'none';
    document.getElementById('featuredWords').style.display = 'grid';
}

// Khởi tạo danh sách từ thường gặp
function initFeaturedWords() {
    const container = document.getElementById('featuredWords');
    commonWords.forEach(word => {
        const card = document.createElement('div');
        card.className = 'word-card';
        card.innerHTML = `<span>${word}</span>`;
        card.onclick = () => searchWord(word);
        container.appendChild(card);
    });
}

// Phát âm thanh từ API
function playAudio(url) {
    new Audio(url).play();
}

// Text-to-Speech cho ví dụ
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

// Khởi tạo trang
window.onload = initFeaturedWords;
