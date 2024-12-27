import React from 'react';
import './styles/Student_details.css'

export default function Student_detaile({ StuDetaile }) {
  return (
    <div id="student-details-container">
      <h1 id="student-details-title">Student Details</h1>
      {/* Check if StuDetaile is not empty */}
      {StuDetaile && StuDetaile.length > 0 ? (
        <table id="student-details-table">
          <thead>
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">USN</th>
              <th className="table-header">Semester</th>
              <th className="table-header">Password</th>
              <th className="table-header">Photo</th>
            </tr>
          </thead>
          <tbody>
            {/* Iterate over StuDetaile and render each student's info */}
            {StuDetaile.map((student) => (
              <tr key={student.usn} className="table-row">
                <td>{student.name}</td>
                <td>{student.usn}</td>
                <td>{student.sem}</td>
                <td>{student.password}</td>
                <td>
                  {/* If photo exists, render it as an image */}
                  {student.photo ? (
                    <img
                      src={student.photo} // Directly using the Base64 string
                      alt={student.name}
                      className="student-photo"
                    />
                  ) : (
                    'No photo available'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p id="no-data-message">No student details found.</p>
      )}
    </div>
  );
}
