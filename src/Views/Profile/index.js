import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import apiClient from "../../auth/apiClient";
import ProfileImg from "../../assets/images/profile_av.png";

const ProfilePage = () => {
  const { auth, setAuth } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const userRoles = auth?.roles || [];
  const isVendor = userRoles.some(role => role === "VENDER_USER");
  const isAdmin = userRoles.some(role => role === "PROCUREMENT_ADMIN");
  const username = auth?.username || "";
  
  const [user, setUser] = useState({
    fullName: "",
    city: "",
    state: "",
    pincode: "",
    mobile: "",
    email: "",
    vendorCode: "",
    gstNo: "",
    panNo: "",
    registrationNo: "",
    licenseValidTill: "",
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profilePic: null,
  });

  const [preview, setPreview] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const readOnlyFields = isVendor 
    ? ["vendorCode", "email", "panNo", "registrationNo", "licenseValidTill"]
    : ["email"];

  useEffect(() => {
    fetchProfile();
  }, [isVendor]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      if (isVendor) {
        const res = await apiClient.get("/api/vendors/profile");
        if (res.status === "SUCCESS") {
          const data = res.data;
          setUser(prev => ({
            ...prev,
            fullName: data.vendorName || "",
            vendorCode: data.vendorCode || "",
            mobile: data.mobileNo || "",
            email: data.emailId || username,
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
            gstNo: data.gstNo || "",
            panNo: data.panNo || "",
            registrationNo: data.drugLicenseNo || "",
            licenseValidTill: data.licenseValidTill || "",
            bankName: data.bankName || "",
            accountHolder: data.contactPerson || "",
            accountNumber: data.accountNo || "",
            ifscCode: data.ifscCode || "",
          }));
        }
      } else {
        const res = await apiClient.get("/auth/profile");
        if (res.status === "SUCCESS") {
          const data = res.data;
          setUser(prev => ({
            ...prev,
            fullName: data.username || username,
            email: data.email || username,
          }));
          if (data.profilePicUrl) {
            setPreview(data.profilePicUrl);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get profile pic URL from auth
  const profilePicUrl = auth?.profilePicUrl || null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
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

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    
    try {
      if (isVendor) {
        const formData = new FormData();
        
        const profileData = {
          vendorName: user.fullName,
          mobileNo: user.mobile,
          city: user.city,
          state: user.state,
          pincode: user.pincode,
          gstNo: user.gstNo,
          contactPerson: user.accountHolder,
          bankName: user.bankName,
          accountNo: user.accountNumber,
          ifscCode: user.ifscCode,
        };
        
        formData.append("data", new Blob([JSON.stringify(profileData)], { type: "application/json" }));
        
        if (user.profilePic) {
          formData.append("profilePic", user.profilePic);
        }
        
        const res = await apiClient.put(`/api/vendors/${auth?.userId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        if (res.status === "SUCCESS") {
          setMessage({ type: "success", text: "Profile updated successfully!" });
          
          // ✅ Refresh auth to update header
          const profileRes = await apiClient.get("/auth/profile");
          if (profileRes.status === "SUCCESS" && setAuth) {
            setAuth(prev => ({
              ...prev,
              profilePicUrl: profileRes.data.profilePicUrl
            }));
          }
          
          await fetchProfile();
        } else {
          setMessage({ type: "error", text: res.message || "Update failed" });
        }
      } else {
        setMessage({ type: "info", text: "Admin profile update is limited. Contact super admin for changes." });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user.currentPassword || !user.newPassword) {
      setMessage({ type: "error", text: "Please fill current and new password" });
      return;
    }
    
    if (user.newPassword !== user.confirmPassword) {
      setMessage({ type: "error", text: "New password and confirm password do not match" });
      return;
    }
    
    if (user.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/changepassword", {
        userName: username,
        oldPassword: user.currentPassword,
        newPassword: user.newPassword
      });
      
      if (res.status === "SUCCESS" || res.status === 200) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setUser(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      } else {
        setMessage({ type: "error", text: res.message || "Password change failed" });
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setMessage({ type: "error", text: err.response?.data || "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user.fullName) {
    return (
      <div className="container-fluid text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="main-bg">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <h2 className="fw-bold mb-1 title">My Profile</h2>
            <p className="text-muted mb-3">Manage your account details</p>

            {message.text && (
              <div className={`alert alert-${message.type === "success" ? "success" : message.type === "info" ? "info" : "danger"} alert-dismissible fade show mb-3`}>
                {message.text}
                <button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })} />
              </div>
            )}

            <div className="row g-4">

              {/* LEFT CARD */}
              <div className="col-md-4">
                <div className="glass-card text-center p-4 h-100 left-card">
                  <div className="profile-img-wrapper">
                    <img
                      src={preview || profilePicUrl || ProfileImg}
                      className="profile-img"
                      alt="Profile"
                      onError={(e) => { e.target.src = ProfileImg; }}
                    />
                    <label className="edit-btn">
                      <i className="bi bi-pencil-fill"></i>
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  {preview && (
                    <button className="btn btn-sm btn-outline-danger mt-2" onClick={handleRemoveImage}>
                      <i className="bi bi-trash me-1" /> Remove
                    </button>
                  )}
                  <h5 className="mt-3">{user.fullName || "Your Name"}</h5>
                  <p className="text-muted small">{user.email || "your@email.com"}</p>
                  {isVendor && user.vendorCode && (
                    <p className="text-muted small">Vendor Code: {user.vendorCode}</p>
                  )}
                  <div className="mt-4 w-100">
                    <div className={`nav-link-custom ${step === 1 ? "active" : ""}`} onClick={() => setStep(1)}>
                      <i className="bi bi-person me-2" /> Basic Info
                    </div>
                    {isVendor && (
                      <>
                        <div className={`nav-link-custom ${step === 2 ? "active" : ""}`} onClick={() => setStep(2)}>
                          <i className="bi bi-briefcase me-2" /> Legal Details
                        </div>
                        <div className={`nav-link-custom ${step === 3 ? "active" : ""}`} onClick={() => setStep(3)}>
                          <i className="bi bi-bank me-2" /> Bank Details
                        </div>
                      </>
                    )}
                    <div className={`nav-link-custom ${step === 4 ? "active" : ""}`} onClick={() => setStep(4)}>
                      <i className="bi bi-key me-2" /> Change Password
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT FORM */}
              <div className="col-md-8">
                <div className="glass-card p-4 form-card">

                  {/* BASIC INFO */}
                  {step === 1 && (
                    <>
                      <h5 className="mb-3">Personal Information</h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small">Full Name</label>
                          <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={user.fullName}
                            onChange={handleChange}
                            className={`glass-input ${readOnlyFields.includes("fullName") ? "read-only-field" : ""}`}
                            readOnly={readOnlyFields.includes("fullName")}
                          />
                        </div>
                        {isVendor && (
                          <div className="col-md-6">
                            <label className="form-label small">Vendor Code</label>
                            <input
                              type="text"
                              name="vendorCode"
                              placeholder="Vendor Code"
                              value={user.vendorCode}
                              className="glass-input read-only-field"
                              readOnly
                            />
                          </div>
                        )}
                        <div className="col-md-6">
                          <label className="form-label small">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={user.email}
                            className="glass-input read-only-field"
                            readOnly
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small">Mobile Number</label>
                          <input
                            type="tel"
                            name="mobile"
                            placeholder="Mobile Number"
                            value={user.mobile}
                            onChange={handleChange}
                            className="glass-input"
                            disabled={!isVendor}
                          />
                        </div>
                        {isVendor && (
                          <>
                            <div className="col-md-4">
                              <label className="form-label small">City</label>
                              <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={user.city}
                                onChange={handleChange}
                                className="glass-input"
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small">State</label>
                              <input
                                type="text"
                                name="state"
                                placeholder="State"
                                value={user.state}
                                onChange={handleChange}
                                className="glass-input"
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small">Pincode</label>
                              <input
                                type="text"
                                name="pincode"
                                placeholder="Pin Code"
                                value={user.pincode}
                                onChange={handleChange}
                                className="glass-input"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      
                      {isVendor && (
                        <div className="text-end mt-4">
                          <button className="btn btn-primary" onClick={handleUpdateProfile} disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                            Save Changes
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* LEGAL DETAILS */}
                  {step === 2 && isVendor && (
                    <>
                      <h5 className="mb-3">Legal Details</h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small">GST Number</label>
                          <input
                            name="gstNo"
                            className="glass-input"
                            placeholder="GST Number"
                            value={user.gstNo}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small">PAN Number</label>
                          <input
                            name="panNo"
                            className="glass-input read-only-field"
                            placeholder="PAN Number"
                            value={user.panNo}
                            readOnly
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small">Registration Number</label>
                          <input
                            name="registrationNo"
                            className="glass-input read-only-field"
                            placeholder="Registration Number"
                            value={user.registrationNo}
                            readOnly
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small">License Valid Till</label>
                          <input
                            type="date"
                            name="licenseValidTill"
                            className="glass-input read-only-field"
                            value={user.licenseValidTill}
                            readOnly
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* BANK DETAILS */}
                  {step === 3 && isVendor && (
                    <>
                      <h5 className="mb-3">Bank Details</h5>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label small">Account Holder Name</label>
                          <input
                            name="accountHolder"
                            className="glass-input"
                            placeholder="Account Holder Name"
                            value={user.accountHolder}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small">Account Number</label>
                          <input
                            name="accountNumber"
                            className="glass-input"
                            placeholder="Account Number"
                            value={user.accountNumber}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small">IFSC Code</label>
                          <input
                            name="ifscCode"
                            className="glass-input"
                            placeholder="IFSC Code"
                            value={user.ifscCode}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label small">Bank Name</label>
                          <input
                            name="bankName"
                            className="glass-input"
                            placeholder="Bank Name"
                            value={user.bankName}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="text-end mt-4">
                        <button className="btn btn-primary" onClick={handleUpdateProfile} disabled={loading}>
                          {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                          Save Bank Details
                        </button>
                      </div>
                    </>
                  )}

                  {/* CHANGE PASSWORD */}
                  {step === 4 && (
                    <>
                      <h5 className="mb-3">Change Password</h5>
                      <div className="row g-3">
                        <div className="col-md-12 position-relative">
                          <label className="form-label small">Current Password</label>
                          <div className="position-relative">
                            <input
                              type={showCurrent ? "text" : "password"}
                              name="currentPassword"
                              placeholder="Current Password"
                              value={user.currentPassword}
                              onChange={handleChange}
                              className="glass-input pe-5"
                            />
                            <i 
                              className={`bi ${showCurrent ? "bi-eye-slash" : "bi-eye"} toggle-eye`} 
                              onClick={() => setShowCurrent(!showCurrent)}
                            />
                          </div>
                        </div>
                        <div className="col-md-12 position-relative">
                          <label className="form-label small">New Password</label>
                          <div className="position-relative">
                            <input
                              type={showNew ? "text" : "password"}
                              name="newPassword"
                              placeholder="New Password"
                              value={user.newPassword}
                              onChange={handleChange}
                              className="glass-input pe-5"
                            />
                            <i 
                              className={`bi ${showNew ? "bi-eye-slash" : "bi-eye"} toggle-eye`} 
                              onClick={() => setShowNew(!showNew)}
                            />
                          </div>
                        </div>
                        <div className="col-md-12 position-relative">
                          <label className="form-label small">Confirm New Password</label>
                          <div className="position-relative">
                            <input
                              type={showConfirm ? "text" : "password"}
                              name="confirmPassword"
                              placeholder="Confirm Password"
                              value={user.confirmPassword}
                              onChange={handleChange}
                              className="glass-input pe-5"
                            />
                            <i 
                              className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"} toggle-eye`} 
                              onClick={() => setShowConfirm(!showConfirm)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-end mt-4">
                        <button className="btn btn-primary" onClick={handleChangePassword} disabled={loading}>
                          {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                          Change Password
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
        .glass-input:focus {
          outline: none;
          border-color: #0a1f44;
          box-shadow: 0 0 10px rgba(10,31,68,0.2);
        }
        .read-only-field {
          background-color: #e9ecef !important;
          color: #6c757d !important;
          cursor: not-allowed;
        }
        .form-card { min-height: 520px; }
        .left-card { min-height: 520px; }
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
          object-fit: cover;
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
        .nav-link-custom {
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: 0.3s;
        }
        .nav-link-custom:hover,
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
          color: #6c757d;
          z-index: 10;
        }
        .toggle-eye:hover {
          color: #0a1f44;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;