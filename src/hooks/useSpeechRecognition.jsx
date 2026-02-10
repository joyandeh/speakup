import { useEffect, useRef, useState } from "react";

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [finalTick, setFinalTick] = useState(0);
  const recognitionRef = useRef(null);
  const isPausedRef = useRef(false);
  const isRunningRef = useRef(false);
  const silenceTimerRef = useRef(null);

  useEffect(() => {
    return () => stopRecording();
  }, []);

  const startRecording = async () => {
    if (isRunningRef.current) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error("SpeechRecognition is not supported in this browser.");
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      if (!isRunningRef.current) return;
      if (isPausedRef.current) return;

      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript + " ";
        else interimText += result[0].transcript + " ";
      }

      if (finalText) {
        console.log("[speech] final:", finalText);
        setFinalTranscript((prev) => (prev + " " + finalText).trim());
        setTranscript((prev) => (prev + " " + finalText).trim());
      }

      if (interimText) {
        console.log("[speech] interim:", interimText);
        // Show interim text without permanently appending it
        setTranscript((prev) => {
          const base = finalTranscript || prev;
          return (base + " " + interimText).trim();
        });
      }

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (!isPausedRef.current) {
          setFinalTick((t) => t + 1);
        }
      }, 1200);
    };

    recognition.onerror = () => {
      // Keep it silent; UI handles errors elsewhere if needed
    };

    recognition.onend = () => {
      // Auto-restart if still running and not paused
      if (isRunningRef.current && !isPausedRef.current) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    isRunningRef.current = true;
    isPausedRef.current = false;
    recognition.start();
  };

  const pauseRecording = () => {
    isPausedRef.current = true;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
  };

  const resumeRecording = () => {
    if (!isRunningRef.current) return;
    isPausedRef.current = false;
    recognitionRef.current?.start();
  };

  const stopRecording = () => {
    isPausedRef.current = false;
    isRunningRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  };

  const clearTranscript = () => {
    setTranscript("");
    setFinalTranscript("");
  };

  return {
    transcript,
    finalTranscript,
    finalTick,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearTranscript,
  };
}
