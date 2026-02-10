import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function MainLayout({ children, hideHeader = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="app-wrapper">
      <div className="app">
        {!hideHeader && (
          <header className="app-header">
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
            <span className="app-title">SpeakUp</span>
          </header>
        )}

        {menuOpen && (
          <div
            className="menu-overlay"
            onClick={() => setMenuOpen(false)}
          ></div>
        )}

        <nav className={`side-menu ${menuOpen ? "open" : ""}`}>
          <button onClick={() => goTo("/home")}>Home</button>
          <button onClick={() => goTo("/practice")}>Practice</button>
        </nav>

        <main className="app-content">
          <div className="content-shell">{children}</div>
        </main>
      </div>
    </div>
  );
}
