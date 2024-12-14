import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  const goToSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="new-home-page">
      <h1 className="new-home-title">
        Welcome to the <span className="new-highlight">Attendance System</span>
      </h1>
      <p className="new-home-subtitle">
        Manage your attendance with ease and accuracy!
      </p>
      <div className="new-button-group">
        <button className="new-home-button" onClick={goToSignIn}>
          Sign In
        </button>
      </div>
    </div>
  );
}

export default HomePage;
