import {
  playSound as playNotificationSoundHelper,
  isNotificationSoundEnabled,
  unlockNotificationAudio,
  playNotificationSound,
  speakText,
} from "@/services/notificationSound";

export function playSound(text?: string) {
  playNotificationSoundHelper(text);
}

export { isNotificationSoundEnabled, unlockNotificationAudio, playNotificationSound, speakText };
export default playSound;
