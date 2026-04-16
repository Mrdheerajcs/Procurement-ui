import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../auth/apiClient";

const BidSubmission = () => {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [draftSaved, setDraftSaved] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
const [submissionStatus, setSubmissionStatus] = useState(null);

  const [formData, setFormData] = useState({
    companyName: "",
    gstNumber: "",
    panNumber: "",
    makeIndiaClass: "",
    bidderTurnover: "",
    oemTurnover: "",
    oemName: "",
    authorizationDetails: "",
    msmeNumber: "",
    isMsme: false,
    totalBidAmount: "",
    gstPercent: "",
    totalCost: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    emdNumber: "",
    emdValue: "",
    emdExemptionDetails: "",
  });

  const [technicalFiles, setTechnicalFiles] = useState([]);
  const [financialFiles, setFinancialFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  // Load tender details and draft on mount
  useEffect(() => {
    if (!tenderId || tenderId === "undefined") {
      setError("Invalid tender ID");
      return;
    }
    fetchTenderDetails();
    loadExistingDraft();
  }, [tenderId]);

  const fetchTenderDetails = async () => {
    try {
      const res = await apiClient.get(`/api/tenders/${tenderId}`);
      if (res.status === "SUCCESS") {
        setTender(res.data);
      }
    } catch (err) {
      setError("Failed to load tender details");
    }
  };

  const loadExistingDraft = async () => {
    try {
      const res = await apiClient.get(`/api/bids/technical/draft/${tenderId}`);
      if (res.status === "SUCCESS" && res.data) {
        setFormData(prev => ({
          ...prev,
          companyName: res.data.companyName || "",
          gstNumber: res.data.gstNumber || "",
          panNumber: res.data.panNumber || "",
          makeIndiaClass: res.data.makeIndiaClass || "",
          bidderTurnover: res.data.bidderTurnover || "",
          oemTurnover: res.data.oemTurnover || "",
          oemName: res.data.oemName || "",
          authorizationDetails: res.data.authorizationDetails || "",
          msmeNumber: res.data.msmeNumber || "",
          isMsme: res.data.isMsme || false,
        }));
        setDraftSaved(true);
      }
    } catch (err) {
      console.log("No draft found");
    }
  };

  const saveDraft = async () => {
    setLoading(true);
    const formDataToSend = new FormData();

    const technicalData = {
      tenderId: parseInt(tenderId),
      companyName: formData.companyName,
      gstNumber: formData.gstNumber,
      panNumber: formData.panNumber,
      makeIndiaClass: formData.makeIndiaClass,
      bidderTurnover: parseFloat(formData.bidderTurnover) || 0,
      oemTurnover: parseFloat(formData.oemTurnover) || 0,
      oemName: formData.oemName,
      authorizationDetails: formData.authorizationDetails,
      msmeNumber: formData.msmeNumber,
      isMsme: formData.isMsme,
    };

    formDataToSend.append("data", new Blob([JSON.stringify(technicalData)], { type: "application/json" }));
    technicalFiles.forEach(file => formDataToSend.append("files", file));

    try {
      const res = await apiClient.post("/api/bids/technical/draft", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.status === "SUCCESS") {
        setDraftSaved(true);
        alert("Draft saved successfully!");
      }
    } catch (err) {
      console.error("Error saving draft:", err);
      alert("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const validateTechnical = () => {
    const errors = {};
    if (!formData.companyName) errors.companyName = "Company name required";
    if (!formData.gstNumber) errors.gstNumber = "GST number required";
    if (!formData.panNumber) errors.panNumber = "PAN number required";
    if (!formData.makeIndiaClass) errors.makeIndiaClass = "Make in India class required";
    if (!formData.bidderTurnover) errors.bidderTurnover = "Bidder turnover required";
    if (!formData.oemTurnover) errors.oemTurnover = "OEM turnover required";
    if (!formData.oemName) errors.oemName = "OEM name required";
    if (!formData.authorizationDetails) errors.authorizationDetails = "Authorization details required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateFinancial = () => {
    const errors = {};
    if (!formData.totalBidAmount) errors.totalBidAmount = "Total bid amount required";
    if (!formData.gstPercent) errors.gstPercent = "GST percentage required";
    if (!formData.bankName) errors.bankName = "Bank name required";
    if (!formData.accountNumber) errors.accountNumber = "Account number required";
    if (!formData.ifscCode) errors.ifscCode = "IFSC code required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatNumber = (value) => {
    if (!value || value === "") return "";
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    return num.toLocaleString("en-IN");
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;

    // ✅ Allow empty string (for backspace)
    if (value === "") {
      setFormData(prev => ({ ...prev, [name]: "" }));

      // Recalculate total cost if needed
      if (name === "totalBidAmount" || name === "gstPercent") {
        const bidAmount = name === "totalBidAmount" ? 0 : parseFloat(formData.totalBidAmount) || 0;
        const gst = name === "gstPercent" ? 0 : parseFloat(formData.gstPercent) || 0;
        const total = bidAmount * (1 + gst / 100);
        setFormData(prev => ({ ...prev, totalCost: total.toFixed(2) }));
      }
      return;
    }

    // ✅ Allow only numbers and decimal point
    if (!/^\d*\.?\d*$/.test(value)) return;

    // Remove commas for storing
    const rawValue = value.replace(/,/g, "");

    setFormData(prev => ({ ...prev, [name]: rawValue }));

    // Auto-calculate total cost
    if (name === "totalBidAmount" || name === "gstPercent") {
      const bidAmount = name === "totalBidAmount"
        ? parseFloat(rawValue) || 0
        : parseFloat(formData.totalBidAmount) || 0;
      const gst = name === "gstPercent"
        ? parseFloat(rawValue) || 0
        : parseFloat(formData.gstPercent) || 0;
      const total = bidAmount * (1 + gst / 100);
      setFormData(prev => ({ ...prev, totalCost: total.toFixed(2) }));
    }
  };

  useEffect(() => {
    checkSubmissionStatus();
}, [tenderId]);

const checkSubmissionStatus = async () => {
    try {
        const res = await apiClient.get(`/api/bids/check-participation/${tenderId}`);
        if (res.status === "SUCCESS" && res.data) {
            setHasSubmitted(true);
            // Get detailed status
            const statusRes = await apiClient.get(`/api/bids/technical/draft/${tenderId}`);
            if (statusRes.status === "SUCCESS" && statusRes.data) {
                setSubmissionStatus(statusRes.data.evaluationStatus);
            }
        }
    } catch (err) {
        console.log("Not submitted yet");
    }
};

  const handleNext = async () => {
    if (currentStep === 1) {
      if (validateTechnical()) {
        // Save draft before moving to next step
        setLoading(true);
        const formDataToSend = new FormData();
        const technicalData = {
          tenderId: parseInt(tenderId),
          companyName: formData.companyName,
          gstNumber: formData.gstNumber,
          panNumber: formData.panNumber,
          makeIndiaClass: formData.makeIndiaClass,
          bidderTurnover: parseFloat(formData.bidderTurnover) || 0,
          oemTurnover: parseFloat(formData.oemTurnover) || 0,
          oemName: formData.oemName,
          authorizationDetails: formData.authorizationDetails,
          msmeNumber: formData.msmeNumber,
          isMsme: formData.isMsme,
        };
        formDataToSend.append("data", new Blob([JSON.stringify(technicalData)], { type: "application/json" }));
        technicalFiles.forEach(file => formDataToSend.append("files", file));

        try {
          await apiClient.post("/api/bids/technical/draft", formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          setCurrentStep(2);
        } catch (err) {
          alert("Failed to save draft. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    } else if (currentStep === 2 && validateFinancial()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => setCurrentStep(currentStep - 1);

  const handleSubmitFinal = async () => {
    if (!validateTechnical() || !validateFinancial()) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();

    const finalData = {
      tenderId: parseInt(tenderId),
      companyName: formData.companyName,
      gstNumber: formData.gstNumber,
      panNumber: formData.panNumber,
      makeIndiaClass: formData.makeIndiaClass,
      bidderTurnover: parseFloat(formData.bidderTurnover) || 0,
      oemTurnover: parseFloat(formData.oemTurnover) || 0,
      oemName: formData.oemName,
      authorizationDetails: formData.authorizationDetails,
      msmeNumber: formData.msmeNumber,
      isMsme: formData.isMsme,
      totalBidAmount: parseFloat(formData.totalBidAmount) || 0,
      gstPercent: parseFloat(formData.gstPercent) || 0,
      totalCost: parseFloat(formData.totalCost) || 0,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      emdNumber: formData.emdNumber,
      emdValue: parseFloat(formData.emdValue) || 0,
      emdExemptionDetails: formData.emdExemptionDetails,
    };

    formDataToSend.append("data", new Blob([JSON.stringify(finalData)], { type: "application/json" }));
    technicalFiles.forEach(file => formDataToSend.append("files", file));
    financialFiles.forEach(file => formDataToSend.append("files", file));

    try {
      const res = await apiClient.post("/api/bids/final", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.status === "SUCCESS") {
        setSuccess("Bid submitted successfully! Awaiting technical evaluation.");
        setTimeout(() => navigate("/vendor-contracts"), 3000);
      }
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    if (["totalBidAmount", "bidderTurnover", "oemTurnover", "emdValue"].includes(name)) {
      newValue = newValue.replace(/,/g, "");
    }
    setFormData(prev => ({ ...prev, [name]: newValue }));

    if (name === "totalBidAmount" || name === "gstPercent") {
      const bidAmount = name === "totalBidAmount"
        ? parseFloat(newValue) || 0
        : parseFloat(formData.totalBidAmount) || 0;
      const gst = name === "gstPercent"
        ? parseFloat(newValue) || 0
        : parseFloat(formData.gstPercent) || 0;
      const total = bidAmount * (1 + gst / 100);
      setFormData(prev => ({ ...prev, totalCost: total.toFixed(2) }));
    }
  };

  const getLevelBadge = (level) => {
    const colors = { 1: "danger", 2: "warning", 3: "info" };
    return <span className={`badge bg-${colors[level]} ms-2`} style={{ fontSize: "10px" }}>Level {level}</span>;
  };

  if (!tender) {
    return (
      <div className="container-fluid text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Bid Submission</h1>
        <p className="text-muted-soft">{tender.tenderNo} - {tender.tenderTitle}</p>
      </div>

      {/* Progress Steps */}
      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
          <div className="d-flex justify-content-between">
            <div className={`text-center ${currentStep >= 1 ? "text-primary fw-bold" : "text-muted"}`}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${currentStep >= 1 ? "bg-primary text-white" : "bg-secondary text-white"}`} style={{ width: 40, height: 40 }}>1</div>
              <small>Technical</small>
            </div>
            <div className="flex-grow-1 align-self-center mx-2">
              <div className="progress" style={{ height: 4 }}>
                <div className="progress-bar bg-success" style={{ width: currentStep >= 2 ? "100%" : "0%" }} />
              </div>
            </div>
            <div className={`text-center ${currentStep >= 2 ? "text-primary fw-bold" : "text-muted"}`}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${currentStep >= 2 ? "bg-primary text-white" : "bg-secondary text-white"}`} style={{ width: 40, height: 40 }}>2</div>
              <small>Financial</small>
            </div>
            <div className="flex-grow-1 align-self-center mx-2">
              <div className="progress" style={{ height: 4 }}>
                <div className="progress-bar bg-success" style={{ width: currentStep >= 3 ? "100%" : "0%" }} />
              </div>
            </div>
            <div className={`text-center ${currentStep >= 3 ? "text-primary fw-bold" : "text-muted"}`}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${currentStep >= 3 ? "bg-primary text-white" : "bg-secondary text-white"}`} style={{ width: 40, height: 40 }}>3</div>
              <small>Review & Submit</small>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}<button className="btn-close float-end" onClick={() => setError("")} /></div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Step 1: Technical */}
      {currentStep === 1 && (
        <div className="card">
          <div className="card-header bg-light">
            <h6 className="mb-0 fw-semibold">Step 1: Technical Bid</h6>
            <small>Your technical data will be saved as draft. You can continue later.</small>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="companyName" value={formData.companyName} onChange={handleChange} />
                  <label>Company Name {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
                  <label>GST Number {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="panNumber" value={formData.panNumber} onChange={handleChange} />
                  <label>PAN Number {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <select className="form-select" name="makeIndiaClass" value={formData.makeIndiaClass} onChange={handleChange}>
                    <option value="">Select Class</option>
                    <option value="Class 1">Class 1 - 100% Local</option>
                    <option value="Class 2">Class 2 - 50% Local</option>
                  </select>
                  <label>Make in India Class {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    name="bidderTurnover"
                    value={formData.bidderTurnover === "" ? "" : formatNumber(formData.bidderTurnover)}
                    onChange={handleNumberChange}
                    inputMode="numeric"
                    placeholder="0"
                  />
                  <label>Bidder Turnover (₹) {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    name="oemTurnover"
                    value={formData.oemTurnover === "" ? "" : formatNumber(formData.oemTurnover)}
                    onChange={handleNumberChange}
                    inputMode="numeric"
                    placeholder="0"
                  />
                  <label>OEM Turnover (₹) {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="oemName" value={formData.oemName} onChange={handleChange} />
                  <label>OEM Name {getLevelBadge(3)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <textarea className="form-control" name="authorizationDetails" style={{ height: "80px" }} value={formData.authorizationDetails} onChange={handleChange} />
                  <label>Authorization Details {getLevelBadge(3)}</label>
                </div>
              </div>
            </div>

            <div className="card bg-light p-3 mt-3">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" name="isMsme" checked={formData.isMsme} onChange={handleChange} />
                <label className="form-check-label fw-semibold">MSME Exemption</label>
              </div>
              {formData.isMsme && (
                <div className="mt-2">
                  <div className="form-floating">
                    <input type="text" className="form-control" name="msmeNumber" value={formData.msmeNumber} onChange={handleChange} />
                    <label>MSME Number</label>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4 mt-3">
              <label className="form-label fw-semibold">Supporting Documents</label>
              <input type="file" className="form-control" multiple accept=".pdf,.doc,.docx" onChange={(e) => setTechnicalFiles(Array.from(e.target.files))} />
              {technicalFiles.length > 0 && <small className="text-success d-block mt-1">{technicalFiles.length} file(s) selected</small>}
            </div>

            <div className="d-flex justify-content-between">
              <button className="btn btn-outline-secondary" onClick={saveDraft} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                Save as Draft
              </button>
              <button className="btn btn-primary" onClick={handleNext} disabled={loading}>
                Next: Financial Details →
              </button>
            </div>
            {draftSaved && <small className="text-success d-block mt-2">✓ Draft saved</small>}
          </div>
        </div>
      )}

      {/* Step 2: Financial */}
      {currentStep === 2 && (
        <div className="card">
          <div className="card-header bg-light">
            <h6 className="mb-0 fw-semibold">Step 2: Financial Bid</h6>
            <small>Your financial data will be encrypted</small>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="totalBidAmount" value={formatNumber(formData.totalBidAmount)} onChange={handleNumberChange} inputMode="numeric" />
                  <label>Total Bid Amount (₹) {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="number" className="form-control" name="gstPercent" value={formData.gstPercent} onChange={handleChange} />
                  <label>GST Percentage (%) {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="number" className="form-control bg-light" value={formData.totalCost} readOnly />
                  <label>Total Cost (incl. GST) {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="bankName" value={formData.bankName} onChange={handleChange} />
                  <label>Bank Name {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
                  <label>Account Number {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="ifscCode" value={formData.ifscCode} onChange={handleChange} />
                  <label>IFSC Code {getLevelBadge(1)}</label>
                </div>
              </div>
            </div>

            <div className="mb-4 mt-3">
              <label className="form-label fw-semibold">BOQ / Financial Documents</label>
              <input type="file" className="form-control" accept=".xlsx,.xls,.pdf" onChange={(e) => setFinancialFiles(Array.from(e.target.files))} />
              {financialFiles.length > 0 && <small className="text-success d-block mt-1">{financialFiles[0]?.name} selected</small>}
            </div>

            <div className="d-flex justify-content-between">
              <button className="btn btn-outline-secondary" onClick={handleBack}>← Back to Technical</button>
              <button className="btn btn-primary" onClick={handleNext}>Next: Review →</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {currentStep === 3 && (
        <div className="card">
          <div className="card-header bg-light">
            <h6 className="mb-0 fw-semibold">Step 3: Review & Submit</h6>
            <small>Please review your bid before final submission</small>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-primary">Technical Details</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr><td>Company Name:</td><td><strong>{formData.companyName}</strong></td></tr>
                    <tr><td>GST Number:</td><td><strong>{formData.gstNumber}</strong></td></tr>
                    <tr><td>PAN Number:</td><td><strong>{formData.panNumber}</strong></td></tr>
                    <tr><td>Make in India Class:</td><td><strong>{formData.makeIndiaClass}</strong></td></tr>
                    <tr><td>Bidder Turnover:</td><td><strong>₹ {formData.bidderTurnover?.toLocaleString()}</strong></td></tr>
                    <tr><td>OEM Name:</td><td><strong>{formData.oemName}</strong></td></tr>
                    <tr><td>OEM Turnover:</td><td><strong>₹ {formData.oemTurnover?.toLocaleString()}</strong></td></tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h6 className="text-primary">Financial Details</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr><td>Total Bid Amount:</td><td><strong>₹ {formData.totalBidAmount?.toLocaleString()}</strong></td></tr>
                    <tr><td>GST %:</td><td><strong>{formData.gstPercent}%</strong></td></tr>
                    <tr><td>Total Cost:</td><td><strong>₹ {formData.totalCost?.toLocaleString()}</strong></td></tr>
                    <tr><td>Bank Name:</td><td><strong>{formData.bankName}</strong></td></tr>
                    <tr><td>Account Number:</td><td><strong>{formData.accountNumber}</strong></td></tr>
                    <tr><td>IFSC Code:</td><td><strong>{formData.ifscCode}</strong></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle-fill me-2" />
              <strong>Important:</strong> Once submitted, you cannot edit your bid.
            </div>

            <div className="d-flex justify-content-between">
              <button className="btn btn-outline-secondary" onClick={handleBack}>← Back to Financial</button>
              <button className="btn btn-success px-4" onClick={handleSubmitFinal} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                Submit Final Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidSubmission;