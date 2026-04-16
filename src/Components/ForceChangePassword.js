
import React, { useState } from "react";
import apiClient from "../auth/apiClient";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

/* ── ICONS ── */
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="20">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="20">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ── PASSWORD FIELD ── */
const PasswordField = ({ label, name, value, onChange }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-3 position-relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="form-control rounded-pill pe-5"
        placeholder={label}
        autoComplete="off"
      />

      <button
        type="button"
        className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
        onClick={() => setShow((v) => !v)}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

/* ── MAIN COMPONENT ── */
const ForceChangePassword = () => {
  const [fd, setFd] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { auth, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFd({ ...fd, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!fd.oldPassword || !fd.newPassword || !fd.confirmPassword) {
      return setError("All fields are required");
    }

    if (fd.newPassword !== fd.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    try {
      await apiClient.post("/auth/changepassword", {
        userName: auth.username,
        oldPassword: fd.oldPassword,
        newPassword: fd.newPassword,
      });

      const updatedAuth = {
        ...auth,
        isPasswordChanged: true,
      };

      login(updatedAuth);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div

  className="container vh-100 d-flex justify-content-center align-items-center"
  style={{ minHeight: "100vh", paddingTop: "40px", paddingBottom: "40px" }}
>      
    
<div
  className="row shadow-lg overflow-hidden rounded-4"
  style={{ width: "50%", minHeight: "450px" }}
>
        {/* LEFT SIDE */}
        <div
          className="col-md-5 text-white d-flex flex-column justify-content-center p-4"
          style={{
            background: "#0a1f44",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)"
          }}
        >
          <h4 className="fw-bold">Security Update</h4>
          <p>
            For your security, please change your password before continuing.
          </p>
        </div>

        {/* RIGHT SIDE */}
<div
  className="col-md-7 bg-white p-4 d-flex flex-column align-items-center">
    <div style={{ width: "100%", maxWidth: "350px", marginTop: "50px" }}>
          <h4 className="fw-bold mb-2">Change Password</h4>
          <p className="text-muted mb-4">Update your password to continue</p>

          <PasswordField
            label="Current Password"
            name="oldPassword"
            value={fd.oldPassword}
            onChange={handleChange}
          />

          <PasswordField
            label="New Password"
            name="newPassword"
            value={fd.newPassword}
            onChange={handleChange}
          />

          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            value={fd.confirmPassword}
            onChange={handleChange}
          />

          {error && <div className="alert alert-danger py-2">{error}</div>}

          {/* 🔥 NAVY BUTTON */}
          <button
            className="btn w-100 text-white rounded-pill"
            style={{ backgroundColor: "#0a1f44" }}
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
</div>
      </div>
    </div>
  );
};

export default ForceChangePassword;