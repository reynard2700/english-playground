// ============================================================
// AUDIO MANAGER — MP3 per kata + Support Frasa Khusus
// ============================================================

let currentAudio = null;

// Daftar kata yang didukung (nama file MP3)
const supportedWords = new Set([
    // Kata dasar
    'find', 'temukan', 'great', 'try-again', 'good-job',
    'cat', 'dog', 'bird', 'fish', 'cow',
    'eat', 'drink', 'play', 'sleep', 'wash',
    'whats-this', 'one', 'two', 'three',
    'apple', 'banana', 'carrot', 'give-me',
    // Game 4: Feed the Monster
    'feed-the-monster', 'monster-happy',
    // Your Pet
    'yummy', 'clean', 'play-pet', 'level-up', 'new-pet'
]);

// Daftar frasa khusus (bukan per kata)
const specialPhrases = {
    'feed the monster': 'audio/feed-the-monster.mp3',
    'monster happy': 'audio/monster-happy.mp3',
    'yummy': 'audio/yummy.mp3',
    'clean': 'audio/clean.mp3',
    'play-pet': 'audio/play-pet.mp3',
    'level-up': 'audio/level-up.mp3',
    'new-pet': 'audio/new-pet.mp3'
};

function getAudioFileName(word) {
    let key = word.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!key) return null;
    if (key === 'whats' || key === 'this') return null;
    if (key === 'whats-this') return 'audio/whats-this.mp3';
    if (supportedWords.has(key)) {
        return `audio/${key}.mp3`;
    }
    return null;
}

export function speak(text, lang = 'en-US', onEnd = null) {
    console.log('🔊 speak() dipanggil dengan teks:', text);

    // Hentikan audio yang sedang berjalan
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Cek apakah teks adalah frasa khusus
    const lowerText = text.toLowerCase().trim();
    if (specialPhrases[lowerText]) {
        const src = specialPhrases[lowerText];
        console.log(`  → Frasa khusus: "${text}" -> file: ${src}`);
        const audio = new Audio(src);
        currentAudio = audio;
        audio.onended = () => {
            currentAudio = null;
            if (onEnd) onEnd();
        };
        audio.onerror = () => {
            console.warn(`⚠️ File frasa khusus tidak ditemukan: ${src}`);
            currentAudio = null;
            if (onEnd) onEnd();
        };
        audio.play().catch((err) => {
            console.warn(`⚠️ Gagal memutar frasa khusus: ${src}`, err);
            currentAudio = null;
            if (onEnd) onEnd();
        });
        return;
    }

    // Bukan frasa khusus, proses per kata
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const audioFiles = [];

    for (let w of words) {
        const lower = w.toLowerCase();
        if (lower === "what's" || lower === "whats") {
            audioFiles.push('audio/whats-this.mp3');
            console.log('  → Deteksi "whats", tambahkan whats-this.mp3');
            continue;
        }
        if (lower === 'this') continue;
        const file = getAudioFileName(w);
        if (file) {
            audioFiles.push(file);
            console.log(`  → Kata "${w}" -> file: ${file}`);
        } else {
            console.warn(`  → Kata "${w}" tidak didukung, diabaikan`);
        }
    }

    if (audioFiles.length === 0) {
        console.warn('⚠️ Tidak ada file MP3 yang didukung untuk teks:', text);
        if (onEnd) onEnd();
        return;
    }

    let index = 0;
    function playNext() {
        if (index >= audioFiles.length) {
            currentAudio = null;
            console.log('✅ Semua file selesai diputar.');
            if (onEnd) onEnd();
            return;
        }
        const src = audioFiles[index++];
        console.log(`▶️ Memutar file: ${src}`);
        const audio = new Audio(src);
        currentAudio = audio;

        audio.onerror = () => {
            console.error(`❌ Gagal memuat file: ${src}`);
            if (currentAudio === audio) currentAudio = null;
            playNext();
        };

        audio.onended = () => {
            console.log(`⏹️ Selesai memutar: ${src}`);
            if (currentAudio === audio) currentAudio = null;
            setTimeout(playNext, 200);
        };

        audio.play().catch((err) => {
            console.error(`❌ Gagal memutar file: ${src}`, err);
            if (currentAudio === audio) currentAudio = null;
            playNext();
        });
    }

    playNext();
}