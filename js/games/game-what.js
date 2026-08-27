// ============================================================
// GAME 2: WHAT'S THIS? — FULL (Audio: "What's this?" + "Find X")
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

export function startGameWhat(onComplete) {
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
    document.getElementById('game-title').textContent = '❓ What\'s This?';
    document.getElementById('game-mascot').textContent = '👧';
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

    // Pilihan: 1 benar + 2 salah
    let options = [targetWord];
    const others = VOCABULARY.filter(v => v.id !== targetWord.id)
                            .sort(() => Math.random() - 0.5);
    for (let i = 0; i < 2 && i < others.length; i++) {
        options.push(others[i]);
    }
    options = options.sort(() => Math.random() - 0.5);

    gameArea.innerHTML = '';
    
    // Gambar besar
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = 'width:100%;text-align:center;font-size:5rem;padding:10px 0;';
    imageContainer.textContent = targetWord.emoji;
    gameArea.appendChild(imageContainer);

    // Tombol pilihan
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;gap:12px;width:100%;';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'game-card';
        btn.dataset.id = opt.id;
        btn.style.cssText = 'width:100px;height:80px;font-size:1.4rem;font-weight:bold;border:none;border-radius:20px;background:#faf1e7;box-shadow:0 4px 0 #d6c9bb;cursor:pointer;touch-action:manipulation;transition:all 0.15s;';
        btn.textContent = opt.word;
        btn.addEventListener('click', () => handleOptionClick(btn, opt.id));
        optionsContainer.appendChild(btn);
    });
    gameArea.appendChild(optionsContainer);

    // Audio instruksi: "What's this?" lalu "Find X"
    const questionText = "What's this?";
    const findText = `Find ${targetWord.word}`;
    feedbackEl.textContent = `🔊 ${questionText}`;

    // 🔥 PERBAIKAN: Pastikan "What's this?" diputar dulu, baru "Find X"
    speak(questionText, 'en-US', () => {
        speak(findText, 'en-US', () => {
            isWaitingForAnswer = true;
            feedbackEl.innerHTML = `🔊 ${findText} <span style="font-size:1.2rem;">👆 Pilih katanya!</span>`;
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
        btn.style.color = 'white';
        score++;
        updateScore();
        feedbackEl.textContent = '✅ Great! ' + currentTarget.word + '!';
        isWaitingForAnswer = false;
        isTransitioning = true;
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            currentRound++;
            isTransitioning = false;
            timeoutId = null;
            nextQuestion();
        }, 700);
    } else {
        btn.classList.add('wrong');
        btn.style.background = '#f2a6a6';
        feedbackEl.textContent = '🔁 Try again! Coba yang lain.';
        speak('Try again', 'en-US');
        setTimeout(() => {
            btn.classList.remove('wrong');
            btn.style.background = '#faf1e7';
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
                feedbackEl.textContent = '💡 Petunjuk: cari kata ' + currentTarget.emoji;
                speak('Hint find ' + currentTarget.word, 'en-US');
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