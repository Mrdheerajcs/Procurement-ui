import React, { useState } from "react";
import apiClient from "../auth/apiClient";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

/* ── ICONS ── */
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ── REUSABLE PASSWORD FIELD ── */
const PasswordField = ({ label, name, value, onChange }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="field-wrap has-icon">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        autoComplete="off"
      />
      <label>{label}</label>

      <button
        type="button"
        className="pwd-toggle"
        onClick={() => setShow((v) => !v)}
        tabIndex={-1}
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
  userName: auth.username,   // 🔥 IMPORTANT
  oldPassword: fd.oldPassword,
  newPassword: fd.newPassword,
});
      // ✅ update auth flag
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
    <div className="lr-page">
      <div className="lr-scene" style={{ height: "auto" }}>
        <div className="lr-face" style={{ position: "relative" }}>

          {/* LEFT INFO PANEL */}
          <div className="lr-info-side">
            <div className="lr-info-inner">
              <p className="lr-info-h">Security Update</p>
              <p className="lr-info-p">
                For your security, please change your password before continuing.
              </p>
            </div>
          </div>

          {/* RIGHT FORM PANEL */}
          <div className="lr-form-side">
            <h1 className="lr-h1">Change Password</h1>
            <p className="lr-subtitle">Update your password to continue</p>

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

            {error && <p className="lr-err">{error}</p>}

            <button
              className="lr-btn-main"
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