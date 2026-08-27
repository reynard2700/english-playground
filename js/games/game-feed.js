// ============================================================
// GAME 4: FEED THE MONSTER — Dengan Monster Ekspresi
// ============================================================
import { VOCABULARY } from '../vocab-data.js';
import { speak } from '../audio-manager.js';

let currentRound = 0;
const TOTAL_ROUNDS = 5;
let wordsForRound = [];
let currentTarget = null;
let score = 0;
let isWaitingForAnswer = false;
let gameCompleteCallback = null;
let timeoutId = null;
let isTransitioning = false;

const gameArea = document.getElementById('game-area');
const feedbackEl = document.getElementById('game-feedback');
const scoreEl = document.getElementById('game-score');

// Mapping kata ke terjemahan Indonesia
const translationMap = {
    'Eat': 'Makan',
    'Drink': 'Minum',
    'Play': 'Bermain',
    'Sleep': 'Tidur',
    'Wash': 'Cuci',
    'Cat': 'Kucing',
    'Dog': 'Anjing',
    'Bird': 'Burung',
    'Fish': 'Ikan',
    'Cow': 'Sapi',
    'Apple': 'Apel',
    'Banana': 'Pisang',
    'Carrot': 'Wortel'
};

let monsterEmoji = document.createElement('div'); // Untuk referensi

export function startGameFeed(onComplete) {
    gameCompleteCallback = onComplete;
    currentRound = 0;
    score = 0;
    isTransitioning = false;
    if (timeoutId) clearTimeout(timeoutId);
    updateScore();
    const shuffled = [...VOCABULARY].sort(() => Math.random() - 0.5);
    wordsForRound = shuffled.slice(0, TOTAL_ROUNDS);
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('game-screen').classList.add('active');
    document.getElementById('game-title').textContent = '👹 Feed the Monster!';
    document.getElementById('game-mascot').textContent = '👹';
    feedbackEl.textContent = '✨ Siap?';
    setTimeout(nextQuestion, 400);
}

function nextQuestion() {
    if (isTransitioning) return;
    if (currentRound >= TOTAL_ROUNDS) {
        endGame();
        return;
    }

    isWaitingForAnswer = false;
    const targetWord = wordsForRound[currentRound];
    currentTarget = targetWord;

    // Pilihan: 1 benar + 3 salah
    let options = [targetWord];
    const others = VOCABULARY.filter(v => v.id !== targetWord.id)
                            .sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3 && i < others.length; i++) {
        options.push(others[i]);
    }
    options = options.sort(() => Math.random() - 0.5);

    const translation = translationMap[targetWord.word] || targetWord.word;

    gameArea.innerHTML = '';
    
    // === BARIS 1: MONSTER (CEMBERUT/LAPAR) ===
    const monsterContainer = document.createElement('div');
    monsterContainer.style.cssText = 'width:100%;text-align:center;padding:4px 0;';
    monsterContainer.innerHTML = `
        <div id="monster-face" style="font-size:4rem;transition:all 0.3s;">👹</div>
        <div style="font-size:1rem;color:#7a6855;margin-top:-4px;">Monster lapar...</div>
    `;
    gameArea.appendChild(monsterContainer);
    monsterEmoji = monsterContainer;

    // === BARIS 2: "Feed the monster" ===
    const feedText = document.createElement('div');
    feedText.style.cssText = 'width:100%;text-align:center;font-size:1.8rem;font-weight:bold;color:#5b4b3a;padding:4px 0;';
    feedText.textContent = 'Feed the monster';
    gameArea.appendChild(feedText);

    // === BARIS 3: Kata yang harus diberikan + terjemahan ===
    const wordContainer = document.createElement('div');
    wordContainer.style.cssText = 'width:100%;text-align:center;padding:10px 0;background:#fff8ee;border-radius:24px;margin:6px 0;border:3px dashed #ffc857;';
    wordContainer.innerHTML = `
        <div style="font-size:2.8rem;font-weight:bold;color:#3d2e1e;">${targetWord.word}</div>
        <div style="font-size:1.2rem;color:#7a6855;">(${translation})</div>
    `;
    gameArea.appendChild(wordContainer);

    // === BARIS 4: Pilihan 4 gambar (hanya emoji) ===
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;gap:16px;width:100%;margin-top:8px;';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'game-card';
        btn.dataset.id = opt.id;
        btn.style.cssText = 'width:100px;height:100px;font-size:4rem;border:none;border-radius:20px;background:#faf1e7;box-shadow:0 4px 0 #d6c9bb;cursor:pointer;touch-action:manipulation;transition:all 0.15s;display:flex;align-items:center;justify-content:center;';
        btn.textContent = opt.emoji;
        btn.addEventListener('click', () => handleOptionClick(btn, opt.id));
        optionsContainer.appendChild(btn);
    });
    gameArea.appendChild(optionsContainer);

    // Audio: "Feed the monster" + nama item
    const feedAudio = 'Feed the monster';
    const itemAudio = targetWord.word;
    feedbackEl.textContent = `🔊 ${feedAudio} ... ${itemAudio}`;

    speak(feedAudio, 'en-US', () => {
        speak(itemAudio, 'en-US', () => {
            isWaitingForAnswer = true;
            feedbackEl.innerHTML = `🔊 ${feedAudio} ... ${itemAudio} <span style="font-size:1.2rem;">👆 Pilih gambarnya!</span>`;
        });
    });
}

function handleOptionClick(btn, id) {
    if (!isWaitingForAnswer) return;
    if (btn.classList.contains('correct') || btn.classList.contains('wrong')) return;
    if (isTransitioning) return;

    const isCorrect = (id === currentTarget.id);
    if (isCorrect) {
        btn.classList.add('correct');
        btn.style.background = '#6fbf4c';
        btn.style.border = '4px solid #4a9e2f';
        btn.style.boxShadow = '0 4px 0 #4a9e2f';
        score++;
        updateScore();
        feedbackEl.textContent = '✅ Yummy! ' + currentTarget.word + '! 🎉';
        isWaitingForAnswer = false;
        isTransitioning = true;
        
        // 🔥 MONSTER SENYUM!
        const monsterFace = document.getElementById('monster-face');
        if (monsterFace) {
            monsterFace.textContent = '😊';
            monsterFace.style.fontSize = '4.5rem';
        }
        // Ubah teks "Monster lapar..." menjadi "Monster senang!"
        const monsterLabel = monsterEmoji?.querySelector('div:last-child');
        if (monsterLabel) {
            monsterLabel.textContent = 'Monster senang! 🎉';
            monsterLabel.style.color = '#6fbf4c';
        }

        // 🔥 Putar "Yummy!" (pake monster-happy.mp3)
        speak('Yummy', 'en-US');
        
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            currentRound++;
            isTransitioning = false;
            timeoutId = null;
            nextQuestion();
        }, 1200);
    } else {
        btn.classList.add('wrong');
        btn.style.background = '#f2a6a6';
        btn.style.border = '4px solid #e07070';
        feedbackEl.textContent = '🔁 Try again! Coba yang lain.';
        speak('Try again', 'en-US');
        setTimeout(() => {
            btn.classList.remove('wrong');
            btn.style.background = '#faf1e7';
            btn.style.border = '4px solid transparent';
        }, 800);
        setTimeout(() => {
            if (isWaitingForAnswer) {
                const correctBtn = gameArea.querySelector(`button[data-id="${currentTarget.id}"]`);
                if (correctBtn) {
                    correctBtn.style.boxShadow = '0 0 0 4px #ffb347';
                    setTimeout(() => {
                        correctBtn.style.boxShadow = '';
                    }, 1500);
                }
                feedbackEl.textContent = '💡 Petunjuk: monster mau ' + currentTarget.emoji;
                speak('Hint ' + currentTarget.word, 'en-US');
            }
        }, 1200);
    }
}

function updateScore() {
    scoreEl.textContent = `⭐ ${score}`;
}

function endGame() {
    isWaitingForAnswer = false;
    isTransitioning = false;
    if (timeoutId) clearTimeout(timeoutId);
    feedbackEl.innerHTML = `🎉 Selesai! Skor: ${score}/${TOTAL_ROUNDS}`;
    speak(`Good job you got ${score} stars`, 'en-US');
    setTimeout(() => {
        if (gameCompleteCallback) {
            gameCompleteCallback(score);
        }
    }, 1800);
}

export function stopGame() {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    isWaitingForAnswer = false;
    isTransitioning = false;
    feedbackEl.textContent = '⏹️ Dihentikan.';
}