/** International Morse timing: dit = one unit, dah = three, element gap = one,
 * character gap = three, word gap = seven. Playback is synthesized locally. */
let context: AudioContext | undefined;
export async function playMorse(message: string, wpm = 18): Promise<void> {
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  context ??= new AudioContextClass();
  if (context.state === 'suspended') await context.resume();
  const { morseMap } = await import('../data/courses');
  const unit = 1.2 / wpm;
  let at = context.currentTime + 0.08;
  const words = message.toUpperCase().split(' ');
  words.forEach((word, wordIndex) => {
    [...word].forEach((character, charIndex) => {
      const pattern = morseMap[character];
      if (!pattern) return;
      [...pattern].forEach((mark, markIndex) => {
        const duration = mark === '-' ? 3 * unit : unit;
        const oscillator = context!.createOscillator();
        const gain = context!.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = 650;
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.12, at + 0.005);
        gain.gain.setValueAtTime(0.12, at + duration - 0.005);
        gain.gain.linearRampToValueAtTime(0, at + duration);
        oscillator.connect(gain); gain.connect(context!.destination);
        oscillator.start(at); oscillator.stop(at + duration + 0.01);
        at += duration + (markIndex === pattern.length - 1 ? 0 : unit);
      });
      if (charIndex < word.length - 1) at += 3 * unit;
    });
    if (wordIndex < words.length - 1) at += 7 * unit;
  });
}
