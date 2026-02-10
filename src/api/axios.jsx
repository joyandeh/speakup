import axios from "axios";

// ایجاد instance از axios
const api = axios.create({
  baseURL: "http://127.0.0.1:8001",
});

// =========================
// Request Interceptor
// =========================
// قبل از هر request، access token را اضافه می‌کنیم
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// Response Interceptor
// =========================
// اگر access token منقضی شده باشد، refresh می‌کنیم و دوباره request را ارسال می‌کنیم
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // بررسی خطای 401 و اینکه این request قبلاً retry نشده باشد
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refreshToken");

        // گرفتن access جدید با refresh token
        const res = await axios.post(
          "http://127.0.0.1:8001/api/token/refresh/",
          { refresh }
        );

        // ذخیره access جدید
        localStorage.setItem("accessToken", res.data.access);

        // اضافه کردن access جدید به header
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;

        // دوباره ارسال request اصلی
        return api(originalRequest);
      } catch (err) {
        // اگر refresh هم شکست خورد → خروج از سیستم
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
