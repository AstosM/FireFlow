import { useState } from "react";
import api from "../services/api";

function Receive() {

  const [code, setCode] = useState(() => {

    const qrCode = new URLSearchParams(
      window.location.search
    ).get("code");

    return qrCode
      ? qrCode.toUpperCase()
      : "";

  });

  const [password, setPassword] = useState("");

  const [passwordRequired, setPasswordRequired] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // rest of your code...
 

  function handleCode(e) {

    setCode(
      e.target.value.toUpperCase()
    );

    setError("");

    // If user enters a new code,
    // hide the old password section.
    setPasswordRequired(false);

    setPassword("");

  }


  async function downloadFile() {

    const cleanCode =
      code.trim().toUpperCase();


    if (!cleanCode) {

      setError(
        "Please enter your FireFlow code."
      );

      return;
    }


    try {

      setLoading(true);
      setError("");


      const response =
        await api.get(

          `/files/share/${cleanCode}`,

          {
            responseType: "blob"
          }

        );


      const contentType =
        response.headers["content-type"] || "";


      // -------------------------------------------------
      // BACKEND SAYS PASSWORD IS REQUIRED
      // -------------------------------------------------

      if (
        contentType.includes(
          "application/json"
        )
      ) {

        const text =
          await response.data.text();


        const data =
          JSON.parse(text);


        if (
          data.password_required
        ) {

          setPasswordRequired(true);

          setError("");

          return;
        }


        setError(
          data.detail ||
          "Unable to download file."
        );

        return;

      }


      // -------------------------------------------------
      // NORMAL DOWNLOAD
      // -------------------------------------------------

      await saveFile(response);


    } catch (error) {

      console.error(
        "DOWNLOAD ERROR:",
        error
      );


      // FastAPI error may also arrive
      // as a Blob because responseType is blob.

      if (
        error.response?.data
        instanceof Blob
      ) {

        try {

          const text =
            await error.response.data.text();


          const data =
            JSON.parse(text);


          setError(
            data.detail ||
            "Unable to download file."
          );

        } catch {

          setError(
            "Unable to download file."
          );

        }

      } else {

        setError(
          error.response?.data?.detail ||
          "Unable to download file."
        );

      }

    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // VERIFY PASSWORD
  // =====================================================

  async function verifyPassword() {

    if (!password) {

      setError(
        "Please enter the password."
      );

      return;
    }


    try {

      setLoading(true);
      setError("");


      const response =
        await api.post(

          `/files/share/${code.trim().toUpperCase()}/verify`,

          {
            password: password
          },

          {
            responseType: "blob"
          }

        );


      await saveFile(response);


    } catch (error) {

      console.error(
        "PASSWORD ERROR:",
        error
      );


      if (
        error.response?.data
        instanceof Blob
      ) {

        try {

          const text =
            await error.response.data.text();


          const data =
            JSON.parse(text);


          setError(
            data.detail ||
            "Incorrect password."
          );

        } catch {

          setError(
            "Incorrect password."
          );

        }

      } else {

        setError(
          error.response?.data?.detail ||
          "Incorrect password."
        );

      }

    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // SAVE FILE WITH ORIGINAL FILENAME
  // =====================================================

  async function saveFile(response) {

    const contentType =
      response.headers["content-type"] ||
      "application/octet-stream";


    let filename =
      "FireFlow-File";


    const contentDisposition =
      response.headers[
        "content-disposition"
      ];


    console.log(
      "CONTENT-DISPOSITION:",
      contentDisposition
    );


    // -------------------------------------------------
    // READ ORIGINAL FILENAME
    // -------------------------------------------------

    if (contentDisposition) {

      // Handles:
      // filename="my file.pdf"

      const filenameMatch =
        contentDisposition.match(
          /filename="([^"]+)"/i
        );


      // Handles:
      // filename=myfile.pdf

      const simpleFilenameMatch =
        contentDisposition.match(
          /filename=([^;]+)/i
        );


      // Handles UTF-8 filenames:
      // filename*=UTF-8''My%20File.pdf

      const utf8FilenameMatch =
        contentDisposition.match(
          /filename\*=UTF-8''([^;]+)/i
        );


      if (utf8FilenameMatch) {

        filename =
          decodeURIComponent(
            utf8FilenameMatch[1]
          );

      }

      else if (filenameMatch) {

        filename =
          filenameMatch[1];

      }

      else if (simpleFilenameMatch) {

        filename =
          simpleFilenameMatch[1]
            .trim()
            .replace(/^"|"$/g, "");

      }

    }


    console.log(
      "FINAL DOWNLOAD FILENAME:",
      filename
    );


    // -------------------------------------------------
    // CREATE BLOB
    // -------------------------------------------------

    const blob =
      new Blob(

        [response.data],

        {
          type: contentType
        }

      );


    // -------------------------------------------------
    // CREATE DOWNLOAD LINK
    // -------------------------------------------------

    const downloadUrl =
      window.URL.createObjectURL(
        blob
      );


    const link =
      document.createElement("a");


    link.href =
      downloadUrl;


    link.download =
      filename;


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    // -------------------------------------------------
    // CLEAN MEMORY
    // -------------------------------------------------

    setTimeout(() => {

      window.URL.revokeObjectURL(
        downloadUrl
      );

    }, 100);

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="receive-page">

      <div className="receive-container">

        <div className="receive-header">

          <h1>
            📥 Receive File
          </h1>

          <p>
            Enter your FireFlow code to download the file.
          </p>

        </div>


        <div className="receive-card">

          <div className="receive-icon">
            🔑
          </div>


          <h2>
            Enter FireFlow Code
          </h2>


          <input
            type="text"
            className="code-input"
            placeholder="FF-XXXXXXXX"
            value={code}
            onChange={handleCode}
          />


          {!passwordRequired && (

            <button
              className="download-btn"
              onClick={downloadFile}
              disabled={loading}
            >

              {loading
                ? "Checking..."
                : "Download File 📥"}

            </button>

          )}


          {passwordRequired && (

            <div className="password-section">

              <p className="password-message">
                🔒 This file is password protected.
              </p>


              <input
                type="password"
                className="code-input"
                placeholder="Enter file password"
                value={password}
                onChange={(e) => {

                  setPassword(
                    e.target.value
                  );

                  setError("");

                }}
              />


              <button
                className="download-btn"
                onClick={verifyPassword}
                disabled={loading}
              >

                {loading
                  ? "Verifying..."
                  : "Unlock & Download 🔓"}

              </button>

            </div>

          )}


          {error && (

            <p className="error-message">
              {error}
            </p>

          )}

        </div>

      </div>

    </div>

  );

}

export default Receive;