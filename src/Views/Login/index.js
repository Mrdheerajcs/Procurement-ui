import React, { useState, useEffect } from "react";
import "./login.css";
import { useAuth } from "../../auth/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../auth/apiClient";


/* ─────────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────────── */
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


/* ─────────────────────────────────────────────
   REUSABLE FIELD COMPONENTS
───────────────────────────────────────────── */
const Field = ({ label, name, type = "text", value, onChange, required, disabled, maxLength, as = "input", children }) => (
  <div className="field-wrap">
    {as === "select" ? (
      <select
        name={name} id={name} value={value} onChange={onChange}
        required={required} disabled={disabled}
        className={value ? "has-value" : ""}
      >
        {children}
      </select>
    ) : (
      <input
        type={type} name={name} id={name} value={value} onChange={onChange}
        required={required} disabled={disabled}
        placeholder=" " autoComplete="off" maxLength={maxLength}
      />
    )}
    <label htmlFor={name}>
      {label}{required && <span style={{ color: "#dc2626" }}> *</span>}
    </label>
  </div>
);

const PasswordField = ({ label, name, id, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="field-wrap has-icon">
      <input
        type={show ? "text" : "password"} name={name} id={id || name}
        value={value} onChange={onChange} placeholder=" " autoComplete="off"
      />
      <label htmlFor={id || name}>{label}</label>
      <button type="button" className="pwd-toggle"
        onClick={() => setShow(v => !v)} tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

const Toggle = ({ label, name, checked, onChange }) => (
  <div className="lr-toggle-row">
    <span className="lr-toggle-label">{label}</span>
    <label className="lr-switch">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} style={{ display: "none" }} />
      <span className={`lr-slider${checked ? " on" : ""}`}>
        <span className={`lr-slider-thumb${checked ? " on" : ""}`} />
      </span>
    </label>
    <span className={`lr-toggle-status${checked ? " yes" : " no"}`}>{checked ? "Yes" : "No"}</span>
  </div>
);

const TwoCol = ({ children }) => <div className="lr-two-col">{children}</div>;


/* ═════════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════════ */
const Login = () => {
  // ── KEY FIX: read ?mode= from URL ──
  const [searchParams] = useSearchParams();
  const urlMode = searchParams.get("mode"); // "login" | "register" | null

  // isFlipped = true → Register side shown, false → Login side shown
  const [isFlipped, setIsFlipped]   = useState(urlMode === "register");
  const [step, setStep]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [loginError, setLoginError] = useState("");
  const [regError, setRegError]     = useState("");
  const [submitted, setSubmitted]   = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [countries, setCountries]     = useState([]);
  const [states, setStates]           = useState([]);
  const [vendorTypes, setVendorTypes] = useState([]);

  const [loginData, setLoginData] = useState({ username: "", password: "" });

  const [fd, setFd] = useState({
    vendorCode: "", vendorName: "", contactPerson: "", mobileNo: "",
    alternateMobile: "", emailId: "", vendorTypeId: "",
    addressLine1: "", addressLine2: "", city: "", state: "", country: "", pincode: "",
    gstNo: "", panNo: "", registrationNo: "", licenseValidTill: "",
    bankName: "", accountNo: "", confirmAccountNo: "", ifscCode: "", bankAddress: "",
    isPreferred: false, isBlacklisted: false, blacklistReason: "",
  });

  // ── Re-sync if user navigates between ?mode=login and ?mode=register ──
  useEffect(() => {
    setIsFlipped(urlMode === "register");
    setStep(1);
    setRegError("");
    setLoginError("");
    setSubmitted(false);
  }, [urlMode]);

  useEffect(() => {
    fetchCountries();
    fetchVendorTypes();
  }, []);

  /* ── API helpers ── */
  const fetchCountries = async () => {
    try {
      const res = await apiClient.get("/api/master/getAllcountry");
      if (res.status === "SUCCESS") setCountries(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchStates = async (countryId) => {
    try {
      const res = await apiClient.get(`/api/master/getStateId/${countryId}`);
      setStates(res);
    } catch (err) { console.log(err); }
  };

  const fetchVendorTypes = async () => {
    try {
      const res = await apiClient.get("/api/master/getAllVendorType");
      if (res.status === "SUCCESS") setVendorTypes(res.data);
    } catch (err) { console.log(err); }
  };

  const totalSteps = 5;
  const stepNames  = ["Basic", "Address", "Legal", "Bank", "Pref"];
  const progress   = ((step - 1) / (totalSteps - 1)) * 100;

  const { login } = useAuth();
  const navigate  = useNavigate();

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    setFd((prev) => {
      if (name === "isBlacklisted" && !checked) {
        return { ...prev, isBlacklisted: false, blacklistReason: "" };
      }

      let updatedFd = { ...prev, [name]: val };

      if (name === "country") {
        const selectedCountry = countries.find(c => c.countryName === value);
        if (selectedCountry) fetchStates(selectedCountry.countryId);
        else setStates([]);
        updatedFd.state = "";
      }

      if (["mobileNo", "alternateMobile"].includes(name)) {
        if (!/^\d*$/.test(val) || val.length > 10) return prev;
      }
      if (name === "pincode") {
        if (!/^\d*$/.test(val) || val.length > 6) return prev;
      }
      if (["accountNo", "confirmAccountNo"].includes(name)) {
        if (!/^\d*$/.test(val)) return prev;
      }
      if (name === "panNo") {
        val = val.toUpperCase();
        if (val.length > 10) return prev;
        updatedFd[name] = val;
      }
      if (name === "gstNo") {
        val = val.toUpperCase();
        if (val.length > 15) return prev;
        updatedFd[name] = val;
      }
      if (name === "ifscCode") {
        val = val.toUpperCase();
        if (val.length > 11) return prev;
        updatedFd[name] = val;
      }
      if (["vendorName", "city", "state", "country", "contactPerson"].includes(name)) {
        if (!/^[a-zA-Z\s]*$/.test(val)) return prev;
      }

      if (updatedFd.accountNo && updatedFd.confirmAccountNo) {
        if (updatedFd.accountNo !== updatedFd.confirmAccountNo) {
          setRegError("Account number and Confirm Account number do not match");
        } else {
          setRegError("");
        }
      } else {
        setRegError("");
      }

      return updatedFd;
    });
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  // flip between Login ↔ Register panel (manual toggle via buttons)
  const flip = () => {
    setIsFlipped(v => !v);
    setStep(1);
    setRegError("");
    setLoginError("");
    setSubmitted(false);
  };

  const next = () => step < totalSteps && setStep(s => s + 1);
  const prev = () => step > 1 && setStep(s => s - 1);

  /* ── Login API ── */
  const doLogin = async () => {
    if (!loginData.username || !loginData.password) {
      setLoginError("Please fill all fields.");
      return;
    }
    setLoading(true);
    setLoginError("");
    try {
      const res = await apiClient.post("/auth/login", loginData);
      if (res.status === "SUCCESS" && res.data?.token) {
        const loginInfo = res.data;
        const userData = {
          token: loginInfo.token, tokenType: loginInfo.tokenType,
          expiresAt: Date.now() + loginInfo.expiresIn,
          username: loginInfo.username, roles: loginInfo.roles,
          userId: loginInfo.userId, email: loginInfo.email,
          isPasswordChanged: loginInfo.isPasswordChanged,
        };
        login(userData);
        navigate(loginInfo.isPasswordChanged ? "/dashboard" : "/force-change-password");
      } else {
        setLoginError(res.message || "Invalid credentials");
      }
    } catch (err) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ── Register API ── */
  const submitForm = async () => {
    setRegError("");
    setSuccessMsg("");
    setLoading(true);
    const payload = {
      ...fd,
      isPreferred:   fd.isPreferred   ? "Y" : "N",
      isBlacklisted: fd.isBlacklisted ? "Y" : "N",
    };
    try {
      const res = await apiClient.post("/api/vendors/registration", payload);
      if (res.status === "SUCCESS") {
        setSuccessMsg(res.message || "Vendor registered successfully");
        setSubmitted(true);
        setTimeout(() => flip(), 3000);
      } else {
        setRegError(res.message || "Registration failed.");
      }
    } catch {
      setRegError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step body ── */
  const stepBody = () => {
    switch (step) {
      case 1:
        return (
          <>
            <TwoCol>
              <Field label="Vendor Code" name="vendorCode" value={fd.vendorCode} onChange={handleChange} required />
              <Field label="Vendor Name" name="vendorName" value={fd.vendorName} onChange={handleChange} required />
            </TwoCol>
            <TwoCol>
              <Field label="Vendor Type" name="vendorTypeId" value={fd.vendorTypeId} onChange={handleChange} required as="select">
                <option value="" disabled hidden>Select Vendor Type</option>
                {vendorTypes.map(v => <option key={v.vendorTypeId} value={v.vendorTypeId}>{v.vendorTypeName}</option>)}
              </Field>
              <Field label="Contact Person" name="contactPerson" value={fd.contactPerson} onChange={handleChange} />
            </TwoCol>
            <TwoCol>
              <Field label="Mobile No" name="mobileNo" value={fd.mobileNo} onChange={handleChange} required maxLength={10} />
              <Field label="Alternate Mobile" name="alternateMobile" value={fd.alternateMobile} onChange={handleChange} maxLength={10} />
            </TwoCol>
            <Field label="Email ID" name="emailId" type="email" value={fd.emailId} onChange={handleChange} required />
          </>
        );
      case 2:
        return (
          <>
            <Field label="Address Line 1" name="addressLine1" value={fd.addressLine1} onChange={handleChange} required />
            <Field label="Address Line 2" name="addressLine2" value={fd.addressLine2} onChange={handleChange} />
            <TwoCol>
              <Field label="Country" name="country" value={fd.country} onChange={handleChange} required as="select">
                <option value="" disabled hidden>Select Country</option>
                {countries.map(c => <option key={c.countryId} value={c.countryName}>{c.countryName}</option>)}
              </Field>
              <Field label="State" name="state" value={fd.state} onChange={handleChange} required={!!fd.country} as="select" disabled={!fd.country}>
                <option value="" disabled hidden>Select State</option>
                {states.map(s => <option key={s.stateId} value={s.stateName}>{s.stateName}</option>)}
              </Field>
            </TwoCol>
            <TwoCol>
              <Field label="City" name="city" value={fd.city} onChange={handleChange} required />
              <Field label="Pincode" name="pincode" value={fd.pincode} onChange={handleChange} required maxLength={6} />
            </TwoCol>
          </>
        );
      case 3:
        return (
          <>
            <Field label="GST Number"      name="gstNo"          value={fd.gstNo}          onChange={handleChange} required maxLength={15} />
            <Field label="PAN Number"      name="panNo"          value={fd.panNo}          onChange={handleChange} required maxLength={10} />
            <Field label="Registration No" name="registrationNo" value={fd.registrationNo} onChange={handleChange} required />
            <Field label="License Valid Till" name="licenseValidTill" type="date" value={fd.licenseValidTill} onChange={handleChange} required />
          </>
        );
      case 4:
        return (
          <>
            <Field label="Bank Name"             name="bankName"          value={fd.bankName}          onChange={handleChange} required />
            <Field label="Account Number"        name="accountNo"         value={fd.accountNo}         onChange={handleChange} required maxLength={20} />
            <Field label="Confirm Account Number" name="confirmAccountNo" value={fd.confirmAccountNo}  onChange={handleChange} required maxLength={20} />
            <Field label="IFSC Code"             name="ifscCode"          value={fd.ifscCode}          onChange={handleChange} required />
            <Field label="Bank Address"          name="bankAddress"       value={fd.bankAddress}       onChange={handleChange} />
          </>
        );
      case 5:
        return (
          <>
            <Toggle label="Is Preferred"   name="isPreferred"   checked={fd.isPreferred}   onChange={handleChange} />
            <Toggle label="Is Blacklisted" name="isBlacklisted" checked={fd.isBlacklisted} onChange={handleChange} />
            <Field label="Blacklist Reason" name="blacklistReason" value={fd.blacklistReason} onChange={handleChange}
              required={fd.isBlacklisted} disabled={!fd.isBlacklisted} />
          </>
        );
      default: return null;
    }
  };

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div className="lr-page">
      <div className="lr-scene">
        <div className={`lr-flipper${isFlipped ? " flipped" : ""}`}>

          {/* ══════════ FRONT — LOGIN ══════════ */}
          <div className="lr-face front">

            {/* Left: Login form */}
            <div className="lr-form-side">
              <div className="lr-brand">
                <span className="lr-brand-icon"><i className="bi bi-grid-fill" /></span>
                <span className="lr-brand-text">E-Procurement</span>
              </div>

              <h1 className="lr-h1">Welcome back</h1>
              <p className="lr-subtitle">Sign in to your account to continue</p>

              <div className="field-wrap">
                <input type="text" name="username" id="lemail"
                  value={loginData.username} onChange={handleLoginChange}
                  placeholder=" " autoComplete="off" />
                <label htmlFor="lemail">Email address <span style={{ color: "#dc2626" }}>*</span></label>
              </div>

              <PasswordField label="Password" name="password" id="lpass"
                value={loginData.password} onChange={handleLoginChange} />

              {loginError && <p className="lr-err">{loginError}</p>}

              <button className="lr-btn-main" onClick={doLogin} disabled={loading}>
                {loading ? "Signing in…" : "Login →"}
              </button>

              <p className="lr-link-txt">
                New vendor? <span onClick={flip}>Register here</span>
              </p>
            </div>

            {/* Right: Info panel */}
            <div className="lr-info-side">
              <div className="lr-info-inner">
                <div className="lr-info-badge">
                  <i className="bi bi-shield-check" /> Secure Portal
                </div>
                <p className="lr-info-h">New to the Portal?</p>
                <p className="lr-info-p">
                  Register as a vendor to access tenders, submit bids, and track your procurement journey — all in one place.
                </p>
                <button className="lr-btn-ghost" onClick={flip}>
                  Register as Vendor →
                </button>
                <div className="lr-info-stats">
                  <div className="lr-info-stat"><span>560+</span>Vendors</div>
                  <div className="lr-info-stat-divider" />
                  <div className="lr-info-stat"><span>128</span>Tenders</div>
                  <div className="lr-info-stat-divider" />
                  <div className="lr-info-stat"><span>87</span>Awarded</div>
                </div>
              </div>
            </div>

          </div>

          {/* ══════════ BACK — REGISTER ══════════ */}
          <div className="lr-face back">

            {/* Left: Info panel */}
            <div className="lr-info-side back-info">
              <div className="lr-info-inner">
                <div className="lr-info-badge">
                  <i className="bi bi-person-check" /> Vendor Portal
                </div>
                <p className="lr-info-h">Already Registered?</p>
                <p className="lr-info-p">
                  Login to manage your tenders, track bids, update your KYC documents and stay compliant.
                </p>
                <button className="lr-btn-ghost" onClick={flip}>
                  ← Back to Login
                </button>
                <div className="lr-info-steps">
                  <div className="lr-info-step"><span className="lr-step-num">1</span> Fill your details</div>
                  <div className="lr-info-step"><span className="lr-step-num">2</span> Verify & submit</div>
                  <div className="lr-info-step"><span className="lr-step-num">3</span> Start bidding</div>
                </div>
              </div>
            </div>

            {/* Right: Register form */}
            <div className="lr-form-side reg">
              <div className="lr-brand">
                <span className="lr-brand-icon"><i className="bi bi-grid-fill" /></span>
                <span className="lr-brand-text">E-Procurement</span>
              </div>

              {submitted ? (
                <div className="lr-success-wrap">
                  <div className="lr-success-icon">✅</div>
                  <h2 className="lr-h1" style={{ fontSize: 20 }}>Registration Complete!</h2>
                  <p style={{ color: "#64748b", fontSize: 13, margin: "8px 0 20px", lineHeight: 1.6 }}>
                    Your account has been created successfully.<br />
                    <strong>Username:</strong> Your Email ID<br />
                    <strong>Password:</strong> Your Mobile Number (first login)
                  </p>
                  <p style={{ color: "#2563eb", fontSize: 12, marginBottom: 16 }}>
                    Redirecting to login in 3 seconds…
                  </p>
                  <button className="lr-btn-main" onClick={flip}>Go to Login →</button>
                </div>
              ) : (
                <>
                  <div className="lr-reg-h">Vendor Registration</div>
                  <p className="lr-reg-sub">Step {step} of {totalSteps} — {stepNames[step - 1]} Details</p>

                  {/* Progress */}
                  <div className="lr-prog">
                    {stepNames.map((s, i) => {
                      const done   = step > i + 1;
                      const active = step === i + 1;
                      return (
                        <div key={i} className="lr-prog-step">
                          <div className={`lr-circ${done ? " done" : active ? " active" : ""}`}>
                            {done ? "✓" : i + 1}
                          </div>
                          <p className={`lr-prog-label${done || active ? " active" : ""}`}>{s}</p>
                        </div>
                      );
                    })}
                    <div className="lr-prog-line">
                      <div className="lr-prog-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="lr-step-hd">{stepNames[step - 1]} Details</div>
                  <div className="lr-step-body">{stepBody()}</div>

                  {regError   && <p className="lr-err">{regError}</p>}
                  {successMsg && <p className="lr-success">{successMsg}</p>}

                  <div className="lr-btn-row">
                    {step > 1 && <button className="lr-btn-prev" onClick={prev}>← Back</button>}
                    {step < totalSteps && <button className="lr-btn-next" onClick={next}>Next →</button>}
                    {step === totalSteps && (
                      <div className="lr-corner-btns">
                        <button className="lr-btn-cancel" onClick={flip}>Cancel</button>
                        <button className="lr-btn-submit" onClick={submitForm} disabled={loading}>
                          {loading ? "Submitting…" : "Submit ✓"}
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="lr-link-txt">
                    Already have an account? <span onClick={flip}>Login here</span>
                  </p>
                </>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;