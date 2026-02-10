import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios"; // axios instance با interceptor

/* =========================
   Async Thunk: Login
========================= */
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, thunkAPI) => {
    try {
      // استفاده از axios به جای fetch
      const response = await api.post("/api/token/", { username, password });

      // ذخیره access و refresh token در localStorage
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);

      return response.data.access;
    } catch (err) {
      // اگر خطا از سرور اومد، پیام مناسب برگردان
      return thunkAPI.rejectWithValue(
        err.response?.data?.detail || "نام کاربری یا رمز عبور اشتباه است"
      );
    }
  }
);

/* =========================
   Slice
========================= */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("accessToken") || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
