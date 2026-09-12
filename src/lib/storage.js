const KEYS = {
  contacts: "safeband:contacts",
  history: "safeband:history",
  settings: "safeband:settings",
};

const DEFAULT_SETTINGS = {
  theme: "system",
  alarmSound: true,
  autoFallDetection: false,
  safeZone: null, // { lat, lng, radius }
  heartRateThreshold: 110,
};

function isBrowser() {
  return typeof window !== "undefined";
}

function read(key, fallback) {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / serialization errors
  }
}

// Contacts
export function getContacts() {
  return read(KEYS.contacts, []);
}

export function setContacts(contacts) {
  write(KEYS.contacts, contacts);
  return contacts;
}

// History
export function getHistory() {
  return read(KEYS.history, []);
}

export function addHistoryEntry(entry) {
  const history = getHistory();
  const next = [
    { id: crypto.randomUUID(), timestamp: Date.now(), ...entry },
    ...history,
  ].slice(0, 100);
  write(KEYS.history, next);
  return next;
}

export function clearHistory() {
  write(KEYS.history, []);
  return [];
}

// Settings
export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) };
}

export function setSettings(partial) {
  const next = { ...getSettings(), ...partial };
  write(KEYS.settings, next);
  return next;
}

export { DEFAULT_SETTINGS };
