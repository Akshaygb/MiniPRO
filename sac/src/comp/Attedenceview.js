import React, { useState } from 'react';
import axios from 'axios';

const AttendanceView = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch attendance data
    const fetchAttendanceData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/updatedata'); // Backend URL
            const data = response.data;

            // Calculate attendance percentage for each student
            const processedData = data.map(student => {
                const totalDays = student.attendance.length;
                const presentDays = student.attendance.filter(status => status === "Yes").length;
                const percentage = totalDays ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
                return { ...student, percentage };
            });

            setStudents(processedData);
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError('Failed to fetch attendance data.');
        } finally {
            setLoading(false);
        }
    };

    // Trigger the fetch function when the component is mounted
    React.useEffect(() => {
        fetchAttendanceData();
    }, []);

    // Handle loading and error states
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    // Determine the maximum number of days to create dynamic headers
    const maxDays = Math.max(...students.map(student => student.attendance.length));

    return (
        <div>
            <h1>Student Attendance Grid</h1>
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        {Array.from({ length: maxDays }).map((_, dayIndex) => (
                            <th key={dayIndex}>Day {dayIndex + 1}</th>
                        ))}
                        <th>Attendance Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student, index) => (
                        <tr key={index}>
                            <td>{student.name}</td>
                            {Array.from({ length: maxDays }).map((_, dayIndex) => (
                                <td key={dayIndex}>
                                    {student.attendance[dayIndex] || 'N/A'}
                                </td>
                            ))}
                            <td>{student.percentage}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceView;
