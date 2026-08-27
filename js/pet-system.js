// ============================================================
// PET SYSTEM — Logika Hewan Peliharaan
// ============================================================

// Daftar hewan yang tersedia
export const PET_TYPES = [
    { id: 'dog', emoji: '🐶', name: 'Anjing', size: 'normal' },
    { id: 'cat', emoji: '🐱', name: 'Kucing', size: 'normal' },
    { id: 'rabbit', emoji: '🐰', name: 'Kelinci', size: 'normal' },
    { id: 'bird', emoji: '🐦', name: 'Burung', size: 'small' },
    { id: 'trex', emoji: '🦖', name: 'T-Rex', size: 'large' }
];

// Data default pet
const DEFAULT_PET = {
    type: 'dog',
    name: 'Buddy',
    level: 1,
    points: 0,           // Total poin yang dikumpulkan
    health: 100,         // 0-100
    hunger: 100,         // 0-100 (tetap happy)
    happiness: 100,      // 0-100
    totalFeed: 0,
    totalBath: 0,
    totalPlay: 0
};

// Poin yang dibutuhkan per level
const POINTS_PER_LEVEL = 100;

// Harga aksi
export const ACTION_COSTS = {
    feed: 10,
    bath: 5,
    play: 15
};

// Efek aksi ke stat
const ACTION_EFFECTS = {
    feed: { hunger: 15, happiness: 5, health: 3 },
    bath: { health: 15, happiness: 5, hunger: -3 },
    play: { happiness: 20, health: 5, hunger: -8 }
};

// ============================================================
// FUNGSI UTAMA
// ============================================================

// Ambil data pet dari localStorage
export function getPetData() {
    try {
        const raw = localStorage.getItem('pet_data');
        if (raw) {
            const data = JSON.parse(raw);
            // Pastikan semua field ada
            return { ...DEFAULT_PET, ...data };
        }
    } catch (e) {
        console.warn('Gagal baca pet data, pakai default');
    }
    return { ...DEFAULT_PET };
}

// Simpan data pet
export function savePetData(data) {
    localStorage.setItem('pet_data', JSON.stringify(data));
}

// Reset pet ke default
export function resetPet() {
    const newPet = { ...DEFAULT_PET };
    savePetData(newPet);
    return newPet;
}

// Ganti tipe hewan
export function changePetType(data, newTypeId) {
    const petType = PET_TYPES.find(p => p.id === newTypeId);
    if (!petType) return data;
    data.type = newTypeId;
    savePetData(data);
    return data;
}

// Ganti nama
export function changePetName(data, newName) {
    data.name = newName.trim() || data.name;
    savePetData(data);
    return data;
}

// Tambah poin (dari game)
export function addPoints(data, amount) {
    data.points += amount;
    // Cek level up
    const oldLevel = data.level;
    const newLevel = Math.floor(data.points / POINTS_PER_LEVEL) + 1;
    if (newLevel > oldLevel) {
        data.level = newLevel;
        // Naik level: semua stat naik
        data.health = Math.min(100, data.health + 5);
        data.hunger = Math.min(100, data.hunger + 5);
        data.happiness = Math.min(100, data.happiness + 5);
        savePetData(data);
        return { data, levelUp: true, oldLevel, newLevel };
    }
    savePetData(data);
    return { data, levelUp: false };
}

// Beri makan
export function feedPet(data) {
    if (data.points < ACTION_COSTS.feed) {
        return { success: false, reason: 'Poin tidak cukup' };
    }
    data.points -= ACTION_COSTS.feed;
    data.hunger = Math.min(100, data.hunger + ACTION_EFFECTS.feed.hunger);
    data.happiness = Math.min(100, data.happiness + ACTION_EFFECTS.feed.happiness);
    data.health = Math.min(100, data.health + ACTION_EFFECTS.feed.health);
    data.totalFeed += 1;
    // Stat lain turun sedikit (alami)
    data.health = Math.max(0, data.health - 1);
    savePetData(data);
    return { success: true, data };
}

// Mandikan
export function bathPet(data) {
    if (data.points < ACTION_COSTS.bath) {
        return { success: false, reason: 'Poin tidak cukup' };
    }
    data.points -= ACTION_COSTS.bath;
    data.health = Math.min(100, data.health + ACTION_EFFECTS.bath.health);
    data.happiness = Math.min(100, data.happiness + ACTION_EFFECTS.bath.happiness);
    data.hunger = Math.max(0, data.hunger + ACTION_EFFECTS.bath.hunger);
    data.totalBath += 1;
    savePetData(data);
    return { success: true, data };
}

// Ajak main
export function playPet(data) {
    if (data.points < ACTION_COSTS.play) {
        return { success: false, reason: 'Poin tidak cukup' };
    }
    data.points -= ACTION_COSTS.play;
    data.happiness = Math.min(100, data.happiness + ACTION_EFFECTS.play.happiness);
    data.health = Math.min(100, data.health + ACTION_EFFECTS.play.health);
    data.hunger = Math.max(0, data.hunger + ACTION_EFFECTS.play.hunger);
    data.totalPlay += 1;
    savePetData(data);
    return { success: true, data };
}

// Dapatkan informasi level
export function getLevelInfo(data) {
    const currentLevel = data.level;
    const pointsInLevel = data.points - ((currentLevel - 1) * POINTS_PER_LEVEL);
    const pointsNeeded = POINTS_PER_LEVEL - pointsInLevel;
    const progress = Math.min(100, (pointsInLevel / POINTS_PER_LEVEL) * 100);
    return { currentLevel, pointsInLevel, pointsNeeded, progress };
}

// Dapatkan tipe hewan saat ini
export function getCurrentPetType(data) {
    return PET_TYPES.find(p => p.id === data.type) || PET_TYPES[0];
}

// Cek apakah poin cukup untuk aksi
export function hasEnoughPoints(data, action) {
    const cost = ACTION_COSTS[action];
    return data.points >= cost;
}