import React from 'react';
import Home from './comp/Home.js';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './comp/Login.js';

export default function App() {
   return (
      <BrowserRouter>
      
         <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
         </Routes>
      </BrowserRouter>
   );
}
