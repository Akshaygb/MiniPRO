import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
    const [count, setCount] = useState(false);

    useEffect(() => {
        const time = setTimeout(() => {
            setCount(true);
        }, 300);

        return () => { clearTimeout(time); };
    }, []); // Add an empty dependency array

    return (
        <div className={`body ${count ? "normal" : "first"}`}>
            <h1>Welcome to Attendance Management System</h1>
            {count && <button className='button'><Link className='link' to="/login">Login / Sign up</Link></button>}
        </div>
    );
}
