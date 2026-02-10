import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import {
  setWords,
  nextWord,
  clearTranscript,
  setTraining,
  setPhase,
} from "../store/practiceSlice";
import similarity from "string-similarity";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import wordsData from "../data/words.json";

const DEFAULT_THRESHOLD = 0.9;
const wordsCacheKey = (lessonId) => `wordsCache:${lessonId}`;

export default function Practice() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { words, currentIndex, isTraining, phase } = useSelector(
    (state) => state.practice
  );

  const [similarities, setSimilarities] = useState([]);
  const [lastSimilarity, setLastSimilarity] = useState(null);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [lastTranscript, setLastTranscript] = useState("");

  const normalize = (text) =>
    text
      .toLowerCase()
      .replace(/[^\w\s']/g, "")
      .split(/\s+/)
      .filter(Boolean);

  const getMatchedWords = (target, said) => {
    const targetWords = normalize(target);
    const saidWords = new Set(normalize(said));
    return targetWords.map((w) => ({ w, ok: saidWords.has(w) }));
  };

  const {
    transcript: localTranscript,
    finalTranscript,
    finalTick,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearTranscript: clearLocalTranscript,
  } = useSpeechRecognition();

  const audioRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const lessonId = queryParams.get("lessonId");

  // Load words from local JSON
  useEffect(() => {
    if (!lessonId) return;

    try {
      const words = wordsData.filter(
        (w) => String(w.lessonId) === String(lessonId)
      );
      dispatch(setWords(words));
      localStorage.setItem(wordsCacheKey(lessonId), JSON.stringify(words));
    } catch (err) {
      const cached = localStorage.getItem(wordsCacheKey(lessonId));
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          dispatch(setWords(parsed));
          return;
        } catch {
          // ignore cache parse errors
        }
      }
      console.error("Error loading words:", err);
    }
  }, [lessonId, dispatch]);

  // Play audio
  useEffect(() => {
    if (!isTraining || phase !== "playing") return;
    if (!audioRef.current || !words[currentIndex]) return;

    audioRef.current.src = words[currentIndex].audio;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  }, [currentIndex, phase, isTraining, words]);

  // Start recording after audio ends
  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.onended = () => {
      if (!isTraining) return;
      clearLocalTranscript();
      dispatch(setPhase("recording"));
      resumeRecording();
    };
  }, [isTraining, dispatch, clearLocalTranscript, resumeRecording]);

  // Compare transcript
  useEffect(() => {
    if (phase !== "recording" || !words[currentIndex]) return;
    if (!finalTranscript.trim()) return;

    pauseRecording();
    clearLocalTranscript();

    const similarityScore = similarity.compareTwoStrings(
      finalTranscript.toLowerCase().trim(),
      words[currentIndex].word.toLowerCase().trim()
    );

    setSimilarities((prev) => [...prev, similarityScore]);
    setLastSimilarity(similarityScore);
    setLastTranscript(finalTranscript.trim());

    if (similarityScore >= threshold) {
      dispatch(nextWord());
      dispatch(setPhase("playing"));
      setLastSimilarity(null);
    } else {
      dispatch(setPhase("playing"));
    }
  }, [
    finalTick,
    finalTranscript,
    phase,
    currentIndex,
    words,
    dispatch,
    pauseRecording,
    clearLocalTranscript,
    threshold,
  ]);

  const startTraining = async () => {
    if (isTraining || !words.length) return;
    dispatch(setTraining(true));
    dispatch(setPhase("playing"));

    await startRecording();
    pauseRecording();
  };

  const stopTraining = () => {
    pauseRecording();
    stopRecording();
    dispatch(setTraining(false));
    dispatch(setPhase("idle"));
    dispatch(clearTranscript());
    clearLocalTranscript();
  };

  const finishTraining = () => {
    stopTraining();
    navigate("/finish", { state: { similarities, totalWords: words.length } });
  };

  const goNextWord = () => {
    dispatch(nextWord());
    dispatch(setPhase("playing"));
    setLastSimilarity(null);
  };

  const progress = words.length
    ? Math.round(((currentIndex + 1) / words.length) * 100)
    : 0;

  if (!lessonId) return <MainLayout>No lesson selected.</MainLayout>;
  if (!words.length) return <MainLayout>Loading words...</MainLayout>;

  return (
    <MainLayout>
      <div className="practice-shell full">
        <div className="practice-stack">
        <div className="practice-topbar">
          <div className="practice-progress">
            <div className="card-header">
              <span>پیشرفت</span>
              <span className="muted">{currentIndex + 1} / {words.length}</span>
            </div>
            <div className="progress-shell">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="practice-hero">
          <h2 className="page-title">تمرین گفتار</h2>
          <p className="page-subtitle">کلمه را بشنو، تکرار کن و جلو برو.</p>

          {words[currentIndex] && (
            <>
              <div className="focus-word">
                {lastSimilarity !== null && lastSimilarity < threshold
                  ? getMatchedWords(words[currentIndex].word, lastTranscript).map(
                      (t, i) => (
                        <span
                          key={`${t.w}-${i}`}
                          className={t.ok ? "word-correct" : "word-pending"}
                        >
                          {t.w}
                        </span>
                      )
                    )
                  : words[currentIndex].word}
              </div>
              <div className="focus-translation">
                {words[currentIndex].translation}
              </div>
              <div className="focus-phonetic">{words[currentIndex].phone}</div>
            </>
          )}

          <div className="focus-meter">
            <span className="score-badge">
              درصد شباهت:{" "}
              {lastSimilarity === null ? "-" : `${(lastSimilarity * 100).toFixed(0)}%`}
            </span>
          </div>
        </div>

        <div className="practice-frame">
          <div className="controls-shell">
            <div className="practice-controls">
              <button
                onClick={startTraining}
                className="icon-btn primary"
                title="شروع تمرین"
              >
                ▶
              </button>
              <button
                onClick={stopTraining}
                className="icon-btn secondary"
                title="توقف"
              >
                ⏸
              </button>
              <button
                onClick={goNextWord}
                className="icon-btn ghost"
                title="کلمه بعدی"
              >
                ⏭
              </button>
              <button
                onClick={finishTraining}
                className="icon-btn ghost"
                title="اتمام"
              >
                ⏹
              </button>
            </div>

            <div className="threshold-card">
              <div className="card-header">
                <span>حد تشابه</span>
                <span className="muted">{Math.round(threshold * 100)}%</span>
              </div>
              <div className="threshold-inline">
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={Math.round(threshold * 100)}
                  onChange={(e) => setThreshold(Number(e.target.value) / 100)}
                />
              </div>
            </div>
          </div>
        </div>

        <audio ref={audioRef} />
        </div>
      </div>
    </MainLayout>
  );
}
