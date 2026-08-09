import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import { useState } from "react";

import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Receive from "./pages/Receive";
import About from "./pages/About";


function AppContent() {

  const [darkMode, setDarkMode] = useState(true);

  const location = useLocation();


  return (

    <div className={darkMode ? "app dark" : "app light"}>

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <Link
          to="/"
          className="nav-logo"
        >
          🔥 FireFlow
        </Link>


        <div className="nav-links">

          <Link
            to="/"
            className={
              location.pathname === "/"
                ? "nav-link active"
                : "nav-link"
            }
          >
            Home
          </Link>


          <Link
            to="/upload"
            className={
              location.pathname === "/upload"
                ? "nav-link active"
                : "nav-link"
            }
          >
            📤 Send File
          </Link>


          <Link
            to="/receive"
            className={
              location.pathname === "/receive"
                ? "nav-link active"
                : "nav-link"
            }
          >
            📥 Receive File
          </Link>


          <Link
            to="/about"
            className={
              location.pathname === "/about"
                ? "nav-link active"
                : "nav-link"
            }
          >
            ℹ️ About
          </Link>

        </div>


        {/* THEME BUTTON */}

        <button
          type="button"
          className="theme-button"
          onClick={() =>
            setDarkMode(prev => !prev)
          }
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

      </nav>


      {/* ================= PAGES ================= */}

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/upload"
          element={<Upload />}
        />

        <Route
          path="/receive"
          element={<Receive />}
        />

        <Route
          path="/about"
          element={<About />}
        />

      </Routes>

    </div>
  );
}


function App() {

  return (

    <BrowserRouter>

      <AppContent />

    </BrowserRouter>

  );
}


export default App;