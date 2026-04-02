import React, { useState } from "react";
import Register from "../Register"; 
import "./Login.css";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className={`wrapper ${isRegister ? "register" : ""}`}>

       
      <div className="form-box login">
        <h2>Login</h2>

        <div className="input-box" style={{ "--i": 1 }}>
          <input type="text" placeholder="Email" />
        </div>

        <div className="input-box" style={{ "--i": 2 }}>
          <input type="password" placeholder="Password" />
        </div>

        <button className="btn">Login</button>

        <p>
          Don't have account?{" "}
          <span onClick={() => setIsRegister(true)}>Register</span>
        </p>
      </div>

      
      <div className="form-box register-form">
        <Register goToLogin={() => setIsRegister(false)} />
      </div>

      
      <div className="info-content">
        <h2>{isRegister ? "Welcome Back!" : "Hello Friend!"}</h2>

        <p>
          {isRegister
            ? "Already have account? Login now"
            : "Create account to get started"}
        </p>

        <button
          className="btn"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Login" : "Register"}
        </button>
      </div>

    </div>
  );
};

export default Login;