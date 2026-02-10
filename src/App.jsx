import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import Result from "./pages/Result";
import Finish from "./pages/Finish";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/result" element={<Result />} />
        <Route path="/finish" element={<Finish />} />
      </Routes>
    </BrowserRouter>
  );
}
