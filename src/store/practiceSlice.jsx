import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  words: [],           // لیست کلمات فعلی
  currentIndex: 0,     // آخرین کلمه تمرین شده
  transcript: "",      // ترنسکریپت فعلی
  isTraining: false,   // وضعیت تمرین
  phase: "idle",       // idle | playing | recording
};

export const practiceSlice = createSlice({
  name: "practice",
  initialState,
  reducers: {
    setWords: (state, action) => {
      state.words = action.payload;
    },
    nextWord: (state) => {
      state.currentIndex = (state.currentIndex + 1) % state.words.length;
    },
    setTranscript: (state, action) => {
      state.transcript = action.payload;
    },
    clearTranscript: (state) => {
      state.transcript = "";
    },
    setTraining: (state, action) => {
      state.isTraining = action.payload;
    },
    setPhase: (state, action) => {
      state.phase = action.payload;
    },
    setIndex: (state, action) => {
      state.currentIndex = action.payload;
    },
  },
});

export const {
  setWords,
  nextWord,
  setTranscript,
  clearTranscript,
  setTraining,
  setPhase,
  setIndex,
} = practiceSlice.actions;

export default practiceSlice.reducer;
