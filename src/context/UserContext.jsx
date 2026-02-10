import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login با JWT
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8001/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("نام کاربری یا رمز عبور اشتباه است");
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.access); // ذخیره توکن
      setToken(data.access);

      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
  };

  return (
    <UserContext.Provider value={{ token, login, logout, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook برای راحتی استفاده در کامپوننت‌ها
export function useUser() {
  return useContext(UserContext);
}
