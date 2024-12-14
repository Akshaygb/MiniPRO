// // import React, { useState, useEffect } from 'react';
// // import { Link } from 'react-router-dom';
// // import './Home.css';

// // export default function Home() {
// //     const [count, setCount] = useState(false);

// //     useEffect(() => {
// //         const time = setTimeout(() => {
// //             setCount(true);
// //         }, 300);

// //         return () => { clearTimeout(time); };
// //     }, []);

// //     return (
// //         <div className={`body ${count ? "normal" : "first"}`}>
// //             <h1>Welcome to Attendance Management System</h1>
// //             {count && (
// //                 <div className="button-container">
// //                     <button className='button'><Link className='link' to="/login-student">Student Login</Link></button>
// //                     <button className='button'><Link className='link' to="/login">Teacher Login</Link></button>
// //                     <button className='button'><Link className='link' to="/login-admin">Admin Login</Link></button>
// //                 </div>
// //             )}
// //         </div>
// //     );
// // }
// // frontend/src/pages/WelcomePage.js
// // import React from "react";
// // import { useNavigate } from "react-router-dom";
// // // import "./"; // Import the CSS file

// // const Home = () => {
// //   const history = useNavigate();

// //   return (
// //     <div className="welcome-container">
// //       <h1 className="welcome-title">Welcome</h1>
// //       <div className="button-container">
// //         <button
// //           className="welcome-button"
// //           onClick={() => history("/signin")}
// //         >
// //           Sign In
// //         </button>
// //         <button
// //           className="welcome-button"
// //           onClick={() => history("/signup")}
// //         >
// //           Sign Up
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Home;

// import React, { useState } from 'react';
// import './styles/LoginPage.css'; // Ensure you import the correct CSS file

// const LoginPage = () => {
//   const [role, setRole] = useState('');  // State to store the selected role

//   const handleRoleChange = (role) => {
//     setRole(role); // Update the selected role (student, teacher, or admin)
//   };

//   return (
//     <div className="login-container">
//       {/* Left Section - Login Form */}
//       <div className={`login-form ${role ? 'show' : ''}`}>
//         <h2>Login</h2>
//         {role === 'student' && (
//           <>
//             <label htmlFor="usn">USN:</label>
//             <input type="text" id="usn" placeholder="Enter USN" />
//           </>
//         )}
//         {role === 'teacher' && (
//           <>
//             <label htmlFor="teacherId">Teacher ID:</label>
//             <input type="text" id="teacherId" placeholder="Enter Teacher ID" />
//           </>
//         )}
//         {role === 'admin' && (
//           <>
//             <label htmlFor="adminId">Admin ID:</label>
//             <input type="text" id="adminId" placeholder="Enter Admin ID" />
//           </>
//         )}
//         <label htmlFor="password">Password:</label>
//         <input type="password" id="password" placeholder="Enter Password" />
//         <button className="login-btn">Login</button>
//       </div>

//       {/* Right Section - Role Selection */}
//       <div className={`role-selection ${role ? 'hide' : ''}`}>
//         <h3>Select your Role:</h3>
//         <button className="role-btn" onClick={() => handleRoleChange('student')}>Student</button>
//         <button className="role-btn" onClick={() => handleRoleChange('teacher')}>Teacher</button>
//         <button className="role-btn" onClick={() => handleRoleChange('admin')}>Admin</button>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
