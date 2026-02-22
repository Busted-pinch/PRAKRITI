/**
 * pickFemaleVoice — selects the best available female voice for the given lang.
 * Priority order:
 *   1. Zira (Windows, sweet US-English female)
 *   2. Samantha (macOS, natural US-English female)
 *   3. Google UK English Female (Chrome)
 *   4. Any voice whose name contains "female" or "woman" (case-insensitive)
 *   5. Any voice matching the requested language whose name suggests female
 *   6. First voice matching the requested language
 *   7. First available voice (absolute fallback)
 */
const PREFERRED_FEMALE_NAMES = [
    'zira',         // Windows 10/11 — sweet, clear
    'samantha',     // macOS — natural & pleasant
    'google uk english female',
    'google us english',
    'karen',        // macOS Australian female
    'moira',        // macOS Irish female
    'tessa',        // macOS South African female
    'veena',        // macOS Indian English female
    'victoria',     // macOS
    'allison',
    'ava',
    'susan',
    'female',
    'woman',
];

const pickFemaleVoice = (lang) => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const lower = (s) => (s || '').toLowerCase();
    const langPrefix = lang.split('-')[0]; // e.g. "en" from "en-IN"

    // 1. Try preferred names, exact lang match first
    for (const pref of PREFERRED_FEMALE_NAMES) {
        const v = voices.find(
            (v) => lower(v.name).includes(pref) && v.lang.startsWith(langPrefix)
        );
        if (v) return v;
    }

    // 2. Try preferred names without lang restriction
    for (const pref of PREFERRED_FEMALE_NAMES) {
        const v = voices.find((v) => lower(v.name).includes(pref));
        if (v) return v;
    }

    // 3. Any voice for the requested lang
    const langMatch = voices.find((v) => v.lang.startsWith(langPrefix));
    if (langMatch) return langMatch;

    return null; // let the browser pick its default
};

/**
 * speakText — Language-aware, female-voiced text-to-speech utility.
 *
 * @param {string} text
 * @param {() => void} [onStart]
 * @param {() => void} [onEnd]
 */
export const speakText = (text, onStart, onEnd) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const lang = localStorage.getItem('appLanguage') || 'en-IN';
    utterance.lang = lang;
    utterance.rate = 0.95;   // slightly slower = clearer, more pleasant
    utterance.pitch = 1.1;   // just a touch higher = softer, feminine feel
    utterance.volume = 1;

    // Voices may not be loaded yet — try immediately, then on voiceschanged
    const applyVoice = () => {
        const voice = pickFemaleVoice(lang);
        if (voice) utterance.voice = voice;
    };

    applyVoice();

    if (!utterance.voice) {
        // Some browsers (Firefox, first load on Chrome) load voices async
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            applyVoice();
        }, { once: true });
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
};

/**
 * stopSpeech — Cancels any ongoing speech synthesis.
 */
export const stopSpeech = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
};
