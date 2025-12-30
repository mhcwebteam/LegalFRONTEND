// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { API_BASE_URL, API_BASE_URLS } from "../config/Config";
// import axios from "axios";
// import { Eye, EyeOff, Lock, User, Layers } from 'lucide-react';
// import "./Login.css";

// export default function Login() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//     setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     try {
//       const response = await axios.post(`${API_BASE_URL}/login`, {
//         username: formData.username,
//         password: formData.password,
//       });

//       if (response.data.success) {
//         // --- START OF CHANGES ---
        
//         // 1. Save the token
//         localStorage.setItem('token', response.data.token);

//         // 2. Save the user details (convert object to string)
//         if (response.data.employee) {
//           localStorage.setItem('user', JSON.stringify(response.data.employee));
//         }

//         console.log("Login Successful:", response.data);
        
//         // --- END OF CHANGES ---

//         navigate("/create");
//       } else {
//         setError(response.data.message || "Login failed");
//       }
      
//     } catch (err) {
//       console.error(err);
//       // Handle axios errors or backend error messages
//       const errorMessage = err.response?.data?.message || "Unauthorized / Server Error";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   return (
//     <div className="login-wrapper">
    

//       <div className="login-container">
//         <div className="login-card">
//           {/* Logo Section */}
//           <div className="logo-section">
//             <div className="logo-icon">
//               <Layers size={32} />
//             </div>
//             <h1 className="login-title">Welcome Back</h1>
//             <p className="login-subtitle">
//               Sign in to access your Master Control Board
//             </p>
//           </div>

//           {/* Error Message */}
//           {error && <div className="error-message">{error}</div>}

//           {/* Login Form */}
//           <div className="login-form">
//             {/* Username Field */}
//             <div className="form-group">
//               <label className="form-label">Username</label>
//               <div className="input-wrapper">
//                 <User className="input-icon" size={20} />
//                 <input
//                   type="text"
//                   name="username"
//                   value={formData.username}
//                   onChange={handleChange}
//                   placeholder="Enter your username"
//                   autoComplete="username"
//                   className="form-input"
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div className="form-group">
//               <label className="form-label">Password</label>
//               <div className="input-wrapper">
//                 <Lock className="input-icon" size={20} />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="Enter your password"
//                   autoComplete="current-password"
//                   className="form-input"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="password-toggle"
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
        
//             </div>

//             {/* Submit Button */}
//             <button
//               onClick={handleSubmit}
//               disabled={isLoading}
//               className="submit-button"
//             >
//               {isLoading ? (
//                 <>
//                   <div className="loading-spinner"></div>
//                   Signing In...
//                 </>
//               ) : (
//                 "Sign In"
//               )}
//             </button>
//           </div>

//           {/* Divider */}
//           <div className="divider">
//             <span>OR</span>
//           </div>

//           {/* Sign Up Link */}
       
//         </div>

//         {/* Footer Text */}
//         <p className="footer-text">
//           © 2024 Master Control Board. All rights reserved.
//         </p>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
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
