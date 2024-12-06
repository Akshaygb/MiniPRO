import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./TeacherDashboard.css";

const Dashboard = () => {
  const [photo, setPhoto] = useState("https://via.placeholder.com/150");

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Dashboard buttons configuration
  const dashboardButtons = [
    { label: "Course Details", icon: "📋", link: "/coursedetails" },
    { label: "Student Details", icon: "👥", link: "/studentdetails" },
    { label: "Upload", icon: "⬆️", link: "/uploaddata" },
    { label: "Attendance View", icon: "👀", link: "/attedenceview" },
    { label: "Visual View", icon: "📊", link: "/visualview" },
    { label: "Subject", icon: "➕", link: "/subject" },
  ];

  return (
    <div className="teacher-dashboard">
      {/* Sidebar Section */}
      <div className="dashboard-sidebar">
        <div className="profile-section">
          <div className="profile-image-container">
            <img src={photo} alt="Teacher Profile" className="profile-image" />
            <div className="edit-photo-overlay">
              <input
                type="file"
                id="photoUpload"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="photo-upload-input"
              />
              <label htmlFor="photoUpload" className="edit-photo-btn">
                Edit Photo
              </label>
            </div>
          </div>
          <div className="profile-details">
            <h2>John Doe</h2>
            <p>Computer Science Teacher</p>
            <p>Employee ID: TD001</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Section */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Teacher Dashboard</h1>
          <div className="header-actions">
            <button className="action-button logout-btn">Logout</button>
          </div>
        </div>

        <div className="dashboard-grid">
          {dashboardButtons.map((button, index) => (
            <div key={index} className="dashboard-grid-item">
              <div className="grid-item-content">
                <span className="grid-item-icon">{button.icon}</span>
                <span className="grid-item-label">
                  {button.link ? (
                    <Link to={button.link} className="link-button">
                      {button.label}
                    </Link>
                  ) : (
                    <button className="link-button">
                      {button.label}
                    </button>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Start and End Buttons */}
        <div className="start-end-buttons">
          <button className="small-button start-btn">Start</button>
          <button className="small-button end-btn">End</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
