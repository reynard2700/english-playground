// ============================================================
// GAME 1: FIND IT! — dengan stopGame untuk tombol Back
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

export function startGameFind(onComplete) {
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
    document.getElementById('game-title').textContent = '🔍 Find It!';
    document.getElementById('game-mascot').textContent = '👦';
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

    let options = [targetWord];
    const others = VOCABULARY.filter(v => v.id !== targetWord.id)
                            .sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3 && i < others.length; i++) {
        options.push(others[i]);
    }
    options = options.sort(() => Math.random() - 0.5);

    gameArea.innerHTML = '';
    options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.dataset.id = opt.id;
        card.innerHTML = `
            <span>${opt.emoji}</span>
            <span class="label">${opt.word}</span>
        `;
        card.addEventListener('click', () => handleCardClick(card, opt.id));
        gameArea.appendChild(card);
    });

    const indoText = `Temukan ${targetWord.word}`;
    const engText = `Find ${targetWord.word}`;
    feedbackEl.textContent = `🔊 ${engText}`;

    speak(indoText, 'id-ID', () => {
        speak(engText, 'en-US', () => {
            isWaitingForAnswer = true;
            feedbackEl.innerHTML = `🔊 ${engText} <span style="font-size:1.2rem;">👆 Tap gambarnya!</span>`;
        });
    });
}

function handleCardClick(card, id) {
    if (!isWaitingForAnswer) return;
    if (card.classList.contains('correct') || card.classList.contains('wrong')) return;
    if (isTransitioning) return;

    const isCorrect = (id === currentTarget.id);
    if (isCorrect) {
        card.classList.add('correct');
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
        card.classList.add('wrong');
        feedbackEl.textContent = '🔁 Try again! Coba lihat lagi.';
        speak('Try again', 'en-US');
        setTimeout(() => {
            card.classList.remove('wrong');
        }, 800);
        setTimeout(() => {
            if (isWaitingForAnswer) {
                const targetCard = gameArea.querySelector(`[data-id="${currentTarget.id}"]`);
                if (targetCard) {
                    targetCard.style.boxShadow = '0 0 0 6px #ffb347';
                    setTimeout(() => {
                        targetCard.style.boxShadow = '';
                    }, 800);
                }
                feedbackEl.textContent = '💡 Petunjuk: cari ' + currentTarget.emoji;
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

// ============================================================
// FUNGSI UNTUK BERHENTI (dipanggil dari tombol Back)
// ============================================================
export function stopGame() {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    isWaitingForAnswer = false;
    isTransitioning = false;
    feedbackEl.textContent = '⏹️ Dihentikan.';
}