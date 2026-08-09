
import { useState } from "react";
import api from "../services/api";

function Upload() {
  const [mode, setMode] = useState("file");

  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  const [password, setPassword] = useState("");
  const [expiryType, setExpiryType] = useState("24_hours");
  const [maxDownloads, setMaxDownloads] = useState(3);
  const [oneTime, setOneTime] = useState(false);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // =========================================================
  // SELECT FILE
  // =========================================================

  function handleFile(e) {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  }

  // =========================================================
  // DRAG AND DROP
  // =========================================================

  function handleDrop(e) {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile) {
      setFile(droppedFile);
    }
  }

  // =========================================================
  // GET COMPLETE DOWNLOAD LINK
  // =========================================================

  function getFullLink() {
    const url = result?.download_url;

    if (!url) {
      return null;
    }

    return url.startsWith("http")
      ? url
      : `${import.meta.env.VITE_API_URL}${url}`;
  }

  // =========================================================
  // COPY DOWNLOAD LINK
  // =========================================================

  async function copyLink() {
    const fullLink = getFullLink();

    if (!fullLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(fullLink);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("COPY ERROR:", error);
    }
  }

  // =========================================================
  // WHATSAPP
  // =========================================================

  function shareWhatsApp() {
    const fullLink = getFullLink();

    if (!fullLink) {
      return;
    }

    const message =
      `🔥 FireFlow ${mode === "text" ? "Text" : "File"} Share\n\n` +
      `Download it here:\n${fullLink}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  // =========================================================
  // TELEGRAM
  // =========================================================

  function shareTelegram() {
    const fullLink = getFullLink();

    if (!fullLink) {
      return;
    }

    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(
        fullLink
      )}&text=${encodeURIComponent(
        `🔥 ${mode === "text" ? "Text" : "File"} shared through FireFlow`
      )}`,
      "_blank"
    );
  }

  // =========================================================
  // EMAIL
  // =========================================================

  function shareEmail() {
    const fullLink = getFullLink();

    if (!fullLink) {
      return;
    }

    const subject =
      `🔥 ${mode === "text" ? "Text" : "File"} shared through FireFlow`;

    const body =
      `Hello,\n\n` +
      `A ${mode === "text" ? "text message" : "file"} has been shared with you through FireFlow.\n\n` +
      `Download it here:\n${fullLink}\n\n` +
      `🔥 FireFlow`;

    window.location.href =
      `mailto:?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
  }

  // =========================================================
  // UPLOAD FILE
  // =========================================================

  async function uploadFile() {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("password", password);
    formData.append("expiry_type", expiryType);
    formData.append("max_downloads", maxDownloads);
    formData.append("one_time", oneTime);

    try {
      setLoading(true);

      const response = await api.post(
        "/files/upload",
        formData
      );

      console.log(
        "FILE UPLOAD RESPONSE:",
        JSON.stringify(response.data, null, 2)
      );

      setResult(response.data);

    } catch (error) {
      console.error("FILE UPLOAD ERROR:", error);

      alert(
        error.response?.data?.detail ||
        "File upload failed"
      );

    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // SHARE TEXT
  // =========================================================

  async function uploadText() {
    if (!text.trim()) {
      alert("Please write some text first.");
      return;
    }

    const formData = new FormData();

    formData.append("text", text);
    formData.append("password", password);
    formData.append("expiry_type", expiryType);
    formData.append("max_downloads", maxDownloads);
    formData.append("one_time", oneTime);

    try {
      setLoading(true);

      const response = await api.post(
        "/files/upload-text",
        formData
      );

      console.log(
        "TEXT SHARE RESPONSE:",
        JSON.stringify(response.data, null, 2)
      );

      setResult(response.data);

    } catch (error) {
      console.error("TEXT SHARE ERROR:", error);

      alert(
        error.response?.data?.detail ||
        "Text sharing failed"
      );

    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // RESET
  // =========================================================

  function resetUpload() {
    setResult(null);

    setFile(null);
    setText("");

    setPassword("");
    setExpiryType("24_hours");
    setMaxDownloads(3);
    setOneTime(false);

    setCopied(false);
  }

  // =========================================================
  // CHANGE MODE
  // =========================================================

  function changeMode(newMode) {
    setMode(newMode);

    setFile(null);
    setText("");
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div>

      {/* HEADER */}

      <div className="upload-header">

        <h1>
          {mode === "file"
            ? "📤 Upload File"
            : "📝 Share Text"}
        </h1>

        <p>
          Secure sharing with FireFlow protection.
        </p>

      </div>


      {/* BEFORE UPLOAD */}

      {!result ? (

        <div className="upload-box">

          {/* MODE SWITCH */}

          <div className="upload-mode-switch">

            <button
              type="button"
              className={
                mode === "file"
                  ? "mode-btn active"
                  : "mode-btn"
              }
              onClick={() => changeMode("file")}
            >
              📁 File
            </button>

            <button
              type="button"
              className={
                mode === "text"
                  ? "mode-btn active"
                  : "mode-btn"
              }
              onClick={() => changeMode("text")}
            >
              📝 Text
            </button>

          </div>


          {/* =================================================
              FILE MODE
          ================================================= */}

          {mode === "file" && (

            <div
              className="file-upload-area"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >

              <div className="upload-icon">
                ☁️
              </div>

              <h2>
                Drag & Drop File
              </h2>

              <p className="upload-hint">
                or choose a file from your computer
              </p>


              {/* FILE INPUT */}

              <input
                type="file"
                id="fileUpload"
                onChange={handleFile}
              />

              <label
                htmlFor="fileUpload"
                className="choose-file-btn"
              >
                Choose File
              </label>


              {/* SELECTED FILE */}

              {file && (

                <div className="file-info">

                  <span>
                    Selected:
                  </span>

                  <strong>
                    {file.name}
                  </strong>

                </div>

              )}

            </div>

          )}


          {/* =================================================
              TEXT MODE
          ================================================= */}

          {mode === "text" && (

            <div className="text-share-area">

              <div className="text-share-icon">
                📝
              </div>

              <h2>
                Write or Paste Your Text
              </h2>

              <p className="upload-hint">
                Share notes, messages, code, links or anything else.
              </p>

              <textarea
                className="text-share-input"
                placeholder="Type or paste your text here..."
                value={text}
                onChange={(e) =>
                  setText(e.target.value)
                }
              />

              <div className="text-character-count">
                {text.length} characters
              </div>

            </div>

          )}


          {/* =================================================
              OPTIONS
          ================================================= */}

          <div className="upload-options">

            {/* PASSWORD */}

            <input
              className="option-input"
              type="password"
              placeholder="🔒 Set Password (optional)"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />


            {/* EXPIRY */}

            <select
              className="option-input"
              value={expiryType}
              onChange={(e) =>
                setExpiryType(e.target.value)
              }
            >

              <option value="15_minutes">
                15 Minutes
              </option>

              <option value="1_hour">
                1 Hour
              </option>

              <option value="24_hours">
                24 Hours
              </option>

              <option value="7_days">
                7 Days
              </option>

            </select>


            {/* MAX DOWNLOADS */}

            <input
              className="option-input"
              type="number"
              min="1"
              placeholder="Maximum Downloads"
              value={maxDownloads}
              onChange={(e) =>
                setMaxDownloads(e.target.value)
              }
            />


            {/* ONE TIME */}

            <label className="checkbox">

              <input
                type="checkbox"
                checked={oneTime}
                onChange={(e) =>
                  setOneTime(e.target.checked)
                }
              />

              <span>
                One Time Download
              </span>

            </label>


            {/* ACTION BUTTON */}

            <button
              className="upload-btn"
              onClick={
                mode === "file"
                  ? uploadFile
                  : uploadText
              }
              disabled={loading}
            >

              {loading
                ? mode === "file"
                  ? "Uploading..."
                  : "Sharing..."
                : mode === "file"
                  ? "Upload Now 🚀"
                  : "Share Text 🚀"}

            </button>

          </div>

        </div>

      ) : (

        /* =====================================================
           SUCCESS
        ===================================================== */

        <div className="result-card">

          {/* SUCCESS ICON */}

          <div className="success-icon">
            ✓
          </div>


          {/* TITLE */}

          <h2>
            {mode === "file"
              ? "Upload Successful"
              : "Text Shared Successfully"}
          </h2>


          <p className="result-subtitle">
            {mode === "file"
              ? "Your file is ready to share."
              : "Your text is ready to share."}
          </p>


          {/* FIREFLOW CODE */}

          <div className="code-section">

            <span className="code-label">
              🔥 FireFlow Code
            </span>

            <div className="share-code">
              {result?.share_code || "Unavailable"}
            </div>

            <p className="code-hint">
              Share this code with the receiver
            </p>

          </div>


          {/* QR CODE */}

          {result?.qr_code && (

            <div className="qr-section">

              <h3 className="qr-title">
                📱 Scan to Receive{" "}
                {mode === "file" ? "File" : "Text"}
              </h3>

              <p className="qr-hint">
                Scan this QR code with your phone camera
              </p>

              <img
                className="qr-image"
                src={
                  result.qr_code.startsWith("http")
                    ? result.qr_code
                    : `${import.meta.env.VITE_API_URL}${result.qr_code}`
                }
                alt={
                  mode === "file"
                    ? "Scan QR code to receive file"
                    : "Scan QR code to receive text"
                }
              />

              <p className="qr-footer">
                🔗 Scan • Open • Download
              </p>

            </div>

          )}


          {/* COPY LINK */}

          <button
            className="copy-btn"
            onClick={copyLink}
            disabled={!result?.download_url}
          >

            {copied
              ? "Copied ✓"
              : "🔗 Copy Download Link"}

          </button>


          {/* SHARE */}

          <div className="share-title">
            Share this {mode === "file" ? "file" : "text"}
          </div>


          <div className="share-buttons">

            <button
              type="button"
              className="share-btn whatsapp-btn"
              onClick={shareWhatsApp}
            >
              💬 WhatsApp
            </button>

            <button
              type="button"
              className="share-btn telegram-btn"
              onClick={shareTelegram}
            >
              ✈️ Telegram
            </button>

            <button
              type="button"
              className="share-btn email-btn"
              onClick={shareEmail}
            >
              📧 Email
            </button>

          </div>


          {/* STATUS */}

          <div className="status-list">

            {oneTime && (

              <p className="success-msg">
                ⚡ One Time Download Enabled
              </p>

            )}

            {password && (

              <p className="success-msg">
                🔒 Password Protected
              </p>

            )}

          </div>


          {/* NEW SHARE */}

          <button
            className="new-upload-btn"
            onClick={resetUpload}
          >
            {mode === "file"
              ? "Upload Another File ➕"
              : "Share Another Text ➕"}

          </button>

        </div>

      )}

    </div>
  );
}

export default Upload;