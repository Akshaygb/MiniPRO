import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './comp/HomePage.js';
import Login from './comp/Login.js';
import Dashboard from './comp/Dashboard.js';
import Student from './comp/studentcomp/Student_Dashboard.js';
import Admin from './comp/admincompo/AdminDashboard.js';
import Student_detaile from './comp/Student_detaile.js';

export default function App() {
   const [user, setUser] = useState(null); // Manage user state globally
   const [StuDetaile, setStudetaile] = useState(null);
   

   return (
      <BrowserRouter>
         <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login setUser={setUser} />} /> 
            <Route path='/dashboard' element={<Dashboard user={user} setStudetaile={setStudetaile}/>} /> 
            <Route path='/student' element={<Student user={user} />} /> 
            <Route path='/admin' element={<Admin user={user} />} /> 
            {/* Remove the trailing / in this line */}
            <Route path='/student_details' element={<Student_detaile StuDetaile={StuDetaile} />} />
         </Routes>
      </BrowserRouter>
   );
}
