import { Link } from "react-router-dom";

function Home() {
return ( <div className="home-container">

```
  <h1 className="logo">
    🔥 FireFlow
  </h1>

  <p className="tagline">
    Share files instantly, securely and effortlessly.
  </p>

  <div className="cards">

    <Link to="/upload" className="card-link">
      <div className="feature-card">

        <div className="icon">
          📤
        </div>

        <h2>
          Send Files
        </h2>

        <p>
          Upload files from your laptop or mobile and get a secure
          share link, QR code and FireFlow PIN.
        </p>

        <button type="button">
          Start Upload
        </button>

      </div>
    </Link>


    <Link to="/receive" className="card-link">
      <div className="feature-card">

        <div className="icon">
          📥
        </div>

        <h2>
          Receive Files
        </h2>

        <p>
          Enter a FireFlow code to instantly download files shared
          with you.
        </p>

        <button type="button">
          Receive File
        </button>

      </div>
    </Link>

  </div>
<footer className="home-footer">
  © 2026 FireFlow. All rights reserved.
</footer>
</div>
);
}

export default Home;