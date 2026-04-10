/**
 * TTS Utility: Selects the best available English voice.
 * Modern browsers include high-quality "Google" or "Microsoft" voices.
 * This function prioritizes those over the default robotic system voice.
 */
export function getBestEnglishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();

  // Priority list of high-quality voice names
  const preferredNames = [
    'Google US English',
    'Google UK English Female',
    'Google UK English Male',
    'Microsoft Zira Desktop',
    'Microsoft Zira',
    'Microsoft David',
    'Microsoft Mark',
    'Samantha',
    'Karen',
    'Lee'
  ];

  // 1. Try to find preferred voices by name
  for (const name of preferredNames) {
    const voice = voices.find(v => v.name.includes(name));
    if (voice) return voice;
  }

  // 2. Fallback to any "Google" English voice (often best quality on Chrome)
  const googleVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
  if (googleVoice) return googleVoice;

  // 3. Fallback to any English voice
  return voices.find(v => v.lang.startsWith('en'));
}

/**
 * Helper to speak text using the best available voice.
 */
export function speak(text: string, lang: string = 'en-US') {
  if (!('speechSynthesis' in window)) return;

  // Cancel any currently playing speech to prevent overlap
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1;

  const voice = getBestEnglishVoice();
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}
