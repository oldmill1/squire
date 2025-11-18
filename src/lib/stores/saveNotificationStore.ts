import { writable } from 'svelte/store';

export interface SaveNotification {
  message: string;
  timestamp: Date;
}

export const saveNotificationStore = writable<SaveNotification | null>(null);
let notificationTimeout: number | null = null;

export function showSaveNotification() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Clear any existing timeout
  if (notificationTimeout !== null) {
    clearTimeout(notificationTimeout);
  }
  
  saveNotificationStore.set({
    message: `Saved at ${timeString}`,
    timestamp: now
  });
  
  // Clear notification after 5 seconds
  notificationTimeout = setTimeout(() => {
    saveNotificationStore.set(null);
    notificationTimeout = null;
  }, 5000);
}
