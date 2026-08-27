// ============================================================
// PET UI — Logika Data + UI (Terpisah)
// ============================================================
import {
    getPetData, savePetData, resetPet, changePetType, changePetName,
    addPoints, feedPet, bathPet, playPet, getLevelInfo,
    getCurrentPetType, PET_TYPES, ACTION_COSTS, hasEnoughPoints
} from './pet-system.js';

// --- STATE GLOBAL ---
let petData = getPetData();
let isAnimating = false;

// --- REFERENSI ELEMEN (akan diisi jika ada) ---
let petEmoji, petWrapper, petNameInput, petPointsDisplay;
let petHealth, petHunger, petHappiness;
let levelProgressFill, levelProgressText;
let btnFeed, btnBath, btnPlay, btnChangePet, btnResetPet, btnBackHome;

// ============================================================
// FUNGSI EKSPOR — Dipanggil dari game (aman tanpa DOM)
// ============================================================
export function addPointsFromGame(amount) {
    const result = addPoints(petData, amount);
    petData = result.data;
    savePetData(petData);

    if (petEmoji) {
        renderPet();
        if (result.levelUp) {
            setPetAnimation('pet-anim-levelup', 1600);
            showSparkles();
            import('./audio-manager.js').then(module => {
                module.speak('level-up', 'en-US');
            });
            setTimeout(() => {
                alert(`🎉 Level UP! Pet sekarang Level ${result.newLevel}!`);
            }, 300);
        }
    }
    return result;
}

// ============================================================
// INISIALISASI (Hanya jika elemen pet ditemukan)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const emoji = document.getElementById('pet-emoji');
    if (!emoji) {
        console.log('🐾 Pet UI: Halaman bukan pet.html, UI tidak diinisialisasi.');
        return;
    }

    petEmoji = emoji;
    petWrapper = document.getElementById('pet-emoji-wrapper');
    petNameInput = document.getElementById('pet-name-input');
    petPointsDisplay = document.getElementById('pet-points-display');
    petHealth = document.getElementById('pet-health');
    petHunger = document.getElementById('pet-hunger');
    petHappiness = document.getElementById('pet-happiness');
    levelProgressFill = document.getElementById('level-progress-fill');
    levelProgressText = document.getElementById('level-progress-text');

    btnFeed = document.getElementById('btn-feed');
    btnBath = document.getElementById('btn-bath');
    btnPlay = document.getElementById('btn-play');
    btnChangePet = document.getElementById('btn-change-pet');
    btnResetPet = document.getElementById('btn-reset-pet');
    btnBackHome = document.getElementById('btn-back-home');

    if (!petWrapper || !petNameInput) {
        console.error('❌ Elemen pet tidak lengkap! Periksa file pet.html.');
        return;
    }

    renderPet();
    petWrapper.classList.add('pet-anim-idle');
    attachEvents();
});

// ============================================================
// FUNGSI RENDER
// ============================================================
function renderPet() {
    if (!petEmoji) return;
    const petType = getCurrentPetType(petData);
    petEmoji.textContent = petType.emoji;
    petWrapper.className = 'pet-emoji-wrapper';
    if (petType.size === 'large') {
        petWrapper.classList.add('trex');
    }
    if (petType.size === 'small') {
        petWrapper.style.fontSize = '6rem';
    } else {
        petWrapper.style.fontSize = '';
    }

    petNameInput.value = petData.name;
    petPointsDisplay.textContent = petData.points;
    petHealth.textContent = Math.round(petData.health);
    petHunger.textContent = Math.round(petData.hunger);
    petHappiness.textContent = Math.round(petData.happiness);

    const levelInfo = getLevelInfo(petData);
    levelProgressFill.style.width = levelInfo.progress + '%';
    levelProgressText.textContent = `Level ${levelInfo.currentLevel}  (${levelInfo.pointsInLevel}/100)`;

    btnFeed.disabled = !hasEnoughPoints(petData, 'feed');
    btnBath.disabled = !hasEnoughPoints(petData, 'bath');
    btnPlay.disabled = !hasEnoughPoints(petData, 'play');

    btnFeed.querySelector('.cost').textContent = `-${ACTION_COSTS.feed} ⭐`;
    btnBath.querySelector('.cost').textContent = `-${ACTION_COSTS.bath} ⭐`;
    btnPlay.querySelector('.cost').textContent = `-${ACTION_COSTS.play} ⭐`;
}

// ============================================================
// ANIMASI & EFEK
// ============================================================
function setPetAnimation(animationClass, duration = 2000) {
    if (!petWrapper) return;
    if (isAnimating) return;
    isAnimating = true;
    petWrapper.classList.remove('pet-anim-idle', 'pet-anim-eating', 'pet-anim-bathing', 'pet-anim-playing', 'pet-anim-levelup');
    petWrapper.classList.add(animationClass);
    setTimeout(() => {
        petWrapper.classList.remove(animationClass);
        petWrapper.classList.add('pet-anim-idle');
        isAnimating = false;
    }, duration);
}

function showSparkles() {
    const area = document.getElementById('pet-area');
    if (!area) return;
    const container = document.createElement('div');
    container.className = 'sparkle-container';
    const emojis = ['⭐', '✨', '🌟', '🎉', '💫'];
    for (let i = 0; i < 15; i++) {
        const span = document.createElement('span');
        span.className = 'sparkle';
        span.textContent = emojis[i % emojis.length];
        span.style.left = (Math.random() * 80 + 10) + '%';
        span.style.top = (Math.random() * 60 + 10) + '%';
        span.style.animationDelay = (Math.random() * 0.5) + 's';
        span.style.fontSize = (1.2 + Math.random() * 1.8) + 'rem';
        container.appendChild(span);
    }
    area.appendChild(container);
    setTimeout(() => {
        container.remove();
    }, 2000);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function attachEvents() {
    // Ganti nama
    petNameInput.addEventListener('change', () => {
        petData = changePetName(petData, petNameInput.value);
        renderPet();
    });
    petNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            petNameInput.blur();
        }
    });

    // Beri makan
    btnFeed.addEventListener('click', () => {
        if (isAnimating) return;
        const result = feedPet(petData);
        if (result.success) {
            petData = result.data;
            setPetAnimation('pet-anim-eating', 1800);
            renderPet();
            import('./audio-manager.js').then(module => {
                module.speak('yummy', 'en-US');
            });
        } else {
            alert('⭐ Poin tidak cukup! Main game dulu ya!');
        }
    });

    // Mandikan
    btnBath.addEventListener('click', () => {
        if (isAnimating) return;
        const result = bathPet(petData);
        if (result.success) {
            petData = result.data;
            setPetAnimation('pet-anim-bathing', 2400);
            renderPet();
            import('./audio-manager.js').then(module => {
                module.speak('clean', 'en-US');
            });
        } else {
            alert('⭐ Poin tidak cukup! Main game dulu ya!');
        }
    });

    // Ajak main — pakai play-pet.mp3
    btnPlay.addEventListener('click', () => {
        if (isAnimating) return;
        const result = playPet(petData);
        if (result.success) {
            petData = result.data;
            setPetAnimation('pet-anim-playing', 2400);
            renderPet();
            import('./audio-manager.js').then(module => {
                module.speak('play-pet', 'en-US');
            });
        } else {
            alert('⭐ Poin tidak cukup! Main game dulu ya!');
        }
    });

    // Ganti hewan
    btnChangePet.addEventListener('click', () => {
        const currentIndex = PET_TYPES.findIndex(p => p.id === petData.type);
        const nextIndex = (currentIndex + 1) % PET_TYPES.length;
        petData = changePetType(petData, PET_TYPES[nextIndex].id);
        renderPet();
        setPetAnimation('pet-anim-levelup', 1000);
        import('./audio-manager.js').then(module => {
            module.speak('new-pet', 'en-US');
        });
    });

    // Reset pet
    btnResetPet.addEventListener('click', () => {
        if (confirm('Yakin mau reset hewan peliharaan? Semua poin dan level akan hilang!')) {
            petData = resetPet();
            renderPet();
            setPetAnimation('pet-anim-levelup', 1000);
            alert('🔄 Pet sudah di-reset!');
        }
    });

    // Kembali ke menu
    btnBackHome.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}