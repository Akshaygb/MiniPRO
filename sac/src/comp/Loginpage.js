import React, { useState } from 'react';
import './AuthForm.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const toggleForm = (e, type) => {
    e.preventDefault();
    setIsLogin(type === 'login');
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-header">Login Form</h1>
        <div className="tab-container">
          <button className={`tab-button ${isLogin ? 'active' : 'inactive'}`} onClick={(e) => toggleForm(e, 'login')}>Login</button>
          <button className={`tab-button ${!isLogin ? 'active' : 'inactive'}`} onClick={(e) => toggleForm(e, 'signup')}>Signup</button>
        </div>

        <div className="form-container">
          {/* Login Form */}
          <form className={`form ${isLogin ? 'active' : ''}`} onSubmit={handleSubmit}>
            <div className="form-group">
              <input type="email" name="email" className="form-input" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <input type="password" name="password" className="form-input" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
            </div>
            <a href="#" className="auth-link forgot-password">Forgot password?</a>
            <button type="submit" className="auth-button">Login</button>
            <p className="help-text">Not a member? <a href="#" className="auth-link" onClick={(e) => toggleForm(e, 'signup')}>Signup now</a></p>
          </form>

          {/* Signup Form */}
          <form className={`form ${!isLogin ? 'active' : ''}`} onSubmit={handleSubmit}>
            <div className="form-group">
              <input type="email" name="email" className="form-input" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <input type="password" name="password" className="form-input" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <input type="password" name="confirmPassword" className="form-input" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} required />
            </div>
            <button type="submit" className="auth-button">Sign Up</button>
            <p className="help-text">Already have an account? <a href="#" className="auth-link" onClick={(e) => toggleForm(e, 'login')}>Login now</a></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
