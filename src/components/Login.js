
// import React, { useState } from "react";
// import TextField from "@mui/material/TextField";
// import Button from "@mui/material/Button";
// import { Box, Paper, Typography } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { API_BASE_URLS } from "../config/Config";
// import axios from "axios";

// export default function Login() {
//     const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   console.log("Login Submitted:", formData);

//   try {
//       const response = await axios.post(
//         `${API_BASE_URLS}/login`,
//         {
//           username: formData.username,
//           password: formData.password,
//         }
//       );

    
// navigate('/create')

//     }
//     catch(err){
//      alert(err?.response?.data?.error || "Unauthorized")
//     } 

// };


//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "linear-gradient(135deg, #f3f3f3 0%, #e3e6fa 100%)",
//       }}
//     >
//       <Paper
//         elevation={8}
//         sx={{
//           p: 5,
//           width: "100%",
//           maxWidth: 380,
//           borderRadius: 4,
//           boxShadow: "0 8px 24px rgba(50,50,105,0.08)",
//         }}
//       >
//         <Typography
//           variant="h5"
//           sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}
//         >
//           Login
//         </Typography>

//         <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//           <TextField
//             fullWidth
//             label="username"
//             name="username"
//             variant="outlined"
//             value={formData.username}
//             onChange={handleChange}
//             autoComplete="username"
//           />

//           <TextField
//             fullWidth
//             label="Password"
//             type="password"
//             name="password"
//             variant="outlined"
//             value={formData.password}
//             onChange={handleChange}
//             autoComplete="current-password"
//           />

//           <Button
//             type="submit"
//             variant="contained"
//             size="large"
//             sx={{
//               backgroundColor: "#1976d2",
//               py: 1.5,
//               borderRadius: 2,
//               fontWeight: "bold",
//               ":hover": { backgroundColor: "#1562b6" },
//             }}
//             fullWidth
//           >
//             Sign In
//           </Button>
//         </Box>

//         <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: "text.secondary" }}>
//           Don't have an account?{' '}
//           <span
//             style={{ color: "#1976d2", cursor: "pointer", fontWeight: 600 }}
//             // onClick={navigateToSignUp} // Add navigation function if needed
//           >
//             Sign Up
//           </span>
//         </Typography>
//       </Paper>
//     </Box>
//   );
// }


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, API_BASE_URLS } from "../config/Config";
import axios from "axios";
import { Eye, EyeOff, Lock, User, Layers } from 'lucide-react';
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

      console.log("Login Successful:", response.data);
      navigate("/create");
    } catch (err) {
      setError(err?.response?.data?.error || "Unauthorized");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
    

      <div className="login-container">
        <div className="login-card">
          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-icon">
              <Layers size={32} />
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Sign in to access your Master Control Board
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

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Sign Up Link */}
       
        </div>

        {/* Footer Text */}
        <p className="footer-text">
          © 2024 Master Control Board. All rights reserved.
        </p>
      </div>
    </div>
  );
}