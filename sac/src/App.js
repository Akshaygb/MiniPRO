// import React from 'react';
// import Home from './comp/Home.js';
// import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import Login from './comp/Login.js';
// import Dashboard from './comp/Dashboard.js';
// import Info1 from'./comp/Info1.js'
// import Subject from './comp/Subject.js'
// import Attedenceview from './comp/Attedenceview.js';
// import UploadDetaile from './comp/UploadDetaile.js'
// export default function App() {
//    return (
//       <BrowserRouter>
//          <Routes>
//             <Route path='/' element={<Home />} />
//             <Route path='/login' element={<Login />} />
//             <Route path='/dashboard' element={<Dashboard/>}/>
//             <Route path='/info' element={<Info1/>}/>
//             <Route path='/subject' element={<Subject/>}/>
//             <Route path='/attedenceview' element={<Attedenceview/>}/>
//             <Route path='/uploaddata' element={<UploadDetaile/>}/>
//          </Routes>
//       </BrowserRouter>
//    );
// }

import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the list of photos from the backend
        axios.get("http://localhost:5000/get-all-photos")
            .then((response) => {
                setPhotos(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching photos:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading photos...</p>;

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {photos.map((photo) => (
                <div key={photo.file_id} style={{ textAlign: "center" }}>
                    <img
                        src={`http://localhost:5000/get-photo/${photo.file_id}`}
                        alt={photo.filename}
                        style={{ width: "200px", height: "200px", objectFit: "cover" }}
                    />
                    <p>{photo.filename}</p>
                </div>
            ))}
        </div>
    );
};

export default App;
