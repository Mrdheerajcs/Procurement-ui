
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
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="mb-4">
            <h1 className="page-title">My Profile</h1>
            <p className="text-muted-soft">Manage your account details and password</p>
          </div>

          <div className="row g-4">
            {/* Avatar Card */}
            <div className="col-md-4">
              <div className="card text-center p-4 h-100">
                <div className="mx-auto mb-3" style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={preview || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt="profile"
                    className="rounded-circle"
                    style={{ width: "100px", height: "100px", objectFit: "cover", border: "3px solid var(--app-primary)" }}
                  />
                  <label style={{
                    position: "absolute", bottom: 0, right: 0,
                    background: "var(--app-primary)", color: "#fff",
                    borderRadius: "50%", width: "28px", height: "28px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 6px rgba(37,99,235,0.35)", fontSize: "12px"
                  }}>
                    <i className="bi bi-pencil-fill" />
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                <h6 className="fw-semibold mb-1">{user.fullName || "Your Name"}</h6>
                <p className="text-muted-soft small mb-0">{user.email || "your@email.com"}</p>
                {preview && (
                  <button className="btn btn-sm btn-outline-danger mt-3" onClick={handleRemoveImage}>
                    <i className="bi bi-trash me-1" />Remove Photo
                  </button>
                )}
              </div>
            </div>

            {/* Form Card */}
            <div className="col-md-8">
              <div className="card p-4">
                <h6 className="section-title mb-4">Personal Information</h6>
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="form-floating">
                        <input type="text" className="form-control" id="fullName" placeholder="Full Name" name="fullName" value={user.fullName} onChange={handleChange} />
                        <label htmlFor="fullName">Full Name</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input type="date" className="form-control" id="dob" placeholder="Date of Birth" name="dob" value={user.dob} onChange={handleChange} />
                        <label htmlFor="dob">Date of Birth</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input type="tel" className="form-control" id="mobile" placeholder="Mobile Number" name="mobile" value={user.mobile} onChange={handleChange} />
                        <label htmlFor="mobile">Mobile Number</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input type="text" className="form-control" id="city" placeholder="City" name="city" value={user.city} onChange={handleChange} />
                        <label htmlFor="city">City</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input type="text" className="form-control" id="state" placeholder="State" name="state" value={user.state} onChange={handleChange} />
                        <label htmlFor="state">State</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <input type="email" className="form-control" id="email" placeholder="Email Address" name="email" value={user.email} onChange={handleChange} />
                        <label htmlFor="email">Email Address</label>
                      </div>
                    </div>
                  </div>

                  <hr className="my-4" />
                  <h6 className="section-title mb-3">Change Password</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-floating position-relative">
                        <input
                          type={showCurrent ? "text" : "password"}
                          className="form-control"
                          id="currentPassword"
                          placeholder="Current Password"
                          name="currentPassword"
                          value={user.currentPassword}
                          onChange={handleChange}
                          style={{ paddingRight: "3rem" }}
                        />
                        <label htmlFor="currentPassword">Current Password</label>
                        <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-muted" style={{ zIndex: 5 }} onClick={() => setShowCurrent(!showCurrent)}>
                          <i className={`bi bi-eye${showCurrent ? "-slash" : ""}`} />
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating position-relative">
                        <input
                          type={showNew ? "text" : "password"}
                          className="form-control"
                          id="newPassword"
                          placeholder="New Password"
                          name="newPassword"
                          value={user.newPassword}
                          onChange={handleChange}
                          style={{ paddingRight: "3rem" }}
                        />
                        <label htmlFor="newPassword">New Password</label>
                        <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-muted" style={{ zIndex: 5 }} onClick={() => setShowNew(!showNew)}>
                          <i className={`bi bi-eye${showNew ? "-slash" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <button type="submit" className="btn btn-primary px-4">
                      <i className="bi bi-check2 me-2" />Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;