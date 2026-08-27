// ============================================================
// MAIN APP — Navigasi, Parent Gate, & Penghubung Game
// ============================================================
import { speak } from './audio-manager.js';
import { startGameFind, stopGame as stopGameFind } from './games/game-find.js';
import { startGameWhat, stopGame as stopGameWhat } from './games/game-what.js';
import { startGameFeed, stopGame as stopGameFeed } from './games/game-feed.js';

// Import fungsi dari pet-ui.js (untuk menambah poin)
import { addPointsFromGame } from './pet-ui.js';

// --- ELEMEN ---
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const parentModal = document.getElementById('parent-gate-modal');

const btnGameFind = document.getElementById('btn-game-find');
const btnGameWhat = document.getElementById('btn-game-what');
const btnGameFeed = document.getElementById('btn-game-feed');
const btnGamePet = document.getElementById('btn-game-pet');

const btnParent = document.getElementById('parent-gate-btn');
const closeModal = document.getElementById('close-modal');
const holdBtn = document.getElementById('hold-btn');
const holdProgress = document.getElementById('hold-progress-fill');
const btnReplay = document.getElementById('btn-replay');
const btnHome = document.getElementById('btn-home');
const starsDisplay = document.getElementById('stars-display');
const btnBackGame = document.getElementById('btn-back-game');

// --- NAVIGASI ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// --- FUNGSI BANTU (Progress & Emoji) ---
function getEmoji(word) {
    const map = {
        'Cat': '🐱', 'Dog': '🐶', 'Bird': '🐦', 'Fish': '🐟', 'Cow': '🐮',
        'Eat': '🍽️', 'Drink': '🥤', 'Play': '🧸', 'Sleep': '🛌', 'Wash': '🧼'
    };
    return map[word] || '📝';
}

function saveProgress(score) {
    let progress = JSON.parse(localStorage.getItem('english_progress') || '{"games":0,"stars":0,"words":[]}');
    progress.games = (progress.games || 0) + 1;
    progress.stars = (progress.stars || 0) + score;
    
    const allWords = ['Cat', 'Dog', 'Bird', 'Fish', 'Cow', 'Eat', 'Drink', 'Play', 'Sleep', 'Wash'];
    const existingWords = progress.words || [];
    const wordSet = new Set(existingWords.map(w => w.word || w));
    allWords.forEach(w => wordSet.add(w));
    progress.words = Array.from(wordSet).map(w => ({ word: w, emoji: getEmoji(w) }));
    
    localStorage.setItem('english_progress', JSON.stringify(progress));
    console.log('💾 Progress disimpan:', progress);
}

// --- TOMBOL GAME ---
btnGameFind.addEventListener('click', () => {
    startGameFind((score) => {
        showCelebration(score);
    });
});

btnGameWhat.addEventListener('click', () => {
    startGameWhat((score) => {
        showCelebration(score);
    });
});

btnGameFeed.addEventListener('click', () => {
    startGameFeed((score) => {
        showCelebration(score);
    });
});

// Tombol Your Pet — langsung buka halaman pet
btnGamePet.addEventListener('click', () => {
    window.location.href = 'pet.html';
});

// --- CELEBRATION & KIRIM POIN KE PET ---
function showCelebration(score) {
    showScreen('celebration-screen');
    const stars = score >= 4 ? '⭐⭐⭐' : (score >= 3 ? '⭐⭐' : '⭐');
    starsDisplay.textContent = stars;
    speak('Selamat', 'id-ID');
    saveProgress(score);
    
    // 🔥 Kirim poin ke pet!
    try {
        const result = addPointsFromGame(score);
        if (result && result.levelUp) {
            console.log('🎉 Pet naik level!');
        }
    } catch (e) {
        console.warn('⚠️ Gagal kirim poin ke pet:', e);
    }
}

btnReplay.addEventListener('click', () => {
    startGameFind((score) => {
        showCelebration(score);
    });
});

btnHome.addEventListener('click', () => {
    showScreen('main-menu');
});

// --- PARENT GATE ---
let holdInterval = null;
let holdTime = 0;

btnParent.addEventListener('click', () => {
    parentModal.classList.remove('hidden');
    holdTime = 0;
    holdProgress.style.width = '0%';
});

closeModal.addEventListener('click', () => {
    parentModal.classList.add('hidden');
    clearInterval(holdInterval);
    holdTime = 0;
    holdProgress.style.width = '0%';
});

holdBtn.addEventListener('mousedown', startHold);
holdBtn.addEventListener('touchstart', startHold);
holdBtn.addEventListener('mouseup', endHold);
holdBtn.addEventListener('touchend', endHold);
holdBtn.addEventListener('mouseleave', endHold);

function startHold(e) {
    e.preventDefault();
    holdTime = 0;
    holdProgress.style.width = '0%';
    clearInterval(holdInterval);
    holdInterval = setInterval(() => {
        holdTime += 0.1;
        const percent = Math.min((holdTime / 5) * 100, 100);
        holdProgress.style.width = percent + '%';
        if (holdTime >= 5) {
            clearInterval(holdInterval);
            window.location.href = 'parent.html';
        }
    }, 100);
}

function endHold(e) {
    e.preventDefault();
    clearInterval(holdInterval);
    if (holdTime < 5) {
        holdProgress.style.width = '0%';
        speak('Belum cukup', 'id-ID');
    }
}

// --- TOMBOL BACK ---
function stopAllGames() {
    stopGameFind();
    stopGameWhat();
    stopGameFeed();
}

if (btnBackGame) {
    btnBackGame.addEventListener('click', () => {
        stopAllGames();
        showScreen('main-menu');
        document.getElementById('game-feedback').textContent = '✨ Kembali ke beranda.';
    });
}

// --- VOICE INIT ---
document.addEventListener('click', () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
    }
}, { once: true });

// Tampilkan main menu
showScreen('main-menu');