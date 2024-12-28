import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UpdateStudent.css'

export default function UpdateStudent() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load data from localStorage when the component mounts
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('updateData'));
    if (data) {
      setStudentData(data);
    } else {
      alert('No student data found!');
      navigate('/'); // Redirect to another page if no data is available
    }
  }, [navigate]);

  // Handle attendance update for a specific date
  const handleAttendanceChange = (index, value) => {
    setStudentData((prev) => {
      const updatedAttendance = [...prev.attendance];
      updatedAttendance[index] = value; // Update the attendance at the specific index
      return {
        ...prev,
        attendance: updatedAttendance, // Update the attendance state
      };
    });
  };

  // Submit all attendance data (including updated "Absent" and "Present" records)
  const handleSubmit = async () => {
    if (!studentData) {
      alert('No data to update!');
      return;
    }

    // Create payload with all attendance data (no filtering)
    const updatedAttendanceData = studentData.date.map((date, index) => ({
      date,
      time: studentData.time[index],
      attendance: studentData.attendance[index], // Include the updated attendance status
    }));

    const payload = {
      usn: studentData.usn,
      colle: studentData.colle,
      updatedAttendanceData, // All attendance data, including changes
    };

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/updateattendance', payload);

      if (response.status === 200) {
        alert('Attendance data updated successfully!');
        localStorage.removeItem('updateData'); // Clear the local storage after updating
        navigate('/dashboard'); // Redirect to the main page
      } else {
        alert('Failed to update attendance data!');
      }
    } catch (error) {
      console.error('Error updating attendance data:', error);
      alert('An error occurred while updating attendance data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="updateStudentContainer">
      <h1 className="studentHeader">Update Student Attendance</h1>
      {studentData ? (
        <div>
          <h2 className="studentDetails">{`USN: ${studentData.usn}`}</h2>
          <h3 className="studentDetails">{`Name: ${studentData.name}`}</h3>
          <table className="attendanceTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {studentData.date.map((date, index) =>
                studentData.attendance[index] === 'Absent' ? (
                  <tr key={index}>
                    <td>{date}</td>
                    <td>{studentData.time[index]}</td>
                    <td>
                      <select
                        className="attendanceSelect"
                        value={studentData.attendance[index]}
                        onChange={(e) => handleAttendanceChange(index, e.target.value)}
                      >
                        <option value="Absent">Absent</option>
                        <option value="Present">Present</option>
                      </select>
                    </td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
          <div className="actionButtons">
            <button
              id="submitButton"
              className="actionButton"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Submit Updated Data'}
            </button>
            <button
              id="cancelButton"
              className="actionButton"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p>Loading student data...</p>
      )}
    </div>
  );
}
