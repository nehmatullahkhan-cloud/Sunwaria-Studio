export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notifications");
    return false;
  }
  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    // Mobile vibration pattern: Vibrate 200ms, pause 100ms, vibrate 200ms
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
    
    new Notification(title, {
      body,
      icon: "https://cdn-icons-png.flaticon.com/512/4358/4358667.png", // Generic Mosque Icon
      tag: "ramadan-alert" // Prevents stacking
    });
  }
};

export const playAlarm = (type: 'beep' | 'alarm') => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  if (type === 'beep') {
    // Simple short beep for 1 hour warning
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  } else {
    // More urgent alarm for exact time
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    
    oscillator.start();
    
    // Pulse effect
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.0);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    
    oscillator.stop(ctx.currentTime + 1.5);
  }
};