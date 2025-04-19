export function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
export function getFromStorage(key, fallback = null) {
    const val = localStorage.getItem(key);
    if (!val) return fallback;
    try { return JSON.parse(val); } catch { return fallback; }
}