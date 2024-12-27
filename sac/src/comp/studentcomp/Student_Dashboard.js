import React, { useState } from 'react';
import axios from 'axios';
import './Student_Dashboard.css';

const Student_Dashboard = ({ user }) => {
  const [selectState, setSelectState] = useState('home');
  const [usn, setUsn] = useState('');
  const [sem, setSem] = useState('');
  const [TeaName, setTeaName] = useState('');
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
      const response = await axios.post('http://localhost:5000/Submit-Documnet', formData);
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

    const data = {
      "usn":user.usn,
      "sem": sem,
      "TeaName": subjectCode,
    };
    console.log(data)
    try {
      const response = await axios.post('http://localhost:5000/Get-Atttedence', data);
      setAttendance(response.data.data);
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
                <input
                  type="text"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  placeholder="Enter USN"
                  required
                />
              </div>
              <div>
                <label>Semester:</label>
                <input
                  type="text"
                  value={sem}
                  onChange={(e) => setSem(e.target.value)}
                  placeholder="Enter Semester"
                  required
                />
              </div>
              <div>
                <label>Subject Code:</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="Enter Subject Code"
                  required
                />
              </div>
              <div>
                <label>Document:</label>
                <input
                  type="file"
                  onChange={(e) => setDocument(e.target.files[0])}
                />
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

            {attendance ? (
  <div className="attendance-result">
    <h3>Attendance Details</h3>
    <table className="attendance-table">
      <thead>
        <tr>
          <th>USN</th>
          <th>Name</th>
          <th>Total Days</th>
          <th>Present Days</th>
          <th>Absent Days</th>
          <th>Attendance Percentage</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{user.usn}</td>
          <td>{user.name}</td>
          <td>{attendance.total_days}</td>
          <td>{attendance.present_days}</td>
          <td>{attendance.absent_days}</td>
          <td>{attendance.percentage}</td>
        </tr>
      </tbody>
    </table>
    <div className="attendance-records">
      <h4>Attendance Records</h4>
      <p>{attendance.attendance.join(', ')}</p>
      <p><strong>Dates:</strong> {attendance.date.join(', ')}</p>
    </div>
    <button onClick={() => setAttendance(null)} className="back-button">Go Back</button>
  </div>
) 
 : (
              // Display form when attendance data is not available
              <form onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label>USN:</label>
                  <input
                    type="text"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                    placeholder="Enter USN"
                    required
                  />
                </div>
                <div>
                  <label>Semester:</label>
                  <input
                    type="text"
                    value={sem}
                    onChange={(e) => setSem(e.target.value)}
                    placeholder="Enter Semester"
                    required
                  />
                </div>
                
                  {/* <select
                    value={TeaName}
                    onChange={(e) => setTeaName(e.target.value)}
                    required
                  >
                    <option value="">Select Teacher Name</option>
                    {user.teacher.map((teacher, index) => (
                      <option key={index} value={teacher}>
                        {teacher}
                      </option>
                    ))}
                  </select> */}
                
                <div>
                  <label>Subject Code:</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="Enter Subject Code"
                    required
                  />
                </div>
                <button onClick={handleViewAttendance}>View Attendance</button>
              </form>
            )}

            {errorMessage && <p className="error-message">{errorMessage}</p>}
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
            <li
              className={selectState === 'submitattendance' ? 'active' : ''}
              onClick={() => setSelectState('submitattendance')}
            >
              Submit Attendance
            </li>
            <li
              className={selectState === 'viewattendance' ? 'active' : ''}
              onClick={() => setSelectState('viewattendance')}
            >
              View Attendance
            </li>
          </ul>
        </nav>
      </div>
      <div className="main-content">{render()}</div>
    </div>
  );
};

export default Student_Dashboard;
