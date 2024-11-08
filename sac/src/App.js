import React from 'react';
import Home from './comp/Home.js';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './comp/Login.js';
import Dashboard from './comp/Dashboard.js';
export default function App() {
   return (
      <BrowserRouter>
      
         <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/dashboard' element={<Dashboard/>}/>
         </Routes>
      </BrowserRouter>
   );
}
