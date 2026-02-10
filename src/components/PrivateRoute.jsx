import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PrivateRoute({ children }) {
  // اول state را از Redux می‌گیریم
  const token = useSelector((state) => state.auth.token);

  // اگر state خالی است، localStorage را چک می‌کنیم
  const storedToken = localStorage.getItem("accessToken");

  // اگر هیچ توکنی موجود نیست → هدایت به login
  if (!token && !storedToken) {
    return <Navigate to="/login" replace />;
  }

  // در غیر این صورت → اجازه دسترسی
  return children;
}
