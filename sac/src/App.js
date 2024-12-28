import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './comp/HomePage.js';
import Login from './comp/Login.js';
import Dashboard from './comp/Dashboard.js';
import Student from './comp/studentcomp/Student_Dashboard.js';
import Admin from './comp/admincompo/AdminDashboard.js';
import Student_detaile from './comp/studentcomp/Student_detaile.js';
import Attedence_view from './comp/studentcomp/Attedence_view.js';
import Eligibel from './comp/studentcomp/Eligibel.js';
import UpdateStudent from './comp/studentcomp/UpdateStudent.js'
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
            <Route path='/student_details' element={<Student_detaile StuDetaile={StuDetaile} />}
             />
              <Route path='/attedence view' element={<Attedence_view user={user} />} />
              <Route path='/eligibel' element={<Eligibel />} />
              <Route path='/update' element={<UpdateStudent />}/>
         </Routes>
      </BrowserRouter>
   );
}
// import React from 'react';
// import axios from 'axios';

// export default function App() {
//   const handle = () => {
//     const data = { hi: 'shambhu' };

//     axios
//       .post('http://localhost:5000/hi', data, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       })
//       .then((response) => {
//         if (response.status === 201) {
//           alert('Login Successful');
//         }
//       })
//       .catch((error) => {
//         console.error('Error:', error.response ? error.response.data : error.message);
//         alert('Error occurred');
//       });
//   };

//   return (
//     <div>
//       <input type="text" />
//       <button onClick={handle}>Submit</button>
//     </div>
//   );
// }
