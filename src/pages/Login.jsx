import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../store/authSlice";
import MainLayout from "../layouts/MainLayout";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, loading, error } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ username, password }));
  };

  // اگر بعد از refresh صفحه token معتبر باشد → مستقیم redirect
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken && storedToken !== "null") {
      navigate("/home");
    }
  }, [navigate]);

  // وقتی login موفق بود → redirect
  useEffect(() => {
    if (token) {
      navigate("/home");
    }
  }, [token, navigate]);

  return (
    <MainLayout hideHeader>
      <h2 className="page-title">ورود به SpeakUp</h2>
      <p className="page-subtitle">برای شروع تمرین، وارد حساب شوید.</p>

      <form onSubmit={handleSubmit} className="form-stack">
        <input
          type="text"
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        <button className="primary" disabled={loading}>
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </MainLayout>
  );
}
