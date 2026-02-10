import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

export default function Finish() {
  const location = useLocation();
  const navigate = useNavigate();

  const { similarities = [], totalWords = 0 } = location.state || {};

  const averageSimilarity =
    similarities.length > 0
      ? (similarities.reduce((acc, val) => acc + val, 0) / similarities.length) * 100
      : 0;

  return (
    <MainLayout>
      <h2 className="page-title">نتایج تمرین شما</h2>
      <p className="page-subtitle">خلاصه عملکرد شما در این جلسه</p>

      <div className="card">
        <h3>تعداد کل کلمات</h3>
        <p style={{ fontSize: "20px", fontWeight: 600 }}>{totalWords}</p>
      </div>

      <div className="card">
        <h3>میانگین درصد تشابه</h3>
        <p style={{ fontSize: "20px", fontWeight: 600 }}>
          {averageSimilarity.toFixed(2)}٪
        </p>
        <div className="progress-shell" style={{ marginTop: 12 }}>
          <div
            className="progress-bar"
            style={{ width: `${averageSimilarity.toFixed(2)}%` }}
          ></div>
        </div>
      </div>

      <button
        className="primary"
        style={{ maxWidth: "200px", margin: "8px auto 0" }}
        onClick={() => navigate("/home")}
      >
        بازگشت به خانه
      </button>
    </MainLayout>
  );
}
