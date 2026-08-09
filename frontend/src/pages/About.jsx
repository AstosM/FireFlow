function About() {
  return (
    <div className="about-page">

      <div className="about-card">

        <div className="about-icon">
          🔥
        </div>

        <h1>
          About FireFlow
        </h1>

        <p className="about-intro">
          FireFlow is a fast and secure file-sharing platform
          designed to make transferring files between devices
          simple and effortless.
        </p>


        <div className="about-section">

          <h2>
            🚀 What is FireFlow?
          </h2>

          <p>
            FireFlow allows users to upload a file and instantly
            receive a unique FireFlow code, shareable link and
            QR code. Another person can use the code or QR code
            to receive the file.
          </p>

        </div>


        <div className="about-section">

          <h2>
            🔄 How does it work?
          </h2>

          <div className="steps">

            <div className="step">
              <span>1</span>
              <div>
                <h3>Upload</h3>
                <p>
                  Select a file and upload it to FireFlow.
                </p>
              </div>
            </div>


            <div className="step">
              <span>2</span>
              <div>
                <h3>Share</h3>
                <p>
                  FireFlow generates a unique code,
                  download link and QR code.
                </p>
              </div>
            </div>


            <div className="step">
              <span>3</span>
              <div>
                <h3>Receive</h3>
                <p>
                  Enter the FireFlow code or scan the QR
                  code to download the file.
                </p>
              </div>
            </div>

          </div>

        </div>


        <div className="about-section">

          <h2>
            🔐 Security Features
          </h2>

          <div className="feature-list">

            <div>🔒 Optional password protection</div>

            <div>⏱️ Automatic file expiry</div>

            <div>📥 Download limits</div>

            <div>⚡ One-time downloads</div>

            <div>📱 QR-code sharing</div>

            <div>🔑 Unique FireFlow codes</div>

          </div>

        </div>


        <div className="about-footer">

          <p>
            Built with ❤️ using React and FastAPI.
          </p>

          <span>
            © 2026 FireFlow
          </span>

        </div>

      </div>

    </div>
  );
}

export default About;