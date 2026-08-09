import { useState } from "react";
import api from "../services/api";

function UploadBox() {

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const [password, setPassword] = useState("");
  const [expiry, setExpiry] = useState("24_hours");
  const [downloads, setDownloads] = useState("3");
  const [oneTime, setOneTime] = useState(false);

  function handleFile(event) {
    setFile(event.target.files[0]);
  }


  async function handleUpload() {

    if (!file) {
      alert("Please select a file");
      return;
    }


    const formData = new FormData();

    formData.append("file", file);

formData.append(
  "password",
  password
);

formData.append(
  "expiry_type",
  expiry
);

formData.append(
  "custom_days",
  "0"
);

formData.append(
  "custom_hours",
  "0"
);

formData.append(
  "custom_minutes",
  "0"
);

formData.append(
  "max_downloads",
  downloads
);

formData.append(
  "one_time",
  oneTime
);

    try {

      const response = await api.post(
        "/files/upload",
        formData
      );


      console.log(response.data);


      setResult(response.data);

      setMessage("");


    } catch(error){

      console.log(error);

      setMessage("❌ Upload failed");

    }

  }


  return (

    <div className="upload-box">


      <h1>
        Share Files Instantly
      </h1>


      <p>
        Upload documents, images and videos securely.
      </p>



      <div
className="drop-area"
onDragOver={(e)=>e.preventDefault()}
onDrop={(e)=>{

e.preventDefault();

setFile(e.dataTransfer.files[0]);

}}
>


<input
id="fileInput"
type="file"
hidden
onChange={handleFile}
/>


<label htmlFor="fileInput">

<div>

<h2>
📂
</h2>

<p>
Drag & Drop your file
</p>

<p>
or click to browse
</p>

</div>

</label>


</div>



      {
        file &&
        <p>
          📄 {file.name}
        </p>
      }

<div className="options">


<h3>🔒 Password (optional)</h3>

<input
  type="password"
  placeholder="Set password"
  value={password}
  onChange={(e)=>setPassword(e.target.value)}
/>



<h3>⏳ Expiry</h3>

<select
  value={expiry}
  onChange={(e)=>setExpiry(e.target.value)}
>

<option value="5_minutes">
5 Minutes
</option>

<option value="1_hour">
1 Hour
</option>

<option value="24_hours">
24 Hours
</option>

</select>



<h3>📥 Download Limit</h3>

<select
  value={downloads}
  onChange={(e)=>setDownloads(e.target.value)}
>

<option value="1">
1 Download
</option>

<option value="3">
3 Downloads
</option>

<option value="5">
5 Downloads
</option>

</select>



<label>

<input
type="checkbox"
checked={oneTime}
onChange={(e)=>setOneTime(e.target.checked)}
/>

⚡ One Time Download

</label>


</div>

      <button onClick={handleUpload}>
        Upload File
      </button>



      <p>{message}</p>




      {
        result &&

        <div className="result-card">

          <h2>
            🎉 Upload Successful
          </h2>


          <p>
            Share Code:
            <b>
              {" "}
              {result.share_code}
            </b>
          </p>



          <p>
            🔗
            <a href={result.download_url}>
              {" "}
              {result.download_url}
            </a>
          </p>
          <button
onClick={()=>{
  navigator.clipboard.writeText(
    result.download_url
  );

  alert("Link copied!");
}}
>
📋 Copy Link
</button>



          <img
            src={
              "http://127.0.0.1:8000" +
              result.qr_code
            }
            width="180"
          />



          <p>
            Expires:
            {" "}
            {result.expiry}
          </p>


        </div>

      }



    </div>

  );

}


export default UploadBox;