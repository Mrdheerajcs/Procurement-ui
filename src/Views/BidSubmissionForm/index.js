import React, { useState, useMemo } from "react";

const initialBidsList = [
  {
    id: 1,
    tenderId: "TND-2026-001",
    name: "Road Construction Project",
    department: "PWD",
    project: "Highway Expansion",
    date: "2026-04-01",
    status: "Open",
  },
  {
    id: 2,
    tenderId: "TND-2026-002",
    name: "Bridge Project",
    department: "Infrastructure",
    project: "River Bridge",
    date: "2026-03-28",
    status: "Open",
  },
  {
    id: 3,
    tenderId: "TND-2026-003",
    name: "Building Renovation",
    department: "CPWD",
    project: "Govt Office Renovation",
    date: "2026-03-20",
    status: "Closed",
  },
];

export default function BidSubmissionFlow() {
  const [bidsList, setBidsList] = useState(initialBidsList);
  const [selectedBid, setSelectedBid] = useState(null);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("technical");
  const [msme, setMsme] = useState(false);
  const [emdExemption, setEmdExemption] = useState(false);
  const [formData, setFormData] = useState({});
  const [previewStep, setPreviewStep] = useState(null);
  
  // Field-level validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // ✅ SHOW ONLY OPEN TENDERS
  const filteredList = useMemo(() => {
    return bidsList
      .filter((b) => b.status === "Open")
      .filter((b) =>
        Object.values(b).join(" ").toLowerCase().includes(search.toLowerCase())
      );
  }, [search, bidsList]);

  // Level configuration for each field
  const fieldLevels = {
    // Technical Section - Level 1 (Critical)
    companyName: { level: 1, required: true, pattern: /^[a-zA-Z\s&.,-]{3,100}$/, message: "Valid company name required (3-100 chars)" },
    gstNumber: { level: 1, required: true, pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/, message: "Valid GST number required (15 chars)" },
    panNumber: { level: 1, required: true, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: "Valid PAN number required (10 chars)" },
    
    // Technical Section - Level 2 (High Importance)
    makeIndiaClass: { level: 2, required: true, pattern: /^(Class\s*[1-2]|[1-2])$/i, message: "Make in India Class 1 or 2 required" },
    bidderTurnover: { level: 2, required: true, pattern: /^\d+(\.\d{1,2})?$/, message: "Valid turnover amount required", minValue: 0 },
    oemTurnover: { level: 2, required: true, pattern: /^\d+(\.\d{1,2})?$/, message: "Valid OEM turnover required", minValue: 0 },
    
    // Technical Section - Level 3 (Standard)
    oemName: { level: 3, required: true, pattern: /^[a-zA-Z\s&.,-]{2,100}$/, message: "Valid OEM name required (2-100 chars)" },
    authorizationDetails: { level: 3, required: true, pattern: /^[a-zA-Z0-9\s,.-]{10,500}$/, message: "Valid authorization details required (10-500 chars)" },
    msmeNumber: { level: 3, required: false, pattern: /^[A-Z0-9-]{6,20}$/, message: "Valid MSME number required" },
    
    // Commercial Section - Level 1 (Critical)
    totalBidAmount: { level: 1, required: true, pattern: /^\d+(\.\d{1,2})?$/, message: "Valid bid amount required", minValue: 0 },
    bankName: { level: 1, required: true, pattern: /^[a-zA-Z\s]{3,100}$/, message: "Valid bank name required (3-100 chars)" },
    accountNumber: { level: 1, required: true, pattern: /^\d{9,18}$/, message: "Valid account number required (9-18 digits)" },
    ifscCode: { level: 1, required: true, pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: "Valid IFSC code required (11 chars)" },
    
    // Commercial Section - Level 2 (High Importance)
    gstPercent: { level: 2, required: true, pattern: /^\d+(\.\d{1,2})?$/, message: "Valid GST percentage required", minValue: 0, maxValue: 100 },
    totalCost: { level: 2, required: true, pattern: /^\d+(\.\d{1,2})?$/, message: "Valid total cost required", minValue: 0 },
    
    // Commercial Section - Level 3 (Standard)
    emdNumber: { level: 3, required: false, pattern: /^[A-Z0-9-]{6,30}$/, message: "Valid EMD number required" },
    emdValue: { level: 3, required: false, pattern: /^\d+(\.\d{1,2})?$/, message: "Valid EMD value required", minValue: 0 },
    emdExemptionDetails: { level: 3, required: false, pattern: /^[a-zA-Z0-9\s,.-]{10,200}$/, message: "Valid exemption details required (10-200 chars)" },
  };

  const handleParticipate = (bid) => {
    setSelectedBid(bid);
    setTab("technical");
    setFormData({});
    setFieldErrors({});
    setTouchedFields({});
    setMsme(false);
    setEmdExemption(false);
  };

  const handleBackToList = () => {
    setSelectedBid(null);
    setPreviewStep(null);
    setFormData({});
    setTab("technical");
    setFieldErrors({});
    setTouchedFields({});
    setMsme(false);
    setEmdExemption(false);
  };

  // Validation function for a single field
  const validateField = (name, value) => {
    const fieldConfig = fieldLevels[name];
    if (!fieldConfig) return "";
    
    if (fieldConfig.required && (!value || value.toString().trim() === "")) {
      return `${name.replace(/([A-Z])/g, ' $1').trim()} is required`;
    }
    
    if (value && value.toString().trim() !== "") {
      if (fieldConfig.pattern && !fieldConfig.pattern.test(value.toString().trim())) {
        return fieldConfig.message || `Invalid ${name} format`;
      }
      
      if (fieldConfig.minValue !== undefined && parseFloat(value) < fieldConfig.minValue) {
        return `${name} must be at least ${fieldConfig.minValue}`;
      }
      
      if (fieldConfig.maxValue !== undefined && parseFloat(value) > fieldConfig.maxValue) {
        return `${name} must not exceed ${fieldConfig.maxValue}`;
      }
    }
    
    return "";
  };

  // Handle field change with validation
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue,
    });
    
    // Validate field
    const error = validateField(name, newValue);
    setFieldErrors({
      ...fieldErrors,
      [name]: error,
    });
  };

  // Handle field blur for touch tracking
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields({
      ...touchedFields,
      [name]: true,
    });
    
    // Validate on blur
    const error = validateField(name, formData[name]);
    setFieldErrors({
      ...fieldErrors,
      [name]: error,
    });
  };

  // Get fields by level for a section
  const getFieldsByLevel = (section, level) => {
    const technicalFields = ["companyName", "gstNumber", "panNumber", "makeIndiaClass", "bidderTurnover", "oemTurnover", "oemName", "authorizationDetails", "msmeNumber"];
    const commercialFields = ["totalBidAmount", "gstPercent", "totalCost", "bankName", "accountNumber", "ifscCode", "emdNumber", "emdValue", "emdExemptionDetails"];
    
    const fields = section === "technical" ? technicalFields : commercialFields;
    
    return fields.filter(field => {
      const config = fieldLevels[field];
      if (section === "technical" && field === "msmeNumber" && !msme) return false;
      if (section === "commercial" && (field === "emdNumber" || field === "emdValue") && emdExemption) return false;
      if (section === "commercial" && field === "emdExemptionDetails" && !emdExemption) return false;
      return config && config.level === level;
    });
  };

  const isTechnicalValid = () => {
    const required = [
      "companyName",
      "gstNumber",
      "panNumber",
      "makeIndiaClass",
      "bidderTurnover",
      "oemTurnover",
      "oemName",
      "authorizationDetails",
    ];

    if (msme) required.push("msmeNumber");
    
    // Check all required fields have values and no errors
    const allFieldsValid = required.every((f) => {
      const hasValue = formData[f]?.trim();
      const noError = !validateField(f, formData[f]);
      return hasValue && noError;
    });
    
    return allFieldsValid;
  };

  const isCommercialValid = () => {
    const required = [
      "totalBidAmount",
      "gstPercent",
      "totalCost",
      "bankName",
      "accountNumber",
      "ifscCode",
    ];

    if (!emdExemption) {
      required.push("emdNumber", "emdValue");
    } else {
      required.push("emdExemptionDetails");
    }
    
    // Check all required fields have values and no errors
    const allFieldsValid = required.every((f) => {
      const hasValue = formData[f]?.trim();
      const noError = !validateField(f, formData[f]);
      return hasValue && noError;
    });
    
    return allFieldsValid;
  };

  // Get section completion percentage
  const getSectionCompletion = (section) => {
    let totalFields = 0;
    let completedFields = 0;
    
    if (section === "technical") {
      const fields = ["companyName", "gstNumber", "panNumber", "makeIndiaClass", "bidderTurnover", "oemTurnover", "oemName", "authorizationDetails"];
      if (msme) fields.push("msmeNumber");
      
      totalFields = fields.length;
      completedFields = fields.filter(f => formData[f]?.trim() && !validateField(f, formData[f])).length;
    } else {
      const fields = ["totalBidAmount", "gstPercent", "totalCost", "bankName", "accountNumber", "ifscCode"];
      if (!emdExemption) fields.push("emdNumber", "emdValue");
      else fields.push("emdExemptionDetails");
      
      totalFields = fields.length;
      completedFields = fields.filter(f => formData[f]?.trim() && !validateField(f, formData[f])).length;
    }
    
    return totalFields === 0 ? 0 : Math.round((completedFields / totalFields) * 100);
  };

  const handleSubmit = () => {
    // Final validation before submit
    if (!isTechnicalValid() || !isCommercialValid()) {
      alert("Please fix all validation errors before submitting");
      return;
    }
    
    alert("Bid submitted successfully!");
    setBidsList((prev) => prev.filter((b) => b.id !== selectedBid.id));
    handleBackToList();
  };

  const handlePreview = (step) => setPreviewStep(step);

  // Render field with level indicator
  const renderField = (name, label, type = "text", placeholder = "", required = true, level = 3) => {
    const value = formData[name] || "";
    const error = fieldErrors[name];
    const isTouched = touchedFields[name];
    const showError = isTouched && error;
    
    const levelColors = {
      1: "danger",
      2: "warning",
      3: "info"
    };
    
    return (
      <div className="mb-3">
        <label className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
          <span className={`badge bg-${levelColors[level]} ms-2`} style={{ fontSize: "10px" }}>
            Level {level}
          </span>
        </label>
        <input
          type={type}
          name={name}
          className={`form-control ${showError ? "is-invalid" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {showError && (
          <div className="invalid-feedback">{error}</div>
        )}
        {!showError && fieldLevels[name]?.message && value && (
          <small className="text-muted">{fieldLevels[name].message}</small>
        )}
      </div>
    );
  };

  // Render select field
  const renderSelectField = (name, label, options, required = true, level = 3) => {
    const value = formData[name] || "";
    const error = fieldErrors[name];
    const isTouched = touchedFields[name];
    const showError = isTouched && error;
    
    const levelColors = {
      1: "danger",
      2: "warning",
      3: "info"
    };
    
    return (
      <div className="mb-3">
        <label className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
          <span className={`badge bg-${levelColors[level]} ms-2`} style={{ fontSize: "10px" }}>
            Level {level}
          </span>
        </label>
        <select
          name={name}
          className={`form-select ${showError ? "is-invalid" : ""}`}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <option value="">Select {label}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {showError && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  };

  return (
    <div className="container-fluid">
      {/* ================= LIST VIEW ================= */}
      {!selectedBid && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h6 className="mb-0 fw-semibold">Available Tenders</h6>
            <div className="input-group" style={{ maxWidth: 300 }}>
              <span className="input-group-text bg-white">
                <i className="bi bi-search" />
              </span>
              <input
                className="form-control"
                placeholder="Search tender..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tender ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Project</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted">
                        No available tenders
                      </td>
                    </tr>
                  )}
                  {filteredList.map((bid) => (
                    <tr key={bid.id}>
                      <td className="fw-semibold text-primary">{bid.tenderId}</td>
                      <td>{bid.name}</td>
                      <td>{bid.department}</td>
                      <td>{bid.project}</td>
                      <td>{bid.date}</td>
                      <td><span className="badge bg-success">{bid.status}</span></td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-primary" onClick={() => handleParticipate(bid)}>
                          Participate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= FORM VIEW ================= */}
      {selectedBid && !previewStep && (
        <div>
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0 fw-semibold">{selectedBid.name} - Bid Submission</h5>
              <div className="mt-2">
                <span className="badge bg-danger me-1">Level 1: Critical</span>
                <span className="badge bg-warning me-1">Level 2: High Importance</span>
                <span className="badge bg-info">Level 3: Standard</span>
              </div>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleBackToList}>
              <i className="bi bi-arrow-left me-1" /> Back
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="card bg-light">
                <div className="card-body py-2">
                  <small className="text-muted">Technical Section Completion</small>
                  <div className="progress" style={{ height: "8px" }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${getSectionCompletion("technical")}%` }}
                    />
                  </div>
                  <small className="text-muted">{getSectionCompletion("technical")}% Complete</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card bg-light">
                <div className="card-body py-2">
                  <small className="text-muted">Commercial Section Completion</small>
                  <div className="progress" style={{ height: "8px" }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${getSectionCompletion("commercial")}%` }}
                    />
                  </div>
                  <small className="text-muted">{getSectionCompletion("commercial")}% Complete</small>
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button
                className={`nav-link ${tab === "technical" && "active"}`}
                onClick={() => setTab("technical")}
              >
                Technical {getSectionCompletion("technical") === 100 && "✓"}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${tab === "commercial" && "active"}`}
                disabled={!isTechnicalValid()}
                onClick={() => setTab("commercial")}
              >
                Commercial {getSectionCompletion("commercial") === 100 && "✓"}
              </button>
            </li>
          </ul>

          {/* ================= TECHNICAL ================= */}
          {tab === "technical" && (
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light">
                <h6 className="mb-0">Company & Technical Details</h6>
              </div>
              <div className="card-body">
                {/* Level 1 Fields - Critical */}
                <div className="border-start border-danger border-3 ps-3 mb-4">
                  <h6 className="text-danger mb-3">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    Level 1 - Critical Information
                  </h6>
                  <div className="row">
                    <div className="col-md-4">
                      {renderField("companyName", "Company Name", "text", "Enter company name", true, 1)}
                    </div>
                    <div className="col-md-4">
                      {renderField("gstNumber", "GST Number", "text", "e.g., 22AAAAA0000A1Z", true, 1)}
                    </div>
                    <div className="col-md-4">
                      {renderField("panNumber", "PAN Number", "text", "e.g., AAAAA0000A", true, 1)}
                    </div>
                  </div>
                </div>

                {/* Level 2 Fields - High Importance */}
                <div className="border-start border-warning border-3 ps-3 mb-4">
                  <h6 className="text-warning mb-3">
                    <i className="bi bi-star-fill me-1"></i>
                    Level 2 - High Importance
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      {renderSelectField("makeIndiaClass", "Make in India Class", [
                        { value: "Class 1", label: "Class 1 - 100% Local" },
                        { value: "Class 2", label: "Class 2 - 50% Local" }
                      ], true, 2)}
                    </div>
                    <div className="col-md-6">
                      {renderField("bidderTurnover", "Bidder Turnover (₹)", "number", "Enter turnover amount", true, 2)}
                    </div>
                    <div className="col-md-6">
                      {renderField("oemTurnover", "OEM Turnover (₹)", "number", "Enter OEM turnover", true, 2)}
                    </div>
                  </div>
                </div>

                {/* Level 3 Fields - Standard */}
                <div className="border-start border-info border-3 ps-3">
                  <h6 className="text-info mb-3">
                    <i className="bi bi-info-circle-fill me-1"></i>
                    Level 3 - Standard Information
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      {renderField("oemName", "OEM Name", "text", "Enter OEM name", true, 3)}
                    </div>
                    <div className="col-md-6">
                      {renderField("authorizationDetails", "Authorization Details", "text", "Enter authorization reference", true, 3)}
                    </div>
                  </div>

                  {/* MSME Section */}
                  <div className="card bg-light p-3 mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={msme}
                        onChange={() => {
                          setMsme(!msme);
                          if (!msme) setFormData({ ...formData, msmeNumber: "" });
                        }}
                      />
                      <label className="form-check-label fw-semibold">MSME Exemption</label>
                    </div>
                    {msme && (
                      <div className="mt-2">
                        {renderField("msmeNumber", "MSME Number", "text", "Enter MSME registration number", false, 3)}
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    className="btn btn-outline-info"
                    disabled={!isTechnicalValid()}
                    onClick={() => handlePreview("technical")}
                  >
                    Preview Technical
                  </button>
                  <button
                    className="btn btn-success"
                    disabled={!isTechnicalValid()}
                    onClick={() => setTab("commercial")}
                  >
                    Next → Commercial
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= COMMERCIAL ================= */}
          {tab === "commercial" && (
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light">
                <h6 className="mb-0">Commercial Details</h6>
              </div>
              <div className="card-body">
                {/* Level 1 Fields - Critical */}
                <div className="border-start border-danger border-3 ps-3 mb-4">
                  <h6 className="text-danger mb-3">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    Level 1 - Critical Information
                  </h6>
                  <div className="row">
                    <div className="col-md-4">
                      {renderField("totalBidAmount", "Total Bid Amount (₹)", "number", "Enter bid amount", true, 1)}
                    </div>
                    <div className="col-md-4">
                      {renderField("bankName", "Bank Name", "text", "Enter bank name", true, 1)}
                    </div>
                    <div className="col-md-4">
                      {renderField("accountNumber", "Account Number", "text", "Enter account number", true, 1)}
                    </div>
                    <div className="col-md-4">
                      {renderField("ifscCode", "IFSC Code", "text", "e.g., SBIN0001234", true, 1)}
                    </div>
                  </div>
                </div>

                {/* Level 2 Fields - High Importance */}
                <div className="border-start border-warning border-3 ps-3 mb-4">
                  <h6 className="text-warning mb-3">
                    <i className="bi bi-star-fill me-1"></i>
                    Level 2 - High Importance
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      {renderField("gstPercent", "GST Percentage (%)", "number", "Enter GST %", true, 2)}
                    </div>
                    <div className="col-md-6">
                      {renderField("totalCost", "Total Cost (Including GST) (₹)", "number", "Enter total cost", true, 2)}
                    </div>
                  </div>
                </div>

                {/* Level 3 Fields - Standard */}
                <div className="border-start border-info border-3 ps-3">
                  <h6 className="text-info mb-3">
                    <i className="bi bi-info-circle-fill me-1"></i>
                    Level 3 - Standard Information
                  </h6>
                  
                  {/* EMD Section */}
                  <div className="card bg-light p-3 mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={emdExemption}
                        onChange={() => setEmdExemption(!emdExemption)}
                      />
                      <label className="form-check-label fw-semibold">EMD Exemption</label>
                    </div>

                    {!emdExemption ? (
                      <div className="row mt-2">
                        <div className="col-md-6">
                          {renderField("emdNumber", "EMD Number", "text", "Enter EMD reference number", false, 3)}
                        </div>
                        <div className="col-md-6">
                          {renderField("emdValue", "EMD Value (₹)", "number", "Enter EMD amount", false, 3)}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        {renderField("emdExemptionDetails", "Exemption Details", "text", "Provide exemption justification", false, 3)}
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="d-flex justify-content-between mt-4">
                  <button className="btn btn-secondary" onClick={() => setTab("technical")}>
                    ← Back to Technical
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={!isCommercialValid()}
                    onClick={() => handlePreview("commercial")}
                  >
                    Preview Commercial
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= PREVIEW ================= */}
      {previewStep && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              {previewStep === "technical" ? "Technical Summary" : "Commercial Summary"}
            </h6>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPreviewStep(null)}>
              ← Back to Edit
            </button>
          </div>
          <div className="card-body">
            {previewStep === "technical" && (
              <>
                <h6 className="text-muted mb-3">Company Details</h6>
                <div className="row mb-3">
                  <div className="col-md-4"><b>Company Name:</b> {formData.companyName}</div>
                  <div className="col-md-4"><b>GST:</b> {formData.gstNumber}</div>
                  <div className="col-md-4"><b>PAN:</b> {formData.panNumber}</div>
                </div>
                <hr />
                <h6 className="text-muted mb-3">MSME</h6>
                <div className="mb-3">
                  <b>Status:</b> {msme ? "Exempted" : "Not Applicable"}
                  {msme && <div><b>MSME No:</b> {formData.msmeNumber}</div>}
                </div>
                <hr />
                <h6 className="text-muted mb-3">Technical Compliance</h6>
                <div className="row mb-3">
                  <div className="col-md-6"><b>Make in India Class:</b> {formData.makeIndiaClass}</div>
                  <div className="col-md-6"><b>Bidder Turnover:</b> ₹ {formData.bidderTurnover}</div>
                  <div className="col-md-6"><b>OEM Turnover:</b> ₹ {formData.oemTurnover}</div>
                  <div className="col-md-6"><b>OEM Name:</b> {formData.oemName}</div>
                  <div className="col-md-12"><b>Authorization:</b> {formData.authorizationDetails}</div>
                </div>
              </>
            )}

            {previewStep === "commercial" && (
              <>
                <h6 className="text-muted mb-3">Pricing Details</h6>
                <div className="row mb-3">
                  <div className="col-md-4"><b>Total Bid:</b> ₹ {formData.totalBidAmount}</div>
                  <div className="col-md-4"><b>GST %:</b> {formData.gstPercent}%</div>
                  <div className="col-md-4"><b>Total Cost:</b> ₹ {formData.totalCost}</div>
                </div>
                <hr />
                <h6 className="text-muted mb-3">EMD Details</h6>
                {!emdExemption ? (
                  <div className="row mb-3">
                    <div className="col-md-6"><b>EMD No:</b> {formData.emdNumber}</div>
                    <div className="col-md-6"><b>EMD Value:</b> ₹ {formData.emdValue}</div>
                  </div>
                ) : (
                  <div className="mb-3"><b>Exemption:</b> {formData.emdExemptionDetails}</div>
                )}
                <hr />
                <h6 className="text-muted mb-3">Bank Details</h6>
                <div className="row mb-3">
                  <div className="col-md-4"><b>Bank:</b> {formData.bankName}</div>
                  <div className="col-md-4"><b>Account:</b> {formData.accountNumber}</div>
                  <div className="col-md-4"><b>IFSC:</b> {formData.ifscCode}</div>
                </div>
              </>
            )}

            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-outline-secondary" onClick={() => setPreviewStep(null)}>
                ← Edit Again
              </button>
              {previewStep === "technical" && (
                <button className="btn btn-success" onClick={() => {
                  setPreviewStep(null);
                  setTab("commercial");
                }}>
                  Continue → Commercial
                </button>
              )}
              {previewStep === "commercial" && (
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Submit Bid
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}