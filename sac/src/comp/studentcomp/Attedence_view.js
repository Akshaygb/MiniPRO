import React, { useEffect, useState } from 'react';
import "./Attedenceview.css"


export default function Attedence_view() {
  const [attendanceData, setAttendanceData] = useState([]);

  // Load attendance data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('attendanceData');
    if (storedData) {
      setAttendanceData(JSON.parse(storedData));
    }
  }, []);

  return (
    <div className="attendance-container">
      <h2>Attendance Data</h2>
      {attendanceData.length > 0 ? (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Attendance Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((record, index) => (
              <tr key={index}>
                <td>{record.usn}</td>
                <td>{record.name}</td>
                <td>{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No attendance data found for the given date.</p>
      )}
    </div>
  );
}
