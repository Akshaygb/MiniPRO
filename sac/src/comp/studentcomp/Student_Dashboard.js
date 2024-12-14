import React, { useState } from 'react';
import axios from 'axios';
import './Student_Dashboard.css';

const Student_Dashboard = ({user}) => {
  const [selectState, setSelectState] = useState('home');
  const [usn, setUsn] = useState('');
  const [sem, setSem] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [document, setDocument] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDocumentSubmit = async () => {
    if (!usn || !sem || !subjectCode || !document) {
      setErrorMessage('USN, Semester, Subject Code, and Document are required');
      return;
    }

    const formData = new FormData();
    formData.append('usn', usn);
    formData.append('sem', sem);
    formData.append('subjectCode', subjectCode); 
    formData.append('document', document);

    try {
      const response = await axios.post('http://localhost:5000/Submit-Documnet', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data.message);
    } catch (error) {
      setErrorMessage('Error submitting document');
    }
  };

  const handleViewAttendance = async () => {
    if (!usn || !sem || !subjectCode) {
      setErrorMessage('USN, Semester, and Subject Code are required');
      return;
    }

    const formData = new FormData();
    formData.append('usn', usn);
    formData.append('sem', sem);
    formData.append('subjectCode', subjectCode);

    try {
      const response = await axios.post('http://localhost:5000/Get-Atttedence', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAttendance(response.data);
    } catch (error) {
      setErrorMessage('Error fetching attendance data');
    }
  };

  const render = () => {
    switch (selectState) {
      case 'submitattendance':
        return (
          <div className="submit-document-container">
            <h2>Submit Document</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div>
                <label>USN:</label>
                <input type="text" value={usn} onChange={(e) => setUsn(e.target.value)} placeholder="Enter USN" />
              </div>
              <div>
                <label>Semester:</label>
                <input type="text" value={sem} onChange={(e) => setSem(e.target.value)} placeholder="Enter Semester" />
              </div>
              <div>
                <label>Subject Code:</label>
                <input type="text" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} placeholder="Enter Subject Code" />
              </div>
              <div>
                <label>Document:</label>
                <input type="file" onChange={(e) => setDocument(e.target.files[0])} />
              </div>
              <button onClick={handleDocumentSubmit}>Submit Document</button>
            </form>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        );
      case 'viewattendance':
        return (
          <div className="submit-document-container">
            <h2>View Attendance</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div>
                <label>USN:</label>
                <input type="text" value={usn} onChange={(e) => setUsn(e.target.value)} placeholder="Enter USN" />
              </div>
              <div>
                <label>Semester:</label>
                <input type="text" value={sem} onChange={(e) => setSem(e.target.value)} placeholder="Enter Semester" />
              </div>
              <div>
                <label>Subject Code:</label>
                <input type="text" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} placeholder="Enter Subject Code" />
              </div>
              <button onClick={handleViewAttendance}>View Attendance</button>
            </form>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {attendance && (
              <div className="attendance-result">
                <h3>Attendance for {attendance.name} ({attendance.usn})</h3>
                <p>Attendance: {attendance.attendance.join(', ')}</p>
                <p>Attendance Percentage: {attendance.attendance_percentage}%</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Student Dashboard</h2>
      <div className="dashboard-content">
        <h3>Welcome, {user.name}!</h3>
        <nav>
          <ul>
            <li className={selectState === 'submitattendance' ? 'active' : ''} onClick={() => setSelectState('submitattendance')}>Submit Attendance</li>
            <li className={selectState === 'viewattendance' ? 'active' : ''} onClick={() => setSelectState('viewattendance')}>View Attendance</li>
          </ul>
        </nav>
      </div>
      <div className="main-content">{render()}</div>
    </div>
  );
};

export default Student_Dashboard;
