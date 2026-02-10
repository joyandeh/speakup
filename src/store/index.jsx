import { configureStore } from "@reduxjs/toolkit";
import practiceReducer from "./practiceSlice";

export const store = configureStore({
  reducer: {
    practice: practiceReducer,
  },
});
