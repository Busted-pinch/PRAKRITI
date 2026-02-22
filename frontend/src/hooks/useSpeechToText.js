import { useState, useRef } from "react";

/**
 * useSpeechToText — Toggle-style hook (ChatGPT / Gemini behaviour).
 *  - First call to toggleListening() → starts continuous recognition.
 *  - Second call to toggleListening() → stops recognition; accumulated transcript
 *    is passed to onResult so the caller can put it in the input bar.
 *  - Language is read from localStorage key "appLanguage" (e.g. "mr-IN").
 *
 * @param {(transcript: string) => void} onResult
 * @returns {{ toggleListening: () => void, isListening: boolean }}
 */
export const useSpeechToText = (onResult) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const accumulatedRef = useRef(""); // collects all interim/final results while mic is open

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        // Fire callback with everything heard so far
        if (accumulatedRef.current.trim() && onResult) {
            onResult(accumulatedRef.current.trim());
        }
        accumulatedRef.current = "";
        setIsListening(false);
    };

    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        // Pre-request mic permission
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => { });
        }

        const recognition = new SpeechRecognition();

        const currentLang = localStorage.getItem("appLanguage") || "en-IN";
        recognition.lang = currentLang;
        recognition.interimResults = true;  // show live transcript as it builds up
        recognition.continuous = true;       // keep going until user clicks stop

        recognition.onstart = () => {
            accumulatedRef.current = "";
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            // Build the full transcript from all result segments
            let fullTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                fullTranscript += event.results[i][0].transcript;
            }
            // Live-preview the transcript in the input as the user speaks
            if (onResult) onResult(fullTranscript);
            accumulatedRef.current = fullTranscript;
        };

        recognition.onend = () => {
            // Called when recognition ends for any reason (including .stop())
            // If the user didn't manually click stop (e.g. browser auto-stopped),
            // make sure we clean up state gracefully.
            setIsListening(false);
            recognitionRef.current = null;
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
            recognitionRef.current = null;
            accumulatedRef.current = "";

            switch (event.error) {
                case "no-speech":
                    // Silently ignore — user may not have spoken yet
                    break;
                case "not-allowed":
                case "permission-denied":
                    alert("Microphone access was denied. Please allow mic permission in your browser settings.");
                    break;
                case "network":
                    alert("Network error during speech recognition. Check your connection.");
                    break;
                default:
                    console.warn("Speech error:", event.error);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return { toggleListening, isListening };
};
