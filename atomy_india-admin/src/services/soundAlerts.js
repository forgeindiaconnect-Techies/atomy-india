// Web Audio API Synthesizer for High-Impact Real-time Admin Notifications
// Completely self-contained - zero external MP3/WAV dependencies, instant response

let sharedAudioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

// Auto-unlock WebAudio on initial window interaction across all events
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {}
  };
  ['click', 'keydown', 'pointerdown', 'touchstart', 'scroll', 'focus', 'mousemove'].forEach(ev => {
    window.addEventListener(ev, unlockAudio, { passive: true, once: ev === 'mousemove' });
  });
}

/**
 * Strong Order Alert Sound:
 * A rich 2-phrase ascending melodic fanfare alarm chime (E5-G#5-B5-E6 + G#5-B5-E6-G#6)
 * with sparkling harmonics, high visibility, and warm bell decay.
 */
export async function playOrderAlertSound(volume = 0.9) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {}
    }

    const masterGain = ctx.createGain();
    const safeVol = Math.max(0.2, Math.min(volume, 1.0));
    masterGain.gain.setValueAtTime(safeVol, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // 2-phrase fanfare chime sequence
    const notes = [
      // Phrase 1 (Melodic order fanfare)
      { freq: 659.25, time: 0.00, dur: 0.55 },
      { freq: 830.61, time: 0.12, dur: 0.55 },
      { freq: 987.77, time: 0.24, dur: 0.60 },
      { freq: 1318.51, time: 0.36, dur: 0.95 },
      // Phrase 2 (Second emphasis chime)
      { freq: 830.61, time: 0.55, dur: 0.45 },
      { freq: 987.77, time: 0.67, dur: 0.50 },
      { freq: 1318.51, time: 0.79, dur: 0.55 },
      { freq: 1661.22, time: 0.91, dur: 1.10 }
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const noteGain = ctx.createGain();

      const startTime = ctx.currentTime + time;
      const stopTime = startTime + dur;

      // Primary bell tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      // Sparkling second harmonic
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(freq * 2, startTime);

      // Chime envelope: fast attack, exponential bell decay
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.6, startTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      osc.connect(noteGain);
      oscHarmonic.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(startTime);
      oscHarmonic.start(startTime);
      osc.stop(stopTime);
      oscHarmonic.stop(stopTime);
    });

    // Optional physical vibration on mobile/handheld devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([180, 80, 220]);
    }
  } catch (err) {
    console.warn('[Admin Sound] Order chime error:', err);
  }
}

/**
 * Strong Support Ticket Alert Sound:
 * An urgent, crisp double-pulse attention alert (A5 - D6 - A5 - D6)
 * designed to immediately alert the admin that a customer needs support.
 */
export function playSupportAlertSound(volume = 0.8) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.05, Math.min(volume, 1.0)), ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Urgent double pulse pattern
    const pulses = [
      { freq: 880.0, time: 0.00, dur: 0.16 },
      { freq: 1174.66, time: 0.12, dur: 0.28 },
      { freq: 880.0, time: 0.38, dur: 0.16 },
      { freq: 1174.66, time: 0.50, dur: 0.40 }
    ];

    pulses.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const pulseGain = ctx.createGain();

      const startTime = ctx.currentTime + time;
      const stopTime = startTime + dur;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      pulseGain.gain.setValueAtTime(0, startTime);
      pulseGain.gain.linearRampToValueAtTime(0.65, startTime + 0.02);
      pulseGain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      osc.connect(pulseGain);
      pulseGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(stopTime);
    });

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([250, 100, 250]);
    }
  } catch (err) {
    console.warn('[Admin Sound] Support chime error:', err);
  }
}

/**
 * Trigger browser native desktop notification if user has granted permission
 */
export function sendDesktopNotification(title, options = {}) {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: 'https://image.atomy.com/IN/banner/90/788/251000000020788143752.svg',
        ...options
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, {
            icon: 'https://image.atomy.com/IN/banner/90/788/251000000020788143752.svg',
            ...options
          });
        }
      });
    }
  } catch (e) {
    console.warn('[Admin Notification] Desktop notification error:', e);
  }
}
