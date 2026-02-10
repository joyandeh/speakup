import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

export default function Result() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <h2 className="page-title">نتیجه تمرین</h2>
      <p className="page-subtitle">مقایسه جمله شما با جمله صحیح</p>

      <div className="card">
        <p>You said:</p>
        <p><i>How are you to day</i></p>

        <p>Correct:</p>
        <p><b>How are you today</b></p>

        <p>Score: 78%</p>
      </div>

      <div className="button-row">
        <button onClick={() => navigate("/practice")} className="secondary">
          تلاش دوباره
        </button>

        <button onClick={() => navigate("/finish")} className="primary">
          جمله بعدی
        </button>
      </div>
    </MainLayout>
  );
}
