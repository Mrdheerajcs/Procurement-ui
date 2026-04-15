import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../auth/apiClient";

const BidSubmission = () => {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("technical");
  const [bidTechnicalId, setBidTechnicalId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Check if user is vendor - if not, show error
  const [isVendor, setIsVendor] = useState(true);
  const [vendorProfile, setVendorProfile] = useState(null);

  const [technicalData, setTechnicalData] = useState({
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
  });
  
  const [financialData, setFinancialData] = useState({
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

  // Fetch tender details and vendor profile
  useEffect(() => {
    if (!tenderId || tenderId === "undefined") {
      setError("Invalid tender ID");
      return;
    }
    fetchTenderDetails();
    fetchVendorProfile();
  }, [tenderId]);

  const fetchTenderDetails = async () => {
    try {
      const res = await apiClient.get(`/api/tenders/${tenderId}`);
      if (res.status === "SUCCESS") {
        setTender(res.data);
      }
    } catch (err) {
      console.error("Error fetching tender:", err);
      setError("Failed to load tender details");
    }
  };

  const fetchVendorProfile = async () => {
    try {
      const res = await apiClient.get("/api/vendors/profile");
      if (res.status === "SUCCESS") {
        const vendor = res.data;
        setVendorProfile(vendor);
        setTechnicalData(prev => ({
          ...prev,
          companyName: vendor.vendorName || "",
          gstNumber: vendor.gstNo || "",
          panNumber: vendor.panNo || "",
          bankName: vendor.bankName || "",
          accountNumber: vendor.accountNo || "",
          ifscCode: vendor.ifscCode || "",
        }));
        setIsVendor(true);
      }
    } catch (err) {
      console.error("Error fetching vendor profile:", err);
      // If not vendor, show message but don't redirect
      setIsVendor(false);
      setError("You are not registered as a vendor. Please contact admin.");
    }
  };

  const validateTechnical = () => {
    const errors = {};
    if (!technicalData.companyName) errors.companyName = "Company name is required";
    if (!technicalData.gstNumber) errors.gstNumber = "GST number is required";
    if (!technicalData.panNumber) errors.panNumber = "PAN number is required";
    if (!technicalData.makeIndiaClass) errors.makeIndiaClass = "Make in India class is required";
    if (!technicalData.bidderTurnover) errors.bidderTurnover = "Bidder turnover is required";
    if (!technicalData.oemTurnover) errors.oemTurnover = "OEM turnover is required";
    if (!technicalData.oemName) errors.oemName = "OEM name is required";
    if (!technicalData.authorizationDetails) errors.authorizationDetails = "Authorization details are required";
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateFinancial = () => {
    const errors = {};
    if (!financialData.totalBidAmount) errors.totalBidAmount = "Total bid amount is required";
    if (!financialData.gstPercent) errors.gstPercent = "GST percentage is required";
    if (!financialData.totalCost) errors.totalCost = "Total cost is required";
    if (!financialData.bankName) errors.bankName = "Bank name is required";
    if (!financialData.accountNumber) errors.accountNumber = "Account number is required";
    if (!financialData.ifscCode) errors.ifscCode = "IFSC code is required";
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Auto-calculate total cost
  useEffect(() => {
    if (financialData.totalBidAmount && financialData.gstPercent) {
      const total = parseFloat(financialData.totalBidAmount) * (1 + parseFloat(financialData.gstPercent) / 100);
      setFinancialData(prev => ({ ...prev, totalCost: total.toFixed(2) }));
    }
  }, [financialData.totalBidAmount, financialData.gstPercent]);

  const handleTechnicalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTechnicalData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFinancialChange = (e) => {
    const { name, value } = e.target;
    setFinancialData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleTechnicalFileChange = (e) => {
    setTechnicalFiles(Array.from(e.target.files));
  };

  const handleFinancialFileChange = (e) => {
    setFinancialFiles(Array.from(e.target.files));
  };

  const submitTechnicalBid = async () => {
    if (!validateTechnical()) return;
    
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify({
      tenderId: parseInt(tenderId),
      ...technicalData,
      isMsme: technicalData.isMsme,
    })], { type: "application/json" }));

    technicalFiles.forEach(file => {
      formData.append("files", file);
    });

    try {
      const res = await apiClient.post("/api/bids/technical", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (res.status === "SUCCESS") {
        setBidTechnicalId(res.data.bidTechnicalId);
        setSuccess("Technical bid submitted successfully! Now proceed to financial bid.");
        setStep("financial");
      } else {
        setError(res.message || "Failed to submit technical bid");
      }
    } catch (err) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

const submitFinancialBid = async () => {
    if (!validateFinancial()) return;
    
    setLoading(true);
    setError("");

    // ✅ First check if technical bid is qualified
    try {
        const techCheck = await apiClient.get(`/api/bids/technical/${bidTechnicalId}`);
        if (techCheck.status === "SUCCESS") {
            if (techCheck.data.evaluationStatus !== "QUALIFIED") {
                setError("Your technical bid is not qualified yet. Please wait for admin evaluation.");
                setLoading(false);
                return;
            }
        }
    } catch (err) {
        console.error("Error checking technical status:", err);
    }

    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify({
        tenderId: parseInt(tenderId),
        bidTechnicalId: bidTechnicalId,
        ...financialData,
    })], { type: "application/json" }));

    financialFiles.forEach(file => {
        formData.append("files", file);
    });

    try {
        const res = await apiClient.post("/api/bids/financial", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        
        if (res.status === "SUCCESS") {
            setSuccess("Bid submitted successfully!");
            setTimeout(() => {
                navigate("/vendor-contracts");
            }, 3000);
        } else {
            setError(res.message || "Failed to submit financial bid");
        }
    } catch (err) {
        setError(err.message || "Server error");
    } finally {
        setLoading(false);
    }
};

  const getLevelBadge = (level) => {
    const colors = { 1: "danger", 2: "warning", 3: "info" };
    return <span className={`badge bg-${colors[level]} ms-2`} style={{ fontSize: "10px" }}>Level {level}</span>;
  };

  // If no tenderId or invalid
  if (!tenderId || tenderId === "undefined") {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger m-4">
          <h5>Invalid Tender</h5>
          <p>Please select a valid tender from the <a href="/searchtender">Search Tender</a> page.</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate("/searchtender")}>
            Go to Search Tender
          </button>
        </div>
      </div>
    );
  }

  if (!isVendor) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning m-4">
          <h5>Vendor Access Required</h5>
          <p>You need to be registered as a vendor to participate in bids.</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate("/")}>
            Contact Admin
          </button>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="container-fluid text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p>Loading tender details...</p>
      </div>
    );
  }

  const isBiddingOpen = () => {
    const today = new Date().toISOString().split("T")[0];
    return tender.bidStartDate <= today && tender.bidEndDate >= today;
  };

  if (!isBiddingOpen()) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger m-4">
          <h5>Bidding Closed</h5>
          <p>This tender is not accepting bids at this time.</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate("/searchtender")}>
            Back to Search
          </button>
        </div>
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
        <div className="col-md-6 mx-auto">
          <div className="d-flex justify-content-between">
            <div className={`text-center ${step === "technical" ? "text-primary fw-bold" : step === "financial" ? "text-success" : "text-muted"}`}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${step === "technical" ? "bg-primary text-white" : step === "financial" ? "bg-success text-white" : "bg-secondary text-white"}`} style={{ width: 40, height: 40 }}>
                1
              </div>
              <small>Technical</small>
            </div>
            <div className="flex-grow-1 align-self-center mx-2">
              <div className="progress" style={{ height: 4 }}>
                <div className="progress-bar bg-success" style={{ width: step === "financial" ? "100%" : "0%" }} />
              </div>
            </div>
            <div className={`text-center ${step === "financial" ? "text-primary fw-bold" : "text-muted"}`}>
              <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${step === "financial" ? "bg-primary text-white" : "bg-secondary text-white"}`} style={{ width: 40, height: 40 }}>
                2
              </div>
              <small>Financial</small>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}<button type="button" className="btn-close float-end" onClick={() => setError("")} /></div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* TECHNICAL SECTION */}
      {step === "technical" && (
        <div className="card">
          <div className="card-header bg-light">
            <h6 className="mb-0 fw-semibold">Cover 1: Technical Bid</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className={`form-control ${fieldErrors.companyName ? "is-invalid" : ""}`} id="companyName" name="companyName" value={technicalData.companyName} onChange={handleTechnicalChange} />
                  <label>Company Name {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className={`form-control ${fieldErrors.gstNumber ? "is-invalid" : ""}`} id="gstNumber" name="gstNumber" value={technicalData.gstNumber} onChange={handleTechnicalChange} />
                  <label>GST Number {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className={`form-control ${fieldErrors.panNumber ? "is-invalid" : ""}`} id="panNumber" name="panNumber" value={technicalData.panNumber} onChange={handleTechnicalChange} />
                  <label>PAN Number {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <select className={`form-select ${fieldErrors.makeIndiaClass ? "is-invalid" : ""}`} id="makeIndiaClass" name="makeIndiaClass" value={technicalData.makeIndiaClass} onChange={handleTechnicalChange}>
                    <option value="">Select Class</option>
                    <option value="Class 1">Class 1 - 100% Local</option>
                    <option value="Class 2">Class 2 - 50% Local</option>
                  </select>
                  <label>Make in India Class {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="number" className={`form-control ${fieldErrors.bidderTurnover ? "is-invalid" : ""}`} id="bidderTurnover" name="bidderTurnover" value={technicalData.bidderTurnover} onChange={handleTechnicalChange} />
                  <label>Bidder Turnover (₹) {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="number" className={`form-control ${fieldErrors.oemTurnover ? "is-invalid" : ""}`} id="oemTurnover" name="oemTurnover" value={technicalData.oemTurnover} onChange={handleTechnicalChange} />
                  <label>OEM Turnover (₹) {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className={`form-control ${fieldErrors.oemName ? "is-invalid" : ""}`} id="oemName" name="oemName" value={technicalData.oemName} onChange={handleTechnicalChange} />
                  <label>OEM Name {getLevelBadge(3)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <textarea className={`form-control ${fieldErrors.authorizationDetails ? "is-invalid" : ""}`} id="authorizationDetails" name="authorizationDetails" style={{ height: "80px" }} value={technicalData.authorizationDetails} onChange={handleTechnicalChange} />
                  <label>Authorization Details {getLevelBadge(3)}</label>
                </div>
              </div>
            </div>

            <div className="card bg-light p-3 mt-3">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="isMsme" name="isMsme" checked={technicalData.isMsme} onChange={handleTechnicalChange} />
                <label className="form-check-label fw-semibold" htmlFor="isMsme">MSME Exemption</label>
              </div>
              {technicalData.isMsme && (
                <div className="mt-2">
                  <div className="form-floating">
                    <input type="text" className="form-control" id="msmeNumber" name="msmeNumber" value={technicalData.msmeNumber} onChange={handleTechnicalChange} />
                    <label>MSME Number</label>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4 mt-3">
              <label className="form-label fw-semibold">Supporting Documents</label>
              <input type="file" className="form-control" multiple accept=".pdf,.doc,.docx" onChange={handleTechnicalFileChange} />
              {technicalFiles.length > 0 && <small className="text-success mt-1 d-block">{technicalFiles.length} file(s) selected</small>}
            </div>

            <div className="d-flex justify-content-end">
              <button className="btn btn-primary px-4" onClick={submitTechnicalBid} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                Submit Technical Bid →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINANCIAL SECTION */}
      {step === "financial" && (
        <div className="card">
          <div className="card-header bg-light">
            <h6 className="mb-0 fw-semibold">Cover 2: Financial Bid</h6>
            <small className="text-muted">Data encrypted - revealed only after technical evaluation</small>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="number" className={`form-control ${fieldErrors.totalBidAmount ? "is-invalid" : ""}`} id="totalBidAmount" name="totalBidAmount" value={financialData.totalBidAmount} onChange={handleFinancialChange} />
                  <label>Total Bid Amount (₹) {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="number" className={`form-control ${fieldErrors.gstPercent ? "is-invalid" : ""}`} id="gstPercent" name="gstPercent" value={financialData.gstPercent} onChange={handleFinancialChange} />
                  <label>GST Percentage (%) {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="number" className="form-control bg-light" id="totalCost" value={financialData.totalCost} readOnly />
                  <label>Total Cost (incl. GST) {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className={`form-control ${fieldErrors.bankName ? "is-invalid" : ""}`} id="bankName" name="bankName" value={financialData.bankName} onChange={handleFinancialChange} />
                  <label>Bank Name {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className={`form-control ${fieldErrors.accountNumber ? "is-invalid" : ""}`} id="accountNumber" name="accountNumber" value={financialData.accountNumber} onChange={handleFinancialChange} />
                  <label>Account Number {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className={`form-control ${fieldErrors.ifscCode ? "is-invalid" : ""}`} id="ifscCode" name="ifscCode" value={financialData.ifscCode} onChange={handleFinancialChange} />
                  <label>IFSC Code {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" id="emdNumber" name="emdNumber" value={financialData.emdNumber} onChange={handleFinancialChange} />
                  <label>EMD Number {getLevelBadge(3)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="number" className="form-control" id="emdValue" name="emdValue" value={financialData.emdValue} onChange={handleFinancialChange} />
                  <label>EMD Value (₹) {getLevelBadge(3)}</label>
                </div>
              </div>
            </div>

            <div className="mb-4 mt-3">
              <label className="form-label fw-semibold">BOQ / Financial Documents</label>
              <input type="file" className="form-control" accept=".xlsx,.xls,.pdf" onChange={handleFinancialFileChange} />
              {financialFiles.length > 0 && <small className="text-success mt-1 d-block">{financialFiles[0].name} selected</small>}
            </div>

            <div className="d-flex justify-content-between">
              <button className="btn btn-outline-secondary" onClick={() => setStep("technical")}>← Back</button>
              <button className="btn btn-success px-4" onClick={submitFinancialBid} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                Submit Financial Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidSubmission;