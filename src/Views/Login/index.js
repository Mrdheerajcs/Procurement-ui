import React, { useState, useEffect } from "react";
import "./login.css";
import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router-dom";
import apiClient from "../../auth/apiClient";
import eProcLogo from "../../assets/images/e-proc-logo.png";


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


const Field = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  disabled,
  maxLength,
  as = "input",
  children,
}) => (
  <div className="field-wrap">
    {as === "select" ? (
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        // ✅ KEY FIX: add "has-value" class when a real option is selected
        className={value ? "has-value" : ""}
      >
        {children}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder=" "
        autoComplete="off"
        maxLength={maxLength}
      />
    )}
    <label htmlFor={name}>
      {label}
      {required && <span style={{ color: "#e74c3c" }}> *</span>}
    </label>
  </div>
);

const PasswordField = ({ label, name, id, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="field-wrap has-icon">
      <input
        type={show ? "text" : "password"}
        name={name}
        id={id || name}
        value={value}
        onChange={onChange}
        placeholder=" "
        autoComplete="off"
      />
      <label htmlFor={id || name}>{label}</label>
      <button
        type="button"
        className="pwd-toggle"
        onClick={() => setShow((v) => !v)}
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

const Toggle = ({ label, name, checked, onChange }) => (
  <div className="lr-toggle-row">
    <span className="lr-toggle-label">{label}</span>
    <label className="lr-switch">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{ display: "none" }}
      />
      <span className={`lr-slider${checked ? " on" : ""}`}>
        <span className={`lr-slider-thumb${checked ? " on" : ""}`} />
      </span>
    </label>
    <span className={`lr-toggle-status${checked ? " yes" : " no"}`}>
      {checked ? "Yes" : "No"}
    </span>
  </div>
);

const TwoCol = ({ children }) => <div className="lr-two-col">{children}</div>;



const Login = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [regError, setRegError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [vendorTypes, setVendorTypes] = useState([]);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
const [successMsg, setSuccessMsg] = useState("");

  const [fd, setFd] = useState({
    vendorCode: "",
    vendorName: "",
    contactPerson: "",
    mobileNo: "",
    alternateMobile: "",
    emailId: "",
    vendorTypeId: "",

    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",

    gstNo: "",
    panNo: "",
    registrationNo: "",

    licenseValidTill: "",

    bankName: "",
    accountNo: "",
    confirmAccountNo: "",
    ifscCode: "",
    bankAddress: "",

    isPreferred: false,
    isBlacklisted: false,
    blacklistReason: "",
  });

  useEffect(() => {
    fetchCountries();
    fetchVendorTypes();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await apiClient.get("/api/master/getAllcountry");

      if (res.status === "SUCCESS") {
        setCountries(res.data); // 👈 important
      }
    } catch (err) {
      console.log(err);
      setLoginError(err.message || "Something went wrong");
    }
  };

  const fetchStates = async (countryId) => {
    try {
      const res = await apiClient.get(`/api/master/getStateId/${countryId}`);
      setStates(res); // 👈 your API directly returns list
    } catch (err) {
      console.log(err);
      setLoginError(err.message || "Something went wrong");
    }
  };

  const fetchVendorTypes = async () => {
    try {
      const res = await apiClient.get("/api/master/getAllVendorType");

      if (res.status === "SUCCESS") {
        setVendorTypes(res.data); // 👈 important
      }
    } catch (err) {
      console.log(err);
      setLoginError(err.message || "Something went wrong");
    }
  };

  const totalSteps = 5;
  const stepNames = ["Basic", "Address", "Legal", "Bank", "Pref"];
  const progress = ((step - 1) / (totalSteps - 1)) * 100;

  const { login } = useAuth();
  const navigate = useNavigate();


  /* ── HANDLERS ── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    setFd((prev) => {
      // ✅ Blacklist logic
      if (name === "isBlacklisted" && !checked) {
        return {
          ...prev,
          isBlacklisted: false,
          blacklistReason: "",
        };
      }

      // Start building updated state
      let updatedFd = { ...prev, [name]: val };

      // 🌍 Country/State dynamic logic
      if (name === "country") {
        const selectedCountry = countries.find(
          (c) => c.countryName === value
        );

        if (selectedCountry) {
          fetchStates(selectedCountry.countryId); // 🔥 call API
        } else {
          setStates([]);
        }

        updatedFd.state = ""; // reset state
      }

      // 🔒 Validations
      if (name === "mobileNo" || name === "alternateMobile") {
        if (!/^\d*$/.test(val) || val.length > 10) return prev;
      }

      if (name === "pincode") {
        if (!/^\d*$/.test(val) || val.length > 6) return prev;
      }

      if (name === "accountNo" || name === "confirmAccountNo") {
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

      // 🔴 Account number match validation
      if (updatedFd.accountNo && updatedFd.confirmAccountNo) {
        if (updatedFd.accountNo !== updatedFd.confirmAccountNo) {
          setRegError("Account number and Confirm Account number do not match");
        } else {
          setRegError(""); // clear error if they match
        }
      } else {
        setRegError(""); // clear error if one field is empty
      }

      return updatedFd;
    });
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };
  const flip = () => {
    setIsFlipped((v) => !v);
    setStep(1);
    setRegError("");
    setLoginError("");
    setSubmitted(false);
  };
  const next = () => step < totalSteps && setStep((s) => s + 1);
  const prev = () => step > 1 && setStep((s) => s - 1);

  /* ── LOGIN API ── */
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
          token: loginInfo.token,
          tokenType: loginInfo.tokenType,
          expiresAt: Date.now() + loginInfo.expiresIn,
          username: loginInfo.username,
          roles: loginInfo.roles,
          userId: loginInfo.userId,
          email: loginInfo.email,
          isPasswordChanged: loginInfo.isPasswordChanged,
        };

        login(userData);

        // 🔥 NEW LOGIC
        if (!loginInfo.isPasswordChanged) {
          navigate("/force-change-password");
        } else {
          navigate("/dashboard");
        }
      } else {
        setLoginError(res.message || "Invalid credentials");
      }
    } catch (err) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  /* ── REGISTER API ── */
const submitForm = async () => {
  setRegError("");
  setSuccessMsg("");
  setLoading(true);

  const payload = {
    ...fd,
    isPreferred: fd.isPreferred ? "Y" : "N",
    isBlacklisted: fd.isBlacklisted ? "Y" : "N",
  };

  try {
    const res = await apiClient.post("/api/vendors/registration", payload);

    if (res.status === "SUCCESS") {
      setSuccessMsg(res.message || "Vendor registered successfully"); 
      setSubmitted(true);

      setTimeout(() => {
        flip();
      }, 3000);
    } else {
      setRegError(res.message || "Registration failed.");
    }
  } catch {
    setRegError("Server error. Please try again.");
  } finally {
    setLoading(false);
  }
};

  /* ── STEP BODY ── */
  const stepBody = () => {
    switch (step) {
      case 1:
        return (
          <>
            <TwoCol>
              <Field label="vendor Code" name="vendorCode" value={fd.vendorCode} onChange={handleChange} required />
              <Field label="vendor Name" name="vendorName" value={fd.vendorName} onChange={handleChange} required />
            </TwoCol>

            <TwoCol>
              <Field
                label="Vendor Type"
                name="vendorTypeId"
                value={fd.vendorTypeId}
                onChange={handleChange}
                required
                as="select"
              >
                <option value="" disabled hidden>Select Vendor Type</option>
                {vendorTypes.map((v) => (
                  <option key={v.vendorTypeId} value={v.vendorTypeId}>
                    {v.vendorTypeName}
                  </option>
                ))}
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
              <Field
                label="Country"
                name="country"
                value={fd.country}
                onChange={handleChange}
                required
                as="select"
              >
                <option value="" disabled hidden>Select Country</option>
                {countries.map((c) => (
                  <option key={c.countryId} value={c.countryName}>
                    {c.countryName}
                  </option>
                ))}
              </Field>

              <Field
                label="State"
                name="state"
                value={fd.state}
                onChange={handleChange}
                required={!!fd.country}
                as="select"
                disabled={!fd.country}
              >
                <option value="" disabled hidden>Select State</option>
                {states.map((s) => (
                  <option key={s.stateId} value={s.stateName}>
                    {s.stateName}
                  </option>
                ))}
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
            <Field label="GST Number" name="gstNo" value={fd.gstNo} onChange={handleChange} required maxLength={15} />
            <Field label="PAN Number" name="panNo" value={fd.panNo} onChange={handleChange} required maxLength={10} />
            <Field label="Registration No" name="registrationNo" value={fd.registrationNo} onChange={handleChange} required />

            <Field
              label="License Valid Till"
              name="licenseValidTill"
              type="date"
              value={fd.licenseValidTill}
              onChange={handleChange}
              required
            />
          </>
        );
      case 4:
        return (
          <>
            <Field label="Bank Name" name="bankName" value={fd.bankName} onChange={handleChange} required />
            <Field
              label="Account Number"
              name="accountNo"
              value={fd.accountNo}
              onChange={handleChange}
              required
              maxLength={20}
            />

            <Field
              label="Confirm Account Number"
              name="confirmAccountNo"
              value={fd.confirmAccountNo}
              onChange={handleChange}
              required
              maxLength={20}
            />
            <Field label="IFSC Code" name="ifscCode" value={fd.ifscCode} onChange={handleChange} required />
            <Field label="Bank Address" name="bankAddress" value={fd.bankAddress} onChange={handleChange} />
          </>
        );
      case 5:
        return (
          <>
            <Toggle
              label="Is Preferred"
              name="isPreferred"
              checked={fd.isPreferred}
              onChange={handleChange}
            />

            <Toggle
              label="Is Blacklisted"
              name="isBlacklisted"
              checked={fd.isBlacklisted}
              onChange={handleChange}
            />

            <Field
              label="Blacklist Reason"
              name="blacklistReason"
              value={fd.blacklistReason}
              onChange={handleChange}
              required={fd.isBlacklisted}
              disabled={!fd.isBlacklisted}
            />
          </>
        );
      default: return null;
    }
  };

  /* ── RENDER ── */
  return (
    <div className="lp-page">

      {/* ── TOP NAV ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <img src={eProcLogo} alt="E-Procurement" className="lp-logo-img" />
          </div>
          <div className="lp-nav-links">
            <a href="#about">About</a>
            <a href="/tenders">Tenders</a>
            <a href="#help">Help</a>
            <a href="#contact">Contact</a>
          </div>
          <button className="lp-nav-cta" onClick={() => { if (!isFlipped) flip(); }}>
            Vendor Registration
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <main className="lp-hero">

        {/* Left: marketing copy */}
        <div className="lp-hero-left">
          <span className="lp-hero-tag">
            <i className="bi bi-shield-check-fill" /> Trusted Government Portal
          </span>
          <h1 className="lp-hero-h1">
            Streamline Your<br />
            <span className="lp-hero-accent">Procurement</span> Process
          </h1>
          <p className="lp-hero-p">
            A centralized digital platform to manage tenders, MPRs, bids,
            and purchase orders — transparent, fast, and compliant.
          </p>

          <div className="lp-stats">
            <div className="lp-stat">
              <span className="lp-stat-num">1.2K+</span>
              <span className="lp-stat-lbl">Tenders Published</span>
            </div>
            <div className="lp-stat-sep" />
            <div className="lp-stat">
              <span className="lp-stat-num">500+</span>
              <span className="lp-stat-lbl">Registered Vendors</span>
            </div>
            <div className="lp-stat-sep" />
            <div className="lp-stat">
              <span className="lp-stat-num">&#8377;50Cr+</span>
              <span className="lp-stat-lbl">Orders Processed</span>
            </div>
          </div>

          <div className="lp-feature-chips">
            <span className="lp-chip"><i className="bi bi-lightning-charge-fill" /> Fast Processing</span>
            <span className="lp-chip"><i className="bi bi-lock-fill" /> Secure &amp; Compliant</span>
            <span className="lp-chip"><i className="bi bi-graph-up-arrow" /> Real-time Tracking</span>
            <span className="lp-chip"><i className="bi bi-people-fill" /> Multi-department</span>
          </div>
        </div>

        {/* Right: auth card */}
        <div className="lp-hero-right">
          <div className="lp-card">

            {!isFlipped ? (
              /* ── LOGIN PANEL ── */
              <div className="lp-panel" key="login">
                {/* <div className="lp-brand-row">
                  <img src={eProcLogo} alt="E-Procurement" className="lp-brand-logo" />
                </div> */}
                <h2 className="lp-card-h">Welcome back</h2>
                <p className="lp-card-sub">Sign in to your account to continue</p>

                <div className="field-wrap">
                  <input type="text" name="username" id="lemail"
                    value={loginData.username} onChange={handleLoginChange}
                    placeholder=" " autoComplete="off" />
                  <label htmlFor="lemail">Email address</label>
                </div>

                <PasswordField label="Password" name="password" id="lpass"
                  value={loginData.password} onChange={handleLoginChange} />

                {loginError && <p className="lr-err">{loginError}</p>}

                <button className="lp-btn-primary" onClick={doLogin} disabled={loading}>
                  {loading ? "Signing in…" : "Sign In →"}
                </button>

                <p className="lp-switch-txt">
                  Don&apos;t have an account?{" "}
                  <span onClick={flip}>Register as Vendor</span>
                </p>
              </div>

            ) : submitted ? (
              /* ── SUCCESS ── */
              <div className="lp-panel lp-success-panel" key="success">
                <div className="lp-success-icon">✅</div>
                <h2 className="lp-card-h" style={{ textAlign: "center" }}>Registration Complete!</h2>
                <p style={{ textAlign: "center", color: "#64748b", fontSize: 13, marginTop: 8 }}>
                  Your account has been created.<br />
                  <b>Username:</b> Your Email ID<br />
                  <b>Password:</b> Your Mobile Number
                </p>
                <button className="lp-btn-primary" onClick={flip} style={{ marginTop: 20 }}>
                  Go to Login
                </button>
              </div>

            ) : (
              /* ── REGISTER PANEL ── */
              <div className="lp-panel lp-reg-panel" key="register">
                <div className="lp-brand-row">
                  <img src={eProcLogo} alt="E-Procurement" className="lp-brand-logo" />
                </div>
                <h2 className="lp-card-h">Vendor Registration</h2>
                <p className="lp-card-sub">Fill in your details to get started</p>

                <div className="lr-prog">
                  {stepNames.map((s, i) => {
                    const done = step > i + 1;
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
                        {loading ? "Submitting…" : "Submit"}
                      </button>
                    </div>
                  )}
                </div>

                <p className="lp-switch-txt">
                  Already have an account? <span onClick={flip}>Login</span>
                </p>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ── FEATURE STRIP ── */}
      <section className="lp-strip">
        <div className="lp-strip-inner">
          {[
            { icon: "bi-file-earmark-text-fill", title: "Tender Management",  desc: "Publish and track tenders across all departments"  },
            { icon: "bi-clipboard2-check-fill",  title: "MPR Workflow",        desc: "Streamlined material purchase request approvals"  },
            { icon: "bi-people-fill",            title: "Vendor Portal",       desc: "Onboard and manage approved vendor relationships" },
            { icon: "bi-graph-up-arrow",         title: "Live Analytics",      desc: "Real-time procurement dashboards and reporting"  },
          ].map((f, i) => (
            <div key={i} className="lp-strip-card">
              <div className="lp-strip-icon"><i className={`bi ${f.icon}`} /></div>
              <div className="lp-strip-title">{f.title}</div>
              <div className="lp-strip-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <span>© 2026 E-Procurement Portal. All rights reserved.</span>
          <div className="lp-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Help Desk</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Login;