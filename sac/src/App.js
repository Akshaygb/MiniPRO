import React from 'react';
import Home from './comp/Home.js';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './comp/Login.js';
import Dashboard from './comp/Dashboard.js';
import Info1 from'./comp/Info1.js'
import Subject from './comp/Subject.js'
import Attedenceview from './comp/Attedenceview.js';
import UploadDetaile from './comp/UploadDetaile.js'
export default function App() {
   return (
      <BrowserRouter>
         <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/dashboard' element={<Dashboard/>}/>
            <Route path='/info' element={<Info1/>}/>
            <Route path='/subject' element={<Subject/>}/>
            <Route path='/attedenceview' element={<Attedenceview/>}/>
            <Route path='/uploaddata' element={<UploadDetaile/>}/>
         </Routes>
      </BrowserRouter>
   );
}

