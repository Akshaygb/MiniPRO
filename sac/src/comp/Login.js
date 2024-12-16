import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Login.css'
import axios from 'axios';
 const Login=({setUser}) =>{
  const [userName, setName] = useState("");
  const [userpass, setPass] = useState("");
  const [usersem, setsem] = useState("");

  const [state, setState] = useState("");
  const navigate=useNavigate();
  const adminbutton=()=>
  {
    const data = {
      "id": userName,
      "password": userpass
  };

  axios.post("http://localhost:5000/admin_login", data)
      // .then((response) => {
      //     if (response.status === 201) {
      //         alert("Login Successful");
      //         navigate('/admin')
      //     }
      // })
      
      .then((response)=>{
          if(response.status===201)
          {
            setUser(response.data.user)
            alert("Login Successful")
            navigate("/admin")
          }
      })
      .catch((error) => {
          if (error.response) {
              console.error('Error:', error.response.data);
              alert(`Error: ${error.response.data.error}`);
          } else {
              console.error('Error:', error.message);
              alert('Unknown error occurred.');
          }
      });
};
   
  
  const studentbutton=()=>
    {
      const data = {
        "id": userName,
        "sem":usersem,
        "password": userpass
    };

    axios.post("http://localhost:5000/student_login", data)
        .then((response) => {
            if (response.status === 201) {
              setUser(response.data.user)
                alert("Login Successful");
                navigate('/student')
            }
        })
        .catch((error) => {
            if (error.response) {
                console.error('Error:', error.response.data);
                alert(`Error: ${error.response.data.error}`);
            } else {
                console.error('Error:', error.message);
                alert('Unknown error occurred.');
            }
        });
};

      
    
    
    const teacherbutton = () => {
      const data = {
          "id": userName,
          "password": userpass
      };
  
      axios.post("http://localhost:5000/teacher_login", data)
          .then((response) => {
              if (response.status === 201) {
                setUser(response.data.user)
                console.log(response.data.user)
                  alert("Login Successful");
                  navigate('/dashboard');
              }
          })
          .catch((error) => {
              if (error.response) {
                  console.error('Error:', error.response.data);
                  alert(`Error: ${error.response.data.error}`);
              } else {
                  console.error('Error:', error.message);
                  alert('Unknown error occurred.');
              }
          });
  };
  
      
  const render = () => {
    switch (state) {
      case "admin":
        return (
          <div>
            <label className="form-label" htmlFor="adminId">Admin ID:</label>
            <input
              className="form-input"
              type="text"
              id="adminId"
              placeholder="Enter Admin ID"
              onChange={(e) => setName(e.target.value)}
              value={userName}
            /><br/>
            <label className="form-label" htmlFor="password">Password:</label>
            <input
              className="form-input"
              type="password"
              id="password"
              placeholder="Enter Password"
              onChange={(e) => setPass(e.target.value)}
              value={userpass}
            /><br/>
            <button className="form-button" onClick={adminbutton}>Login</button>
          </div>
        );
      case "student":
        return (
          <div>
            <label className="form-label" htmlFor="adminId">Student USN:</label>
            <input
              className="form-input"
              type="text"
              id="adminId"
              placeholder="Enter Student USN"
              onChange={(e) => setName(e.target.value)}
              value={userName}
            /><br/>
            <label className="form-label" htmlFor="adminId">Student Sem:</label>
            <input
              className="form-input"
              type="number"
              id="adminId"
              placeholder="Enter Student Sem"
              onChange={(e) => setsem(e.target.value)}
              value={usersem}
            /><br/>
            <label className="form-label" htmlFor="password">Password:</label>
            <input
              className="form-input"
              type="password"
              id="password"
              placeholder="Enter Password"
              onChange={(e) => setPass(e.target.value)}
              value={userpass}
            /><br/>
            <button className="form-button" onClick={studentbutton}>Login</button>
          </div>
        );
      case "teacher":
        return (
          <div>
            <label className="form-label" htmlFor="adminId">Teacher ID:</label>
            <input
              className="form-input"
              type="text"
              id="adminId"
              placeholder="Teacher ID"
              onChange={(e) => setName(e.target.value)}
              value={userName}
            /><br/>
            <label className="form-label" htmlFor="password">Password:</label>
            <input
              className="form-input"
              type="password"
              id="password"
              placeholder="Enter Password"
              onChange={(e) => setPass(e.target.value)}
              value={userpass}
            /><br/>
            <button className="form-button" onClick={teacherbutton}>Login</button>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container1">
      <div className="dashboard-content">
        <nav className="nav">
          <ul className="nav-ul">
            <li
              className={`nav-li ${state === "admin" ? "active" : ""}`}
              onClick={() => setState("admin")}
            >
              Admin
            </li>
            <li
              className={`nav-li ${state === "teacher" ? "active" : ""}`}
              onClick={() => setState("teacher")}
            >
              Teacher
            </li>
            <li
              className={`nav-li ${state === "student" ? "active" : ""}`}
              onClick={() => setState("student")}
            >
              Student
            </li>
          </ul>
        </nav>

        <div>{render()}</div>
      </div>
    </div>
  );
}
export default Login;