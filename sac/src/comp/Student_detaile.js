import React from 'react';

export default function Student_detaile({ StuDetaile }) {
  return (
    <div>
      <h1>Student Details</h1>
      {/* Check if StuDetaile is not empty */}
      {StuDetaile && StuDetaile.length > 0 ? (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>USN</th>
              <th>Semester</th>
              <th>Password</th>
              <th>Photo</th>
            </tr>
          </thead>
          <tbody>
            {/* Iterate over StuDetaile and render each student's info */}
            {StuDetaile.map((student) => (
              <tr key={student.usn}>
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
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
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
        <p>No student details found.</p>
      )}
    </div>
  );
}
