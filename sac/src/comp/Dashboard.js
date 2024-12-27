import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/TeacherDashboard.css';

const Dashboard = ({ user, setStudetaile }) => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('home');
  const [SubId, setSubId] = useState('');
  const [StuSem, setStuSem] = useState('');
  const [atte, setatted] = useState("Start");
  // const [startDate, setStartDate] = useState('');
  const [date, setDate] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');




  const handleStudentdetaile = () => {
    const data = {
      sem: StuSem,
      "subject code": SubId
    };
    axios.post("http://localhost:5000/student_detaile", data)
      .then((response) => {
        if (response.status === 201) {
          setStudetaile(response.data.user);
          console.log(response.data.user);
          navigate("/student_details");
        }
      })
      .catch((error) => {
        console.error(error);
        alert("Something went wrong");
      });
  };

  
   

  const AttedenceButton = () => {
    if (atte === "Start") {
      const data = {
        "Teacher_id": user.teacher_Id,
        "sem": StuSem,
        "subject code": SubId,
        "status": "s"
      };
      setatted("Stop");
      // Request to start attendance
      axios.post("http://localhost:5000/start_attendance", data)
        .then((response) => {
          if (response.status === 200) {
            alert(response.data.message);
            // Change button to 'Stop'
          }
        })
        .catch((error) => {
          console.error("Error starting attendance:", error);
          alert("Failed to start attendance");
        });
    } else {
      const data = {
        "Teacher_id": user.Teacher_id,
        "sem": StuSem,
        "subject code": SubId,
        "status": "q"
      };
      setatted("Start");
      axios.post("http://localhost:5000/stop_attendance", { signal: "q" }) // Send 'q' signal
        .then((response) => {
          if (response.status === 200) {
            alert("Attendance stopped successfully!");
            // Change button to 'Start'
          }
          setatted("Start");
        })
        .catch((error) => {
          console.error("Error stopping attendance:", error);
          alert("Failed to stop attendance");
        });
    }
  };
  const handleViewAttendance = async () => {
    if (!date || !SubId) {
      setError('Please fill all fields: Date and Course Code.');
      return;
    }
    let data={
      "Teacher_id": user.teacher_Id,
        "sem": StuSem,
        "subjectcode": SubId,
        "date":date

    }
    console.log(user.id)
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/attendance',data);
      localStorage.setItem('attendanceData', JSON.stringify(response.data));
      navigate("/attedence view")
    } 
    catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance data.');
    } finally {
      setLoading(false);
    }
  };
   const eliglible= async()=>
   {
      const data={"Teacher_id": user.teacher_Id,
        "sem": StuSem,
        "subjectcode": SubId,
        "date":date

    }
    console.log(user.id)
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/eligible',data);
      localStorage.setItem('eligibleData', JSON.stringify(response.data));
      navigate("/attedence view")
    } 
    catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance data.');
    } finally {
      setLoading(false);
    }
   }
  const renderSection = () => {
    switch (selectedSection) {
      case "home":
        return (
          <div>
            <div>
              <div className="section-content">
                <div className="submit-document-container">
                  <h2>Students Details</h2>
                  <form onSubmit={(e) => { e.preventDefault(); AttedenceButton(); }}>
                    <div>
                      <div className="select-list-container">
                        <label htmlFor="semester-dropdown" className="select-list-label">
                          Select Semester
                        </label>
                        <select
                          id="semester-dropdown"
                          value={StuSem}
                          onChange={(e) => setStuSem(e.target.value)}
                          required
                          className="select-list"
                        >
                          <option value="">Select Semester</option>
                          {user.sem.map((sem, index) => (
                            <option key={index} value={sem}>
                              {sem}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label>Subject Code:</label>
                      <select
                        value={SubId}
                        onChange={(e) => setSubId(e.target.value)}
                        required
                        className="select-list"
                      >
                        <option value="">Select Subject Code</option>
                        {user.subject_code.map((code, index) => (
                          <option key={index} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button type="submit">{atte}</button>
                  </form>
                </div>
              </div>
             </div>
          </div>
        );
     {/*} case "attedence view":
        return (
          <div>
            <div className="section-content">
              <div className="submit-document-container">
                <h2>Manage Students</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleAttedenceView(); }}>
                  <div>
                    <label>Semester:</label>
                    <select
                      value={StuSem}
                      onChange={(e) => setStuSem(e.target.value)}
                      required
                      className="select-list"
                    >
                      <option value="">Select Semester</option>
                      {user.sem.map((sem, index) => (
                        <option key={index} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Subject Code:</label>
                    <select
                      value={SubId}
                      onChange={(e) => setSubId(e.target.value)}
                      required
                      className="select-list"
                    >
                      <option value="">Select Subject Code</option>
                      {user.subject_code.map((code, index) => (
                        <option key={index} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit">Submit</button>
                </form>
              </div>
            </div>
          </div>
        ); */}
      case "student detaile":
        return (
          <div>
            <div className="section-content">
              <div className="submit-document-container">
                <h2>Students Details</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleStudentdetaile(); }}>
                  <div>
                    <label>Semester:</label>
                    <select
                      value={StuSem}
                      onChange={(e) => setStuSem(e.target.value)}
                      required
                      className="select-list"
                    >
                      <option value="">Select Semester</option>
                      {user.sem.map((sem, index) => (
                        <option key={index} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Subject Code:</label>
                    <select
                      value={SubId}
                      onChange={(e) => setSubId(e.target.value)}
                      required
                      className="select-list"
                    >
                      <option value="">Select Subject Code</option>
                      {user.subject_code.map((code, index) => (
                        <option key={index} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit">Submit</button>
                </form>
              </div>
            </div>
          </div>
        );
      case "update":
        return (
          <div>
            <div className="section-content">
              <div className="submit-document-container">
                <h2>Update Student Details</h2>
                <form >
                  <div>
                    <label>Semester:</label>
                    <select
                      value={StuSem}
                      onChange={(e) => setStuSem(e.target.value)}
                      required
                      className="select-list"
                    >
                      <option value="">Select Semester</option>
                      {user.sem.map((sem, index) => (
                        <option key={index} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Subject Code:</label>
                    <select
                      value={SubId}
                      onChange={(e) => setSubId(e.target.value)}
                      required
                      className="select-list"
                    >
                      <option value="">Select Subject Code</option>
                      {user.subject_code.map((code, index) => (
                        <option key={index} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Student USN:</label>
                    <input
                      type="text"
                      placeholder="Enter Student USN"
                      required
                    />
                  </div>
                  <button type="submit">Submit</button>
                </form>
              </div>
            </div>
          </div>
        );
      case "notification":
        return <div>Notification Section</div>;
      case "attedence view":
    return (
    <div className="section-content">
      <div className="submit-document-container">
        <h2>View Attendance</h2>
        <form >
          <div><input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Select Date"
              />Select Date
           
            <label>Semester:</label>
            <select
              value={StuSem}
              onChange={(e) => setStuSem(e.target.value)}
              required
              className="select-list"
            >
              <option value="">Select Semester</option>
              {user.sem.map((sem, index) => (
                <option key={index} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Subject Code:</label>
            <select
              value={SubId}
              onChange={(e) => setSubId(e.target.value)}
              required
              className="select-list"
            >
              <option value="">Select Subject Code</option>
              {user.subject_code.map((code, index) => (
                <option key={index} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" onClick={(e) => { e.preventDefault(); handleViewAttendance(); }}>Get Attendance</button>
          <button type="submit">Get Eligible List </button>
        </form>

        
         
      </div>
    </div>
  );
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h2>Teacher Dashboard</h2>
        <p className="admin-name">Welcome, {user.name}!</p>
        <ul>
          <li
            className={selectedSection === 'home' ? 'active' : ''}
            onClick={() => setSelectedSection('home')}
          >
            Home
          </li>
          <li
            className={selectedSection === 'attedence view' ? 'active' : ''}
            onClick={() => setSelectedSection('attedence view')}
          >
            Attendance View
          </li>
          <li
            className={selectedSection === 'student detaile' ? 'active' : ''}
            onClick={() => setSelectedSection('student detaile')}
          >
            Student Details
          </li>
          <li
            className={selectedSection === 'update' ? 'active' : ''}
            onClick={() => setSelectedSection('update')}
          >
            Update Student
          </li>
          <li
            className={selectedSection === 'notification' ? 'active' : ''}
            onClick={() => setSelectedSection('notification')}
          >
            Notification
          </li>
        </ul>
      </div>
      <div className="main-content">
        {renderSection()}
      </div>
    </div>
  );
};

export default Dashboard;
