// ============================================================
// VOCABULARY LIBRARY — Tambah kata di sini untuk long-term
// ============================================================
export const VOCABULARY = [
    // === ACTIVITIES (Aktivitas Harian) ===
    { id: 'eat',   word: 'Eat',   emoji: '🍽️', category: 'activity' },
    { id: 'drink', word: 'Drink', emoji: '🥤', category: 'activity' },
    { id: 'play',  word: 'Play',  emoji: '🧸', category: 'activity' },
    { id: 'sleep', word: 'Sleep', emoji: '🛌', category: 'activity' },
    { id: 'wash',  word: 'Wash',  emoji: '🧼', category: 'activity' },
    // === ANIMALS (Hewan) ===
    { id: 'cat',   word: 'Cat',   emoji: '🐱', category: 'animal' },
    { id: 'dog',   word: 'Dog',   emoji: '🐶', category: 'animal' },
    { id: 'bird',  word: 'Bird',  emoji: '🐦', category: 'animal' },
    { id: 'fish',  word: 'Fish',  emoji: '🐟', category: 'animal' },
    { id: 'cow',   word: 'Cow',   emoji: '🐮', category: 'animal' }
];

// Untuk kemudahan, export berdasarkan ID
export const vocabMap = Object.fromEntries(VOCABULARY.map(v => [v.id, v]));