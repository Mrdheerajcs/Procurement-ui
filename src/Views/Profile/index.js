
import React, { useState } from "react";

const ProfilePage = () => {
  const [step, setStep] = useState(1);

  const [user, setUser] = useState({
    fullName: "",
    dob: "",
    city: "",
    state: "",
    mobile: "",
    email: "",
    currentPassword: "",
    newPassword: "",

    gstNo: "",
    panNo: "",
    registrationNo: "",
    licenseValidTill: "",

    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",

    profilePic: null,
  });

  const [preview, setPreview] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
     !user.accountHolder ||
      !user.accountNumber ||
     !user.ifsc ||
     !user.bankName
  ) {
      alert("Please fill all bank details");
      return;
    }

    alert("Profile Updated Successfully ✅");
  };
  return (
    <div className="main-bg">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">

            <h2 className="fw-bold mb-1 title">My Profile</h2>
            <p className="text-muted mb-3">
              Manage your account details
            </p>

            <div className="row g-4">

              {/* LEFT CARD */}
              <div className="col-md-4">
                <div className="glass-card text-center p-4 h-100 left-card">

                  <div className="profile-img-wrapper">
                    <img
                      src={
                        preview ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      className="profile-img"
                      alt=""
                    />

                    <label className="edit-btn">
                      <i className="bi bi-pencil-fill"></i>
                      <input type="file" hidden onChange={handleImageChange}/>
                    </label>
                  </div>

                  <h5 className="mt-3">
                    {user.fullName || "Your Name"}
                  </h5>

                  <p className="text-muted small">
                    {user.email || "your@email.com"}
                  </p>

                  {/* MENU */}
                  <div className="mt-4 w-100">
                    <div className={`nav-link-custom ${step === 1 ? "active" : ""}`} onClick={() => setStep(1)}>
                      Basic Info
                    </div>
                    <div className={`nav-link-custom ${step === 2 ? "active" : ""}`} onClick={() => setStep(2)}>
                      Legal Details
                    </div>
                    <div className={`nav-link-custom ${step === 3 ? "active" : ""}`} onClick={() => setStep(3)}>
                      Bank Details
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT FORM */}
              <div className="col-md-8">
                <div className="glass-card p-4 form-card">

                  {/* BASIC */}
                  {step === 1 && (
                    <>
                      <h5 className="mb-3">Personal Info</h5>

                      <div className="row g-3">
                        {[
                          { name: "vendorcode", placeholder: "Vendor Code" },
                          { name: "fullName", placeholder: "Full Name" },
                          { name: "dob", type: "date" },
                          { name: "mobile", placeholder: "Mobile" },
                          { name: "city", placeholder: "City" },
                          { name: "state", placeholder: "State" },
                           { name: "pincode", placeholder: "PinCode" },
                          
                          { name: "email", placeholder: "Email" },
                        ].map((f, i) => (
                         <div className="col-md-6">
                            <input
                              type={f.type || "text"}
                              name={f.name}
                              placeholder={f.placeholder}
                              value={user[f.name]}
                              onChange={handleChange}
                              className="glass-input"
                            />
                          </div>
                        ))}
                      </div>

                      {/* PASSWORD */}
                      <h5 className="mt-4 mb-3">Change Password</h5>

                      <div className="row g-3">
                        <div className="col-md-6 position-relative">
                          <input
                            type={showCurrent ? "text" : "password"}
                            name="currentPassword"
                            placeholder="Current Password"
                            value={user.currentPassword}
                            onChange={handleChange}
                            className="glass-input pe-5"
                          />
                          <i className="bi bi-eye toggle-eye" onClick={() => setShowCurrent(!showCurrent)} />
                        </div>

                        <div className="col-md-6 position-relative">
                          <input
                            type={showNew ? "text" : "password"}
                            name="newPassword"
                            placeholder="New Password"
                            value={user.newPassword}
                            onChange={handleChange}
                            className="glass-input pe-5"
                          />
                          <i className="bi bi-eye toggle-eye" onClick={() => setShowNew(!showNew)} />
                        </div>
                      </div>
                    </>
                  )}

                  {/* LEGAL (same layout) */}
                  {step === 2 && (
                    <>
                      <h5 className="mb-3">Legal Details</h5>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <input name="gstNo" placeholder="GST Number" className="glass-input" onChange={handleChange}/>
                        </div>
                        <div className="col-md-6">
                          <input name="panNo" placeholder="PAN Number" className="glass-input" onChange={handleChange}/>
                        </div>
                        <div className="col-md-6">
                          <input name="registrationNo" placeholder="Registration Number" className="glass-input" onChange={handleChange}/>
                        </div>
                        <div className="col-md-6">
                          <input type="date" name="licenseValidTill" className="glass-input" onChange={handleChange}/>
                        </div>
                      </div>
                    </>
                  )}

                  {/* BANK */}
                  {step === 3 && (
                    <>
                      <h5 className="mb-3">Bank Details</h5>

                      <div className="row g-3">
                        <div className="col-12">
                          <input name="accountHolder" placeholder="Account Holder Name" className="glass-input" onChange={handleChange}/>
                        </div>
                        <div className="col-md-6">
                          <input name="accountNumber" placeholder="Account Number" className="glass-input" onChange={handleChange}/>
                        </div>
                        <div className="col-md-6">
                          <input name="ifsc" placeholder="IFSC Code" className="glass-input" onChange={handleChange}/>
                        </div>
                        <div className="col-12">
                          <input name="bankName" placeholder="Bank Name" className="glass-input" onChange={handleChange}/>
                        </div>
                      </div>

                      {/* ✅ SAVE BUTTON */}
                      <div className="text-end mt-4">
                       <button className="btn btn-primary" onClick={handleSubmit}>
  Save Changes
</button>
                      </div>
                    </>
                  )}

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`
       .glass-card {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  transition: 0.3s ease;
}

/* 🔥 SAME HOVER EFFECT */
.glass-card:hover {
  transform: translateY(-6px) scale(1.01);
}

.glass-input {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: rgba(255,255,255,0.6);
  transition: 0.3s ease;
}

/* 🔥 CLEAN FOCUS EFFECT */
.glass-input:focus {
  outline: none;
  border-color: #0a1f44;
  box-shadow: 0 0 10px rgba(10,31,68,0.2);
}

        .form-card {
          min-height: 520px;
        }

        .left-card {
          min-height: 520px;
        }

        
        .profile-img-wrapper {
          position: relative;
          width: fit-content;
          margin: auto;
        }

        .profile-img {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          border: 3px solid #ddd;
        }

        .edit-btn {
          position: absolute;
          bottom: 5px;
          right: 5px;
          background: #0a1f44;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* SIMPLE HOVER */
        .nav-link-custom {
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: 0.3s;
        }

        .nav-link-custom:hover {
          background: #0a1f44;
          color: white;
        }

        .nav-link-custom.active {
          background: #0a1f44;
          color: white;
        }

        .toggle-eye {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;