
import React, { useState } from "react";

const ProfilePage = () => {
  const [user, setUser] = useState({
    fullName: "",
    dob: "",
    city: "",
    state: "",
    mobile: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    profilePic: null,
  });

  const [preview, setPreview] = useState(null);
const [showCurrent, setShowCurrent] = useState(false);
const [showNew, setShowNew] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUser({ ...user, profilePic: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
  setUser({ ...user, profilePic: null });
  setPreview(null);
};

 const handleSubmit = (e) => {
  e.preventDefault();

  if (
    !user.fullName ||
    !user.dob ||
    !user.city ||
    !user.state ||
    !user.mobile ||
    !user.email ||
    !user.currentPassword ||
    !user.newPassword
  ) {
    alert("Please fill all fields");
    return;
  }
  alert("Profile Updated Successfully");
};
  return (
    
    <div style={{ background: "#f1f4f9", minHeight: "100vh", padding: "50px" }}>
      <div
        className="card mx-auto p-3"
        style={{
          maxWidth: "480px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >
        <h6 className="text-center mb-2 text-primary">My Profile</h6>

        {/* Profile Image */}
        <div className="text-center mb-3">
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={
                preview ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="profile"
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                border: "2px solid #0d6efd",
              }}
            />

            <label
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                background: "#0d6efd",
                color: "#fff",
                borderRadius: "50%",
                padding: "3px 5px",
                cursor: "pointer",
                fontSize: "9px",
              }}
            >
              ✎
              <input type="file" hidden onChange={handleImageChange} />
            </label>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control form-control-sm mb-2"
            placeholder="Full Name"
            name="fullName"
            value={user.fullName}
            onChange={handleChange}
          />

          <input
            type="date"
            className="form-control form-control-sm mb-2"
            name="dob"
            value={user.dob}
            onChange={handleChange}
          />

          <input
            type="text"
            className="form-control form-control-sm mb-2"
            placeholder="City"
            name="city"
            value={user.city}
            onChange={handleChange}
          />

          <input
            type="text"
            className="form-control form-control-sm mb-2"
            placeholder="State"
            name="state"
            value={user.state}
            onChange={handleChange}
          />

          <input
            type="tel"
            className="form-control form-control-sm mb-2"
            placeholder="Mobile Number"
            name="mobile"
            value={user.mobile}
            onChange={handleChange}
          />

          <input
            type="email"
            className="form-control form-control-sm mb-2"
            placeholder="Email"
            name="email"
            value={user.email}
            onChange={handleChange}
          />

        <div className="position-relative mb-2">
  <input
    type={showCurrent ? "text" : "password"}
    className="form-control form-control-sm"
    placeholder="Current Password"
    name="currentPassword"
    value={user.currentPassword}
    onChange={handleChange}
  />

  <i
    className={`icofont-${showCurrent ? "eye-blocked" : "eye"}`}
    onClick={() => setShowCurrent(!showCurrent)}
    style={{
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#666",
      fontSize: "16px",
    }}
  />
</div>

         <div className="position-relative mb-2">
  <input
    type={showNew ? "text" : "password"}
    className="form-control form-control-sm"
    placeholder="New Password"
    name="newPassword"
    value={user.newPassword}
    onChange={handleChange}
  />

  <i
    className={`icofont-${showNew ? "eye-blocked" : "eye"}`}
    onClick={() => setShowNew(!showNew)}
    style={{
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#666",
      fontSize: "16px",
    }}
  />
</div>
          

          <button className="btn btn-primary w-100 btn-sm">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;