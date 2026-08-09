import { useState } from "react";
import api from "../services/api";

function Upload() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [expiryType, setExpiryType] = useState("24_hours");
  const [maxDownloads, setMaxDownloads] = useState(3);
  const [oneTime, setOneTime] = useState(false);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleFile(e) {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  }

  function handleDrop(e) {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile) {
      setFile(droppedFile);
    }
  }

  function getFullLink() {
    const url = result?.download_url;

    if (!url) {
      return null;
    }

    return url.startsWith("http")
      ? url
      : `http://127.0.0.1:8000${url}`;
  }

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

  function shareWhatsApp() {
    const fullLink = getFullLink();

    if (!fullLink) {
      return;
    }

    const message =
      `🔥 FireFlow File Share\n\n` +
      `Download the file here:\n${fullLink}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  function shareTelegram() {
    const fullLink = getFullLink();

    if (!fullLink) {
      return;
    }

    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(
        fullLink
      )}&text=${encodeURIComponent(
        "🔥 File shared through FireFlow"
      )}`,
      "_blank"
    );
  }

  function shareEmail() {
    const fullLink = getFullLink();

    if (!fullLink) {
      return;
    }

    const subject = "🔥 File shared through FireFlow";

    const body =
      `Hello,\n\n` +
      `A file has been shared with you through FireFlow.\n\n` +
      `Download it here:\n${fullLink}\n\n` +
      `🔥 FireFlow`;

    window.location.href =
      `mailto:?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
  }

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
        "BACKEND RESPONSE:",
        JSON.stringify(response.data, null, 2)
      );

      setResult(response.data);
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      alert(
        error.response?.data?.detail ||
          "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  }

  function resetUpload() {
    setResult(null);
    setFile(null);
    setPassword("");
    setExpiryType("24_hours");
    setMaxDownloads(3);
    setOneTime(false);
    setCopied(false);
  }

  return (
    <div className="upload-container">

      {/* HEADER */}
      <div className="upload-header">
        <h1>📤 Upload File</h1>

        <p>
          Secure sharing with FireFlow protection.
        </p>
      </div>

      {!result ? (

        /* UPLOAD FORM */
        <div
          className="upload-box"
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
              <span>Selected:</span>

              <strong>
                {file.name}
              </strong>
            </div>
          )}

          {/* OPTIONS */}
          <div className="upload-options">

            <input
              className="option-input"
              type="password"
              placeholder="🔒 Set Password (optional)"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

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

            <button
              className="upload-btn"
              onClick={uploadFile}
              disabled={loading}
            >
              {loading
                ? "Uploading..."
                : "Upload Now 🚀"}
            </button>

          </div>
        </div>

      ) : (

        /* SUCCESS */
        <div className="result-card">

          <div className="success-icon">
            ✓
          </div>

          <h2>
            Upload Successful
          </h2>

          <p className="result-subtitle">
            Your file is ready to share.
          </p>

          {/* FIREFLOW CODE */}
          <div className="code-section">

            <span>
              FireFlow Code
            </span>

            <div className="share-code">
              {result?.share_code ||
                "Unavailable"}
            </div>

          </div>

          {/* QR CODE */}
          {result?.qr_code && (
            <div className="qr-section">
              <img
                className="qr-image"
                src={
                  result.qr_code.startsWith("http")
                    ? result.qr_code
                    : `http://127.0.0.1:8000${result.qr_code}`
                }
                alt="FireFlow QR Code"
              />
            </div>
          )}

          {/* COPY LINK */}
          <button
            type="button"
            className="copy-btn"
            onClick={copyLink}
            disabled={!result?.download_url}
          >
            {copied
              ? "Copied ✓"
              : "🔗 Copy Download Link"}
          </button>

          {/* SHARE */}
          <div className="share-section">

            <p className="share-title">
              Share this file
            </p>

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

          {/* NEW UPLOAD */}
          <button
            type="button"
            className="new-upload-btn"
            onClick={resetUpload}
          >
            Upload Another File ➕

          </button>

        </div>

      )}

    </div>
  );
}

export default Upload;