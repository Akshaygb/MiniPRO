import React, { useState } from 'react';
import './AdminDashboard.css';
import axios from 'axios';

const AdminDashboard = ({user}) => {
    const [selectedSection, setSelectedSection] = useState('home');
    const [adminName, setAdminName] = useState('Admin'); // Default admin name

    const [stuName, setStuName] = useState('');
    const [stuUsn, setStuUsn] = useState('');
    const [stuSem, setStuSem] = useState('');
    const [stuPass, setStuPass] = useState('');
    const [stuPhoto, setStuPhoto] = useState(null);

    const [teacherFile, setTeacherFile] = useState(null);
    const [teacherPhoto, setTeacherPhoto] = useState(null);

    const handleStudentSubmit = async(e) => {
        e.preventDefault();

        console.log({
            Name: stuName,
            USN: stuUsn,
            Semester: stuSem,
            Password: stuPass,
            Photo: stuPhoto,
        });
        const formdata=new FormData();
        formdata.append("name",stuName)
        formdata.append('usn', stuUsn);
       formdata.append('semester', stuSem);
       formdata.append('password', stuPass);
       if (stuPhoto) {
        formdata.append('photo', stuPhoto);
       }
       try
       {
        const  response=await axios.post("http://localhost:5000/upload-student",formdata);
           alert("response.data")
           
       }
       catch (error) {
        if (error.response) {
            console.error('Error:', error.response.data);
            if (error.response.status === 400) {
                alert('Error: No file uploaded');
            } else {
                alert(`Error: ${error.response.data.error}`);
            }
        } else {
            // Network error or other unexpected errors
            console.error('Error:', error.message);
            alert('An unexpected error occurred');
        }
    }

        

        setStuName('');
        setStuUsn('');
        setStuSem('');

        setStuPass('');
        setStuPhoto(null);
    };

    const handleTeacherSubmit = async(e) => {
        e.preventDefault();

        // Log teacher data for verification (this could be sent to a backend)
        const formData = new FormData();
        formData.append('file', teacherFile);
        formData.append('photo', teacherPhoto);
          try{
            const  response= await axios.post("http://localhost:5000/upload-teacher-file",formData)
            if (response.status==201)
            {
                alert(response.data.message)
            }
          }
          catch (error) {
            if (error.response) {
                console.error('Error:', error.response.data);
                if (error.response.status === 400) {
                    alert('Error: No file uploaded');
                } else {
                    alert(`Error: ${error.response.data.error}`);
                }
            } else {
                // Network error or other unexpected errors
                console.error('Error:', error.message);
                alert('An unexpected error occurred');
            }
        }
        setTeacherFile(null);
        setTeacherPhoto(null);
    };

    const renderSection = () => {
        switch (selectedSection) {
            case 'students':
                return (
                    <div className="section-content">
                        <div className="submit-document-container">
                            <h2>Manage Students</h2>
                            <form onSubmit={handleStudentSubmit}>
                                <div>
                                    <label>Student Name:</label>
                                    <input
                                        type="text"
                                        value={stuName}
                                        onChange={(e) => setStuName(e.target.value)}
                                        placeholder="Enter Student Name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label>USN:</label>
                                    <input
                                        type="text"
                                        value={stuUsn}
                                        onChange={(e) => setStuUsn(e.target.value)}
                                        placeholder="Enter USN"
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Semester:</label>
                                    <input
                                        type="text"
                                        value={stuSem}
                                        onChange={(e) => setStuSem(e.target.value)}
                                        placeholder="Enter Semester"
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Password:</label>
                                    <input
                                        type="password"
                                        value={stuPass}
                                        onChange={(e) => setStuPass(e.target.value)}
                                        placeholder="Enter Password"
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Upload Photo:</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setStuPhoto(e.target.files[0])}
                                    />
                                </div>
                                <button type="submit">Submit</button>
                            </form>
                        </div>
                    </div>
                );
            case 'teachers':
                return (
                    <div className="section-content">
                        <div className="submit-document-container">
                            <h2>Manage Teachers</h2>
                            <form onSubmit={handleTeacherSubmit}>
                                <div>
                                    <label>Upload  Teacher File:</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setTeacherFile(e.target.files[0])}
                                    />
                                </div>
                                <button type="submit">Submit</button>
                            </form>
                        </div>
                    </div>
                );
            case 'attendance':
                return <div className="section-content">Review and Manage Attendance Logs.</div>;
            case 'reports':
                return <div className="section-content">Generate and View Attendance Reports.</div>;
            default:
                return <div className="section-content">Welcome to the Admin Dashboard! Select a section to manage.</div>;
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <h2>Admin Panel</h2>
                <p className="admin-name">Welcome, {user.name}!</p>
                <ul>
                    <li
                        className={selectedSection === 'home' ? 'active' : ''}
                        onClick={() => setSelectedSection('home')}
                    >
                        Home
                    </li>
                    <li
                        className={selectedSection === 'students' ? 'active' : ''}
                        onClick={() => setSelectedSection('students')}
                    >
                        Manage Students
                    </li>
                    <li
                        className={selectedSection === 'teachers' ? 'active' : ''}
                        onClick={() => setSelectedSection('teachers')}
                    >
                        Manage Teachers
                    </li>
                    <li
                        className={selectedSection === 'attendance' ? 'active' : ''}
                        onClick={() => setSelectedSection('attendance')}
                    >
                        Attendance Logs
                    </li>
                </ul>
            </div>
            <div className="main-content">{renderSection()}</div>
        </div>
    );
};

export default AdminDashboard;
