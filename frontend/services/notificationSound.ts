const SOUND_PREFERENCE_KEY = "dinedesk_notification_sound_enabled";
const SOUND_PREFERENCE_EVENT = "dinedesk:notification-sound-preference";
const SEEN_KITCHEN_ORDERS_KEY = "dinedesk_seen_kitchen_order_ids";

let audioContext: AudioContext | null = null;
let inMemorySeenKitchenOrderIds: Set<string> | null = null;
let inMemorySoundPreference: boolean | null = null;

export function isNotificationSoundEnabled() {
  if (typeof window === "undefined") return true;
  if (inMemorySoundPreference !== null) return inMemorySoundPreference;

  try {
    return window.localStorage.getItem(SOUND_PREFERENCE_KEY) !== "false";
  } catch {
    return inMemorySoundPreference ?? true;
  }
}

function getAudioContext() {
  if (typeof window === "undefined") return null;

  try {
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) return null;
    audioContext ??= new AudioContextConstructor();
    return audioContext;
  } catch {
    return null;
  }
}

export function unlockNotificationAudio() {
  if (!isNotificationSoundEnabled()) return;

  const context = getAudioContext();
  if (context?.state === "suspended") {
    void context.resume().catch(() => undefined);
  }
}

export function setNotificationSoundEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(SOUND_PREFERENCE_KEY, String(enabled));
    inMemorySoundPreference = null;
  } catch {
    inMemorySoundPreference = enabled;
  }
  window.dispatchEvent(new Event(SOUND_PREFERENCE_EVENT));

  if (enabled) unlockNotificationAudio();
}

export function subscribeToNotificationSoundPreference(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SOUND_PREFERENCE_KEY || event.key === null) {
      inMemorySoundPreference = null;
      onChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SOUND_PREFERENCE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SOUND_PREFERENCE_EVENT, onChange);
  };
}

export function playNotificationSound() {
  if (!isNotificationSoundEnabled()) return;

  const context = getAudioContext();
  if (!context) return;

  const playTone = () => {
    const startTime = context.currentTime + 0.01;
    [880, 1175].forEach((frequency, index) => {
      const start = startTime + index * 0.13;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.16, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.11);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.12);
    });
  };

  if (context.state === "running") {
    playTone();
  } else {
    void context.resume().then(playTone).catch(() => undefined);
  }
}

export function speakOrderPlaced() {
  if (!isNotificationSoundEnabled() || typeof window === "undefined") return;

  try {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return;
    const announcement = new SpeechSynthesisUtterance("Order successfully placed!");
    announcement.lang = "en-US";
    window.speechSynthesis.speak(announcement);
  } catch {
    // Speech may be unavailable or blocked by browser audio policies.
  }
}

export function speakNewOrderReceived() {
  if (!isNotificationSoundEnabled() || typeof window === "undefined") return;

  try {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return;
    const announcement = new SpeechSynthesisUtterance("New Order Received!");
    announcement.lang = "en-US";
    window.speechSynthesis.speak(announcement);
  } catch {
    // Speech may be unavailable or blocked by browser audio policies.
  }
}

export function speakText(text: string) {
  if (!isNotificationSoundEnabled() || typeof window === "undefined" || !text) return;

  try {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return;
    window.speechSynthesis.cancel();
    const announcement = new SpeechSynthesisUtterance(text);
    announcement.lang = "en-US";
    window.speechSynthesis.speak(announcement);
  } catch {
    // Speech may be unavailable or blocked by browser audio policies.
  }
}

export function playSound(text?: string) {
  if (!isNotificationSoundEnabled() || typeof window === "undefined") return;

  unlockNotificationAudio();
  playNotificationSound();

  if (text) {
    speakText(text);
  }
}

/**
 * Marks the first Kitchen result as a baseline. Later calls return only IDs
 * that have not already been announced in this browser tab session.
 */
export function getNewKitchenOrderIds(currentOrderIds: string[]) {
  if (typeof window === "undefined") return [];

  let storedIds: string[] | null = null;
  try {
    const stored = window.sessionStorage.getItem(SEEN_KITCHEN_ORDERS_KEY);
    if (stored !== null) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        storedIds = parsed.filter((id): id is string => typeof id === "string");
      }
    } else if (inMemorySeenKitchenOrderIds) {
      storedIds = [...inMemorySeenKitchenOrderIds];
    }
  } catch {
    if (inMemorySeenKitchenOrderIds) {
      storedIds = [...inMemorySeenKitchenOrderIds];
    }
  }

  const currentIds = [...new Set(currentOrderIds)];
  if (storedIds === null) {
    inMemorySeenKitchenOrderIds = new Set(currentIds);
    try {
      window.sessionStorage.setItem(SEEN_KITCHEN_ORDERS_KEY, JSON.stringify(currentIds));
    } catch {
      // Sound detection remains active for this page even without persistence.
    }
    return [];
  }

  const seenIds = new Set(storedIds);
  const newIds = currentIds.filter((id) => !seenIds.has(id));
  inMemorySeenKitchenOrderIds = new Set([...seenIds, ...newIds]);
  try {
    window.sessionStorage.setItem(
      SEEN_KITCHEN_ORDERS_KEY,
      JSON.stringify([...seenIds, ...newIds])
    );
  } catch {
    // Sound detection remains active for this page even without persistence.
  }
  return newIds;
}
