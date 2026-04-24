import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../auth/apiClient";
import DocumentViewer from "../../../Components/DocumentViewer";


const BidSubmission = () => {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [techDraftSaved, setTechDraftSaved] = useState(false);
  const [finDraftSaved, setFinDraftSaved] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [viewerDoc, setViewerDoc] = useState(null);

  // Technical Form Data
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

  // Financial Form Data
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

  // Technical Documents
  const [technicalDocs, setTechnicalDocs] = useState({
    experienceCertificate: null,
    oemAuthorization: null,
    gstCertificate: null,
    panCard: null,
    msmeCertificate: null,
    otherDocs: [],
  });

  // Financial Documents
  const [financialDocs, setFinancialDocs] = useState({
    boqFile: null,
    priceBreakup: null,
    emdReceipt: null,
    otherFinancialDocs: [],
  });

  const getFileName = (path) => {
    if (!path) return "";
    return path.split(/[/\\]/).pop();
  };

  const [existingFiles, setExistingFiles] = useState({
    technical: {},
    financial: {}
  });

  const normalizeFileList = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.split(",").filter(Boolean);
};

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!tenderId || tenderId === "undefined") {
      setError("Invalid tender ID");
      return;
    }
    fetchTenderDetails();
    fetchVendorProfile();
    loadExistingDrafts();
    checkSubmissionStatus();
  }, [tenderId]);

  const fetchTenderDetails = async () => {
    try {
      const res = await apiClient.get(`/api/tenders/${tenderId}`);
      if (res.status === "SUCCESS") setTender(res.data);
    } catch (err) {
      setError("Failed to load tender details");
    }
  };

  const fetchVendorProfile = async () => {
    try {
      const res = await apiClient.get("/api/vendors/profile");
      if (res.status === "SUCCESS") {
        const vendor = res.data;
        setTechnicalData(prev => ({
          ...prev,
          companyName: vendor.vendorName || "",
          gstNumber: vendor.gstNo || "",
          panNumber: vendor.panNo || "",
        }));
        setFinancialData(prev => ({
          ...prev,
          bankName: vendor.bankName || "",
          accountNumber: vendor.accountNo || "",
          ifscCode: vendor.ifscCode || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching vendor profile:", err);
    }
  };

  const loadExistingDrafts = async () => {
    try {
      const techRes = await apiClient.get(`/api/bids/technical/draft/${tenderId}`);
      if (techRes.status === "SUCCESS" && techRes.data) {
        setTechnicalData(prev => ({
          ...prev,
          makeIndiaClass: techRes.data.makeIndiaClass || "",
          bidderTurnover: techRes.data.bidderTurnover || "",
          oemTurnover: techRes.data.oemTurnover || "",
          oemName: techRes.data.oemName || "",
          authorizationDetails: techRes.data.authorizationDetails || "",
          msmeNumber: techRes.data.msmeNumber || "",
          isMsme: techRes.data.isMsme || false,
        }));

        setExistingFiles(prev => ({
  ...prev,
  technical: {
    experienceCertificate: techRes.data.experienceCertPath,
    oemAuthorization: techRes.data.oemAuthPath,
    gstCertificate: techRes.data.gstCertPath,
    panCard: techRes.data.panCardPath,
    msmeCertificate: techRes.data.msmeCertPath,
    otherDocs: normalizeFileList(techRes.data.otherDocsPath)
  }
}));
        setTechDraftSaved(true);
      }
    } catch (err) {
      console.log("No technical draft found");
    }

    try {
      const finRes = await apiClient.get(`/api/bids/financial/draft/${tenderId}`);
      if (finRes.status === "SUCCESS" && finRes.data) {
        setFinancialData(prev => ({
          ...prev,
          totalBidAmount: finRes.data.totalBidAmount || "",
          gstPercent: finRes.data.gstPercent || "",
          totalCost: finRes.data.totalCost || "",
          emdNumber: finRes.data.emdNumber || "",
          emdValue: finRes.data.emdValue || "",
          emdExemptionDetails: finRes.data.emdExemptionDetails || "",
        }));

        setExistingFiles(prev => ({
  ...prev,
  financial: {
    boqFile: finRes.data.boqFilePath,
    priceBreakup: finRes.data.priceBreakupPath,
    emdReceipt: finRes.data.emdReceiptPath,
    otherDocs: normalizeFileList(finRes.data.otherFinancialDocsPath)
  }
}));
        setFinDraftSaved(true);
      }
    } catch (err) {
      console.log("No financial draft found");
    }
  };

  const checkSubmissionStatus = async () => {
    try {
      const res = await apiClient.get(`/api/bids/check-participation/${tenderId}`);
      if (res.status === "SUCCESS" && res.data) {
        setHasSubmitted(true);
        const statusRes = await apiClient.get(`/api/bids/technical/draft/${tenderId}`);
        if (statusRes.status === "SUCCESS" && statusRes.data) {
          setSubmissionStatus(statusRes.data.evaluationStatus);
        }
      }
    } catch (err) {
      console.log("Not submitted yet");
    }
  };

  const saveTechnicalDraft = async () => {
    setLoading(true);
    const formDataToSend = new FormData();

    const techData = {
      tenderId: parseInt(tenderId),
      companyName: technicalData.companyName,
      gstNumber: technicalData.gstNumber,
      panNumber: technicalData.panNumber,
      makeIndiaClass: technicalData.makeIndiaClass,
      bidderTurnover: parseFloat(technicalData.bidderTurnover) || 0,
      oemTurnover: parseFloat(technicalData.oemTurnover) || 0,
      oemName: technicalData.oemName,
      authorizationDetails: technicalData.authorizationDetails,
      msmeNumber: technicalData.msmeNumber,
      isMsme: technicalData.isMsme,
    };

    formDataToSend.append("data", new Blob([JSON.stringify(techData)], { type: "application/json" }));

    if (technicalDocs.experienceCertificate) formDataToSend.append("experienceCertificate", technicalDocs.experienceCertificate);
    if (technicalDocs.oemAuthorization) formDataToSend.append("oemAuthorization", technicalDocs.oemAuthorization);
    if (technicalDocs.gstCertificate) formDataToSend.append("gstCertificate", technicalDocs.gstCertificate);
    if (technicalDocs.panCard) formDataToSend.append("panCard", technicalDocs.panCard);
    if (technicalDocs.msmeCertificate) formDataToSend.append("msmeCertificate", technicalDocs.msmeCertificate);
    technicalDocs.otherDocs.forEach(file => formDataToSend.append("otherDocs", file));

    try {
      const res = await apiClient.post("/api/bids/technical/draft", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.status === "SUCCESS") {
        setTechDraftSaved(true);
        alert("Technical draft saved successfully!");
      }
    } catch (err) {
      console.error("Error saving technical draft:", err);
      alert("Failed to save technical draft");
    } finally {
      setLoading(false);
    }
  };

  const saveFinancialDraft = async () => {
    setLoading(true);
    const formDataToSend = new FormData();

    const finData = {
      tenderId: parseInt(tenderId),
      totalBidAmount: parseFloat(financialData.totalBidAmount) || 0,
      gstPercent: parseFloat(financialData.gstPercent) || 0,
      totalCost: parseFloat(financialData.totalCost) || 0,
      bankName: financialData.bankName,
      accountNumber: financialData.accountNumber,
      ifscCode: financialData.ifscCode,
      emdNumber: financialData.emdNumber,
      emdValue: parseFloat(financialData.emdValue) || 0,
      emdExemptionDetails: financialData.emdExemptionDetails,
    };

    formDataToSend.append("data", new Blob([JSON.stringify(finData)], { type: "application/json" }));

    if (financialDocs.boqFile) formDataToSend.append("boqFile", financialDocs.boqFile);
    if (financialDocs.priceBreakup) formDataToSend.append("priceBreakup", financialDocs.priceBreakup);
    if (financialDocs.emdReceipt) formDataToSend.append("emdReceipt", financialDocs.emdReceipt);
    financialDocs.otherFinancialDocs.forEach(file => formDataToSend.append("otherFinancialDocs", file));

    try {
      const res = await apiClient.post("/api/bids/financial/draft", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.status === "SUCCESS") {
        setFinDraftSaved(true);
        alert("Financial draft saved successfully!");
      }
    } catch (err) {
      console.error("Error saving financial draft:", err);
      alert("Failed to save financial draft");
    } finally {
      setLoading(false);
    }
  };

  const validateTechnical = () => {
    const errors = {};
    if (!technicalData.makeIndiaClass) errors.makeIndiaClass = "Make in India class required";
    if (!technicalData.bidderTurnover) errors.bidderTurnover = "Bidder turnover required";
    if (!technicalData.oemTurnover) errors.oemTurnover = "OEM turnover required";
    if (!technicalData.oemName) errors.oemName = "OEM name required";
    if (!technicalData.authorizationDetails) errors.authorizationDetails = "Authorization details required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateFinancial = () => {
    const errors = {};
    if (!financialData.totalBidAmount) errors.totalBidAmount = "Total bid amount required";
    if (!financialData.gstPercent) errors.gstPercent = "GST percentage required";
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
    const rawValue = value.replace(/,/g, "");
    if (rawValue === "") {
      if (name === "bidderTurnover" || name === "oemTurnover") {
        setTechnicalData(prev => ({ ...prev, [name]: "" }));
      } else {
        setFinancialData(prev => ({ ...prev, [name]: "" }));
      }
      return;
    }
    if (!/^\d*\.?\d*$/.test(rawValue)) return;
    if (name === "bidderTurnover" || name === "oemTurnover") {
      setTechnicalData(prev => ({ ...prev, [name]: rawValue }));
    } else {
      setFinancialData(prev => ({ ...prev, [name]: rawValue }));
      if (name === "totalBidAmount" || name === "gstPercent") {
        const bidAmount = name === "totalBidAmount" ? parseFloat(rawValue) || 0 : parseFloat(financialData.totalBidAmount) || 0;
        const gst = name === "gstPercent" ? parseFloat(rawValue) || 0 : parseFloat(financialData.gstPercent) || 0;
        const total = bidAmount * (1 + gst / 100);
        setFinancialData(prev => ({ ...prev, totalCost: total.toFixed(2) }));
      }
    }
  };

  const handleTechnicalChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setTechnicalData(prev => ({ ...prev, [name]: checked }));
    } else {
      setTechnicalData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFinancialChange = (e) => {
    const { name, value } = e.target;
    setFinancialData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "totalBidAmount" || name === "gstPercent") {
        const bidAmount = parseFloat(updated.totalBidAmount) || 0;
        const gst = parseFloat(updated.gstPercent) || 0;
        updated.totalCost = (bidAmount * (1 + gst / 100)).toFixed(2);
      }
      return updated;
    });
  };

  const handleTechDocChange = (category, file) => {
    setTechnicalDocs(prev => ({ ...prev, [category]: file }));
  };

  const handleFinDocChange = (category, file) => {
    setFinancialDocs(prev => ({ ...prev, [category]: file }));
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (validateTechnical()) {
        await saveTechnicalDraft();
        setCurrentStep(2);
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
      companyName: technicalData.companyName,
      gstNumber: technicalData.gstNumber,
      panNumber: technicalData.panNumber,
      makeIndiaClass: technicalData.makeIndiaClass,
      bidderTurnover: parseFloat(technicalData.bidderTurnover) || 0,
      oemTurnover: parseFloat(technicalData.oemTurnover) || 0,
      oemName: technicalData.oemName,
      authorizationDetails: technicalData.authorizationDetails,
      msmeNumber: technicalData.msmeNumber,
      isMsme: technicalData.isMsme,
      totalBidAmount: parseFloat(financialData.totalBidAmount) || 0,
      gstPercent: parseFloat(financialData.gstPercent) || 0,
      totalCost: parseFloat(financialData.totalCost) || 0,
      bankName: financialData.bankName,
      accountNumber: financialData.accountNumber,
      ifscCode: financialData.ifscCode,
      emdNumber: financialData.emdNumber,
      emdValue: parseFloat(financialData.emdValue) || 0,
      emdExemptionDetails: financialData.emdExemptionDetails,
    };

    formDataToSend.append("data", new Blob([JSON.stringify(finalData)], { type: "application/json" }));

    if (technicalDocs.experienceCertificate) formDataToSend.append("experienceCertificate", technicalDocs.experienceCertificate);
    if (technicalDocs.oemAuthorization) formDataToSend.append("oemAuthorization", technicalDocs.oemAuthorization);
    if (technicalDocs.gstCertificate) formDataToSend.append("gstCertificate", technicalDocs.gstCertificate);
    if (technicalDocs.panCard) formDataToSend.append("panCard", technicalDocs.panCard);
    if (technicalDocs.msmeCertificate) formDataToSend.append("msmeCertificate", technicalDocs.msmeCertificate);
    technicalDocs.otherDocs.forEach(file => formDataToSend.append("otherDocs", file));

    if (financialDocs.boqFile) formDataToSend.append("boqFile", financialDocs.boqFile);
    if (financialDocs.priceBreakup) formDataToSend.append("priceBreakup", financialDocs.priceBreakup);
    if (financialDocs.emdReceipt) formDataToSend.append("emdReceipt", financialDocs.emdReceipt);
    financialDocs.otherFinancialDocs.forEach(file => formDataToSend.append("otherFinancialDocs", file));

    try {
      const res = await apiClient.post("/api/bids/final", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.status === "SUCCESS") {
        setSuccess("Bid submitted successfully! Awaiting technical evaluation.");
        setTimeout(() => navigate("/my-bids"), 3000);
      }
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (level) => {
    const colors = { 1: "danger", 2: "warning", 3: "info" };
    return <span className={`badge bg-${colors[level]} ms-2`} style={{ fontSize: "10px" }}>Level {level}</span>;
  };

  if (hasSubmitted) {
    return (
      <div className="container-fluid">
        <div className="card mt-4">
          <div className="card-body text-center py-5">
            <i className="bi bi-check-circle-fill text-success fs-1 d-block mb-3" />
            <h3>You have already submitted a bid for this tender</h3>
            <p className="text-muted">Current Status: <strong>{submissionStatus || "Submitted"}</strong></p>
            <button className="btn btn-primary mt-3" onClick={() => navigate("/my-bids")}>View My Bids</button>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
          <div className="d-flex justify-content-between">
            <div className={`text-center ${currentStep >= 1 ? "text-primary fw-bold" : "text-muted"}`}>
              <div className={`rounded-circle ${currentStep >= 1 ? "bg-primary text-white" : "bg-secondary text-white"}`} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>1</div>
              <small>Technical {techDraftSaved && "✓"}</small>
            </div>
            <div className="flex-grow-1 align-self-center mx-2">
              <div className="progress" style={{ height: 4 }}>
                <div className="progress-bar bg-success" style={{ width: currentStep >= 2 ? "100%" : "0%" }} />
              </div>
            </div>
            <div className={`text-center ${currentStep >= 2 ? "text-primary fw-bold" : "text-muted"}`}>
              <div className={`rounded-circle ${currentStep >= 2 ? "bg-primary text-white" : "bg-secondary text-white"}`} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>2</div>
              <small>Financial {finDraftSaved && "✓"}</small>
            </div>
            <div className="flex-grow-1 align-self-center mx-2">
              <div className="progress" style={{ height: 4 }}>
                <div className="progress-bar bg-success" style={{ width: currentStep >= 3 ? "100%" : "0%" }} />
              </div>
            </div>
            <div className={`text-center ${currentStep >= 3 ? "text-primary fw-bold" : "text-muted"}`}>
              <div className={`rounded-circle ${currentStep >= 3 ? "bg-primary text-white" : "bg-secondary text-white"}`} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>3</div>
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
            <small>Company details are auto-filled from your profile and are read-only</small>
          </div>
          <div className="card-body">
            <div className="border-start border-primary border-3 ps-3 mb-4">
              <h6 className="text-primary mb-3">Company Details (Auto-filled, Read-only)</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="form-floating">
                    <input type="text" className="form-control bg-light" value={technicalData.companyName} readOnly />
                    <label>Company Name {getLevelBadge(1)}</label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-floating">
                    <input type="text" className="form-control bg-light" value={technicalData.gstNumber} readOnly />
                    <label>GST Number {getLevelBadge(1)}</label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-floating">
                    <input type="text" className="form-control bg-light" value={technicalData.panNumber} readOnly />
                    <label>PAN Number {getLevelBadge(1)}</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-floating">
                  <select className="form-select" name="makeIndiaClass" value={technicalData.makeIndiaClass} onChange={handleTechnicalChange}>
                    <option value="">Select Class</option>
                    <option value="Class 1">Class 1 - 100% Local</option>
                    <option value="Class 2">Class 2 - 50% Local</option>
                  </select>
                  <label>Make in India Class {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="bidderTurnover" value={formatNumber(technicalData.bidderTurnover)} onChange={handleNumberChange} placeholder="0" />
                  <label>Bidder Turnover (₹) {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="oemTurnover" value={formatNumber(technicalData.oemTurnover)} onChange={handleNumberChange} placeholder="0" />
                  <label>OEM Turnover (₹) {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="oemName" value={technicalData.oemName} onChange={handleTechnicalChange} />
                  <label>OEM Name {getLevelBadge(3)}</label>
                </div>
              </div>
              <div className="col-md-12">
                <div className="form-floating">
                  <textarea className="form-control" name="authorizationDetails" style={{ height: "80px" }} value={technicalData.authorizationDetails} onChange={handleTechnicalChange} />
                  <label>Authorization Details {getLevelBadge(3)}</label>
                </div>
              </div>
            </div>

            <div className="card bg-light p-3 mt-3">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" name="isMsme" checked={technicalData.isMsme} onChange={handleTechnicalChange} />
                <label className="form-check-label fw-semibold">MSME Exemption</label>
              </div>
              {technicalData.isMsme && (
                <div className="mt-2">
                  <div className="form-floating">
                    <input type="text" className="form-control" name="msmeNumber" value={technicalData.msmeNumber} onChange={handleTechnicalChange} />
                    <label>MSME Number</label>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
  <h6 className="fw-semibold mb-3">Supporting Documents</h6>

  <div className="row g-3">

    {/* EXPERIENCE CERTIFICATE */}
    <div className="col-md-6">

      {existingFiles.technical.experienceCertificate && (
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="text-success small">
            {getFileName(existingFiles.technical.experienceCertificate)}
          </span>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() =>
              setViewerDoc({
                filePath: existingFiles.technical.experienceCertificate,
                fileName: getFileName(existingFiles.technical.experienceCertificate)
              })
            }
          >
            View
          </button>
        </div>
      )}

      <label className="form-label">Experience Certificate</label>
      <input
        type="file"
        className="form-control"
        accept=".pdf,.doc,.docx"
        onChange={(e) =>
          handleTechDocChange("experienceCertificate", e.target.files[0])
        }
      />
    </div>

    {/* OEM AUTH */}
    <div className="col-md-6">

      {existingFiles.technical.oemAuthorization && (
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="text-success small">
            {getFileName(existingFiles.technical.oemAuthorization)}
          </span>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() =>
              setViewerDoc({
                filePath: existingFiles.technical.oemAuthorization,
                fileName: getFileName(existingFiles.technical.oemAuthorization)
              })
            }
          >
            View
          </button>
        </div>
      )}

      <label className="form-label">OEM Authorization Letter</label>
      <input
        type="file"
        className="form-control"
        accept=".pdf,.doc,.docx"
        onChange={(e) =>
          handleTechDocChange("oemAuthorization", e.target.files[0])
        }
      />
    </div>

    {/* GST CERT */}
    <div className="col-md-6">

      {existingFiles.technical.gstCertificate && (
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="text-success small">
            {getFileName(existingFiles.technical.gstCertificate)}
          </span>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() =>
              setViewerDoc({
                filePath: existingFiles.technical.gstCertificate,
                fileName: getFileName(existingFiles.technical.gstCertificate)
              })
            }
          >
            View
          </button>
        </div>
      )}

      <label className="form-label">GST Certificate</label>
      <input
        type="file"
        className="form-control"
        accept=".pdf,.jpg,.png"
        onChange={(e) =>
          handleTechDocChange("gstCertificate", e.target.files[0])
        }
      />
    </div>

    {/* PAN CARD */}
    <div className="col-md-6">

      {existingFiles.technical.panCard && (
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="text-success small">
            {getFileName(existingFiles.technical.panCard)}
          </span>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() =>
              setViewerDoc({
                filePath: existingFiles.technical.panCard,
                fileName: getFileName(existingFiles.technical.panCard)
              })
            }
          >
            View
          </button>
        </div>
      )}

      <label className="form-label">PAN Card</label>
      <input
        type="file"
        className="form-control"
        accept=".pdf,.jpg,.png"
        onChange={(e) =>
          handleTechDocChange("panCard", e.target.files[0])
        }
      />
    </div>

    {/* MSME */}
    {technicalData.isMsme && (
      <div className="col-md-6">

        {existingFiles.technical.msmeCertificate && (
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="text-success small">
              {getFileName(existingFiles.technical.msmeCertificate)}
            </span>

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() =>
                setViewerDoc({
                  filePath: existingFiles.technical.msmeCertificate,
                  fileName: getFileName(existingFiles.technical.msmeCertificate)
                })
              }
            >
              View
            </button>
          </div>
        )}

        <label className="form-label">MSME Certificate</label>
        <input
          type="file"
          className="form-control"
          accept=".pdf"
          onChange={(e) =>
            handleTechDocChange("msmeCertificate", e.target.files[0])
          }
        />
      </div>
    )}

    {/* OTHER DOCS */}
    <div className="col-md-12">
      {existingFiles.technical.otherDocs?.length > 0 && (
  <div className="mb-2">
    <label className="form-label">Other Existing Documents</label>

    {existingFiles.technical.otherDocs.map((file, index) => (
      <div key={index} className="d-flex align-items-center gap-2 mb-1">

        <span className="text-success small">
          {getFileName(file)}
        </span>

        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() =>
            setViewerDoc({
              filePath: file,
              fileName: getFileName(file)
            })
          }
        >
          View
        </button>

      </div>
    ))}
  </div>
)}
      <label className="form-label">Other Documents</label>
      <input
        type="file"
        className="form-control"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.png"
        onChange={(e) =>
          setTechnicalDocs((prev) => ({
            ...prev,
            otherDocs: Array.from(e.target.files),
          }))
        }
      />
      <small className="text-muted">You can select multiple files</small>
    </div>

  </div>
</div>

            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-outline-secondary" onClick={saveTechnicalDraft} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                Save Technical Draft
              </button>
              <button className="btn btn-primary" onClick={handleNext}>Next: Financial Details →</button>
            </div>
            {techDraftSaved && <small className="text-success d-block mt-2">✓ Technical draft saved</small>}
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
            <div className="border-start border-primary border-3 ps-3 mb-4">
              <h6 className="text-primary mb-3">Bank Details (Auto-filled, Read-only)</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="form-floating">
                    <input type="text" className="form-control bg-light" value={financialData.bankName} readOnly />
                    <label>Bank Name {getLevelBadge(1)}</label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-floating">
                    <input type="text" className="form-control bg-light" value={financialData.accountNumber} readOnly />
                    <label>Account Number {getLevelBadge(1)}</label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-floating">
                    <input type="text" className="form-control bg-light" value={financialData.ifscCode} readOnly />
                    <label>IFSC Code {getLevelBadge(1)}</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="totalBidAmount" value={formatNumber(financialData.totalBidAmount)} onChange={handleNumberChange} />
                  <label>Total Bid Amount (₹) {getLevelBadge(1)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="number" className="form-control" name="gstPercent" value={financialData.gstPercent} onChange={handleFinancialChange} step="0.01" />
                  <label>GST Percentage (%) {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="number" className="form-control bg-light" value={financialData.totalCost} readOnly />
                  <label>Total Cost (incl. GST) {getLevelBadge(2)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="emdNumber" value={financialData.emdNumber} onChange={handleFinancialChange} />
                  <label>EMD Number {getLevelBadge(3)}</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <input type="text" className="form-control" name="emdValue" value={formatNumber(financialData.emdValue)} onChange={handleNumberChange} />
                  <label>EMD Value (₹) {getLevelBadge(3)}</label>
                </div>
              </div>
              <div className="col-md-12">
                <div className="form-floating">
                  <textarea className="form-control" name="emdExemptionDetails" style={{ height: "60px" }} value={financialData.emdExemptionDetails} onChange={handleFinancialChange} />
                  <label>EMD Exemption Details (if any)</label>
                </div>
              </div>
            </div>

          <div className="mt-4">
  <h6 className="fw-semibold mb-3">Financial Documents</h6>

  <div className="row g-3">

    {/* BOQ */}
    <div className="col-md-6">

      {existingFiles.financial.boqFile && (
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="text-success small">
            {getFileName(existingFiles.financial.boqFile)}
          </span>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() =>
              setViewerDoc({
                filePath: existingFiles.financial.boqFile,
                fileName: getFileName(existingFiles.financial.boqFile)
              })
            }
          >
            View
          </button>
        </div>
      )}

      <label className="form-label">
        BOQ File (Excel/PDF) <span className="text-danger">*</span>
      </label>
      <input
        type="file"
        className="form-control"
        accept=".xlsx,.xls,.pdf"
        onChange={(e) =>
          handleFinDocChange("boqFile", e.target.files[0])
        }
      />
    </div>

    {/* PRICE BREAKUP */}
    <div className="col-md-6">

      {existingFiles.financial.priceBreakup && (
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="text-success small">
            {getFileName(existingFiles.financial.priceBreakup)}
          </span>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() =>
              setViewerDoc({
                filePath: existingFiles.financial.priceBreakup,
                fileName: getFileName(existingFiles.financial.priceBreakup)
              })
            }
          >
            View
          </button>
        </div>
      )}

      <label className="form-label">Price Breakup</label>
      <input
        type="file"
        className="form-control"
        accept=".xlsx,.xls,.pdf"
        onChange={(e) =>
          handleFinDocChange("priceBreakup", e.target.files[0])
        }
      />
    </div>

    {/* EMD RECEIPT */}
    <div className="col-md-6">

      {existingFiles.financial.emdReceipt && (
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="text-success small">
            {getFileName(existingFiles.financial.emdReceipt)}
          </span>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() =>
              setViewerDoc({
                filePath: existingFiles.financial.emdReceipt,
                fileName: getFileName(existingFiles.financial.emdReceipt)
              })
            }
          >
            View
          </button>
        </div>
      )}

      <label className="form-label">EMD Receipt/Proof</label>
      <input
        type="file"
        className="form-control"
        accept=".pdf,.jpg,.png"
        onChange={(e) =>
          handleFinDocChange("emdReceipt", e.target.files[0])
        }
      />
    </div>

    {/* OTHER FINANCIAL DOCS */}
    <div className="col-md-12">
      {existingFiles.financial.otherDocs?.length > 0 && (
  <div className="mb-2">
    <label className="form-label">Other Existing Financial Documents</label>

    {existingFiles.financial.otherDocs.map((file, index) => (
      <div key={index} className="d-flex align-items-center gap-2 mb-1">

        <span className="text-success small">
          {getFileName(file)}
        </span>

        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() =>
            setViewerDoc({
              filePath: file,
              fileName: getFileName(file)
            })
          }
        >
          View
        </button>

      </div>
    ))}
  </div>
)}
      <label className="form-label">Other Financial Documents</label>
      <input
        type="file"
        className="form-control"
        multiple
        accept=".pdf,.xlsx,.xls,.doc,.docx"
        onChange={(e) =>
          setFinancialDocs((prev) => ({
            ...prev,
            otherFinancialDocs: Array.from(e.target.files),
          }))
        }
      />
    </div>

  </div>
</div>

            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-outline-secondary" onClick={saveFinancialDraft} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                Save Financial Draft
              </button>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary" onClick={handleBack}>← Back to Technical</button>
                <button className="btn btn-primary" onClick={handleNext}>Next: Review →</button>
              </div>
            </div>
            {finDraftSaved && <small className="text-success d-block mt-2">✓ Financial draft saved</small>}
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
                    <tr><td className="text-muted">Company Name:</td><td className="fw-semibold">{technicalData.companyName}</td></tr>
                    <tr><td className="text-muted">GST Number:</td><td>{technicalData.gstNumber}</td></tr>
                    <tr><td className="text-muted">PAN Number:</td><td>{technicalData.panNumber}</td></tr>
                    <tr><td className="text-muted">Make in India Class:</td><td>{technicalData.makeIndiaClass}</td></tr>
                    <tr><td className="text-muted">Bidder Turnover:</td><td>₹ {formatNumber(technicalData.bidderTurnover)}</td></tr>
                    <tr><td className="text-muted">OEM Name:</td><td>{technicalData.oemName}</td></tr>
                    <tr><td className="text-muted">OEM Turnover:</td><td>₹ {formatNumber(technicalData.oemTurnover)}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h6 className="text-primary">Financial Details</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr><td className="text-muted">Total Bid Amount:</td><td className="fw-semibold">₹ {formatNumber(financialData.totalBidAmount)}</td></tr>
                    <tr><td className="text-muted">GST %:</td><td>{financialData.gstPercent}%</td></tr>
                    <tr><td className="text-muted">Total Cost:</td><td>₹ {formatNumber(financialData.totalCost)}</td></tr>
                    <tr><td className="text-muted">Bank Name:</td><td>{financialData.bankName}</td></tr>
                    <tr><td className="text-muted">EMD Number:</td><td>{financialData.emdNumber || "-"}</td></tr>
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
      {viewerDoc && (
  <DocumentViewer
    filePath={viewerDoc.filePath}
    fileName={viewerDoc.fileName}
    onClose={() => setViewerDoc(null)}
  />
)}
    </div>
  );
};

export default BidSubmission;