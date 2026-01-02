

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/Config";
import axios from "axios";
import { Eye, EyeOff, Lock, User, Scale } from 'lucide-react';
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };



  useEffect(() => {
  const handleEnterKey = (e) => {
    if (e.key === 'Enter' && formData.username && formData.password) {
      // Create a synthetic event
      const syntheticEvent = { preventDefault: () => {} };
      handleSubmit(syntheticEvent);
    }
  };

  window.addEventListener('keydown', handleEnterKey);
  
  return () => {
    window.removeEventListener('keydown', handleEnterKey);
  };
}, [formData.username, formData.password]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username: formData.username,
        password: formData.password,
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        if (response.data.employee) {
          localStorage.setItem('user', JSON.stringify(response.data.employee));
        }
        console.log("Login Successful:", response.data);
        navigate("/create");
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Unauthorized / Server Error";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Main Content */}
      <div className="login-content">
        <div className="login-container">
          <div className="login-card">
            {/* Dual Logo Section */}
            <div className="logo-section">
              <div className="dual-logo-container">
                <img 
                  src={`${process.env.PUBLIC_URL}/favicon.ico`}
                  alt="Company Logo" 
                  className="favicon-logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    console.error('Failed to load favicon.ico');
                  }}
                />
                <div className="logo-icon">
                  <Scale size={40} />
                </div>
              </div>
              <h1 className="login-title">WELCOME BACK</h1>
              <p className="login-subtitle">
                  Sign in to access your MHCPL-Legal Application
              </p>
            </div>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Login Form */}
            <div className="login-form">
              {/* Username Field */}
              <div className="form-group">
                <label className="form-label">Username</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
