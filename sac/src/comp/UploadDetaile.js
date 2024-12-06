import React, { useState } from "react";
import './UploadDetaile.css'
import axios from "axios";

const UploadDetaile = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [fileId, setFileId] = useState(null);

  // Student details state
  const [studentDetails, setStudentDetails] = useState({
    name: "",
    usn: "",
    sem: "",
  });

  // Handle file input change
  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle input change for student details
  const onInputChange = (e) => {
    setStudentDetails({
      ...studentDetails,
      [e.target.name]: e.target.value,
    });
  };

  // Handle file upload with student details
  const onUpload = () => {
    if (!file || !studentDetails.name || !studentDetails.usn || !studentDetails.sem) {
      setMessage("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", studentDetails.name);
    formData.append("usn", studentDetails.usn);
    formData.append("sem", studentDetails.sem);

    axios
      .post("http://localhost:5000/upload-photo", formData)
      .then((response) => {
        setMessage("File and details uploaded successfully!");
        setFileId(response.data.file_id);
      })
      .catch((error) => {
        setMessage("Error uploading file or details.");
        console.error(error);
      });
  };

  // Fetch the uploaded photo by file ID
  const fetchFile = (id) => {
    axios
      .get(`http://localhost:5000/get-photo/${id}`, { responseType: "blob" })
      .then((response) => {
        const blob = response.data;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `photo_${id}.jpg`;
        link.click();
      })
      .catch((error) => {
        console.error("Error fetching file: ", error);
      });
  };

  return (
    <div>
      <h2>Upload Student Details</h2>
      <div>
        <label>Student Name:</label>
        <input
          type="text"
          name="name"
          value={studentDetails.name}
          onChange={onInputChange}
          placeholder="Enter Student Name"
        />
      </div>
      <div>
        <label>Student USN:</label>
        <input
          type="text"
          name="usn"
          value={studentDetails.usn}
          onChange={onInputChange}
          placeholder="Enter Student USN"
        />
      </div>
      <div>
        <label>Student Semester:</label>
        <input
          type="text"
          name="sem"
          value={studentDetails.sem}
          onChange={onInputChange}
          placeholder="Enter Student Semester"
        />
      </div>
      <div>
        <label>Student Photo:</label>
        <input type="file" onChange={onFileChange} />
      </div>
      <button onClick={onUpload}>Upload</button>
      {message && <p>{message}</p>}
      {fileId && (
        <>
          <p>File ID: {fileId}</p>
          <button onClick={() => fetchFile(fileId)}>Download Photo</button>
        </>
      )}
    </div>
  );
};

export default UploadDetaile;
