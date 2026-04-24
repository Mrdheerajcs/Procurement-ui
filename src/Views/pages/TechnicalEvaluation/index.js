import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";
import DocumentViewer from "../../../Components/DocumentViewer";

const TechnicalEvaluation = () => {
  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Evaluation Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [modalAction, setModalAction] = useState("");
  const [evaluationScore, setEvaluationScore] = useState("");
  const [evaluationRemarks, setEvaluationRemarks] = useState("");
  const [viewerDoc, setViewerDoc] = useState(null);

  // Clarification specific states
  const [clarificationDeadline, setClarificationDeadline] = useState("");
  const [clarificationQuestion, setClarificationQuestion] = useState("");

  // Bid Details Modal states
  const [showBidDetailsModal, setShowBidDetailsModal] = useState(false);
  const [selectedBidDetails, setSelectedBidDetails] = useState(null);
  const [bidDocuments, setBidDocuments] = useState({});

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/tenders/all");
      if (res.status === "SUCCESS") {
        setTenders(res.data);
      }
    } catch (err) {
      console.error("Error fetching tenders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFileNameFromPath = (path) => {
  if (!path) return "";
  return path.split(/[/\\]/).pop();
};

const getSafeFilePath = (doc) => {
  if (!doc) return "";
  if (typeof doc === "string") return doc;
  return doc.filePath || "";
};

  const fetchBidsForTender = async (tenderId) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/bids/technical/tender/${tenderId}`);
      if (res.status === "SUCCESS") {
        setBids(res.data);
      }
    } catch (err) {
      console.error("Error fetching bids:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBidDocuments = async (bidTechnicalId) => {
    try {
      const res = await apiClient.get(`/api/bids/technical/documents/${bidTechnicalId}`);
      if (res.status === "SUCCESS") {
        return res.data;
      }
    } catch (err) {
      console.error("Error fetching bid documents:", err);
    }
    return {};
  };

  const handleSelectTender = (tender) => {
    setSelectedTender(tender);
    fetchBidsForTender(tender.tenderId);
  };

  const openEvaluationModal = (bid, action) => {
    setSelectedBid(bid);
    setModalAction(action);
    setEvaluationScore("");
    setEvaluationRemarks("");
    setClarificationDeadline("");
    setClarificationQuestion("");
    setShowModal(true);
  };

  const handleEvaluate = async () => {
    if (!selectedBid) return;

    if (modalAction === "disqualify" && !evaluationRemarks.trim()) {
      alert("Please provide reason for disqualification");
      return;
    }

    setEvaluating(true);

    let status = "";
    let score = null;
    let remarks = evaluationRemarks;

    switch (modalAction) {
      case "qualify":
        status = "QUALIFIED";
        score = parseInt(evaluationScore) || 75;
        if (!remarks) remarks = "Technically qualified";
        break;
      case "disqualify":
        status = "DISQUALIFIED";
        if (!remarks) remarks = "Does not meet technical criteria";
        break;
      default:
        status = "PENDING";
    }

    try {
      const res = await apiClient.put(`/api/bids/technical/${selectedBid.bidTechnicalId}/evaluate`, null, {
        params: { status, score, remarks }
      });

      if (res.status === "SUCCESS") {
        alert(`Bid ${modalAction === "qualify" ? "Qualified" : "Disqualified"} successfully`);
        setShowModal(false);
        setSelectedBid(null);
        await fetchBidsForTender(selectedTender.tenderId);
      } else {
        alert(res.message || "Evaluation failed");
      }
    } catch (err) {
      console.error("Error evaluating bid:", err);
      alert(err.message || "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  const handleClarificationRequest = async () => {
    if (!selectedBid) return;

    if (!clarificationQuestion.trim()) {
      alert("Please provide clarification question");
      return;
    }

    if (!clarificationDeadline) {
      alert("Please set a response deadline");
      return;
    }

    setEvaluating(true);

    try {
      const res = await apiClient.post("/api/bids/technical/clarification/request", {
        bidTechnicalId: selectedBid.bidTechnicalId,
        question: clarificationQuestion,
        deadline: clarificationDeadline
      });

      if (res.status === "SUCCESS") {
        alert("Clarification request sent to vendor successfully");
        setShowModal(false);
        setSelectedBid(null);
        await fetchBidsForTender(selectedTender.tenderId);
      } else {
        alert(res.message || "Failed to send clarification");
      }
    } catch (err) {
      console.error("Error sending clarification:", err);
      alert(err.message || "Failed to send clarification");
    } finally {
      setEvaluating(false);
    }
  };

  const viewBidDetails = async (bid) => {
    setLoading(true);
    try {
      // Fetch bid details
      const res = await apiClient.get(`/api/bids/technical/details/${bid.bidTechnicalId}`);
      if (res.status === "SUCCESS") {
        setSelectedBidDetails(res.data);
        
        // Fetch documents separately
        const docsRes = await apiClient.get(`/api/bids/technical/documents/${bid.bidTechnicalId}`);
        if (docsRes.status === "SUCCESS") {
          setBidDocuments(docsRes.data);
        }
        
        setShowBidDetailsModal(true);
      }
    } catch (err) {
      console.error("Error fetching bid details:", err);
      alert("Failed to load bid details");
    } finally {
      setLoading(false);
    }
  };

  const handleRevealFinancial = async () => {
    if (!window.confirm("Are you sure you want to reveal all financial bids? This action cannot be undone.")) return;

    try {
      const checkRes = await apiClient.get(`/api/bids/technical/all-evaluated/${selectedTender.tenderId}`);
      if (checkRes.status === "SUCCESS" && !checkRes.data) {
        alert("Cannot reveal financial bids yet. Please evaluate all vendors first.");
        return;
      }
    } catch (err) {
      console.error("Error checking evaluation status:", err);
    }

    setLoading(true);
    try {
      const res = await apiClient.post(`/api/bids/financial/reveal/${selectedTender.tenderId}`);
      if (res.status === "SUCCESS") {
        alert("Financial bids revealed successfully! Now you can proceed to Commercial Evaluation.");
      }
    } catch (err) {
      console.error("Error revealing financial bids:", err);
      alert("Failed to reveal financial bids");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "QUALIFIED": return <span className="badge bg-success">✓ Qualified</span>;
      case "DISQUALIFIED": return <span className="badge bg-danger">✗ Disqualified</span>;
      case "CLARIFICATION_NEEDED": return <span className="badge bg-warning text-dark">⚠ Clarification Needed</span>;
      case "PENDING": return <span className="badge bg-secondary">⏳ Pending</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getFileIcon = (fileName) => {
    if (fileName?.toLowerCase().includes('.pdf')) return <i className="bi bi-file-pdf-fill text-danger" />;
    if (fileName?.toLowerCase().includes('.xlsx') || fileName?.toLowerCase().includes('.xls')) return <i className="bi bi-file-excel-fill text-success" />;
    if (fileName?.toLowerCase().includes('.doc') || fileName?.toLowerCase().includes('.docx')) return <i className="bi bi-file-word-fill text-primary" />;
    if (fileName?.toLowerCase().includes('.jpg') || fileName?.toLowerCase().includes('.png')) return <i className="bi bi-file-image-fill text-info" />;
    return <i className="bi bi-file-earmark-fill" />;
  };

  const getActionButtons = (bid) => {
    if (bid.evaluationStatus === "CLARIFICATION_NEEDED") {
      return (
        <span className="badge bg-warning text-dark">
          Awaiting Vendor Response
          {bid.clarificationDeadline && (
            <small className="d-block">Due: {new Date(bid.clarificationDeadline).toLocaleString()}</small>
          )}
        </span>
      );
    }

    if (bid.evaluationStatus !== "PENDING") {
      return <span className="text-muted">Evaluated</span>;
    }

    return (
      <div className="d-flex gap-2 flex-wrap">
        <button className="btn btn-sm btn-info" onClick={() => viewBidDetails(bid)} title="View Bid Details">
          <i className="bi bi-eye" /> View
        </button>
        <button className="btn btn-sm btn-success" onClick={() => openEvaluationModal(bid, "qualify")}>
          <i className="bi bi-check-lg" /> Approve
        </button>
        <button className="btn btn-sm btn-danger" onClick={() => openEvaluationModal(bid, "disqualify")}>
          <i className="bi bi-x-lg" /> Reject
        </button>
        <button className="btn btn-sm btn-warning" onClick={() => openEvaluationModal(bid, "clarification")}>
          <i className="bi bi-question-lg" /> Clarify
        </button>
      </div>
    );
  };

  const filteredTenders = tenders.filter(t =>
    t.tenderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tenderTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const qualifiedCount = bids.filter(b => b.evaluationStatus === "QUALIFIED").length;
  const pendingCount = bids.filter(b => b.evaluationStatus === "PENDING").length;
  const allEvaluated = bids.length > 0 && bids.every(b => b.evaluationStatus !== "PENDING");

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Technical Evaluation</h1>
        <p className="text-muted-soft">Evaluate vendor technical bids - Approve, Reject, or Request Clarification</p>
      </div>

      {!selectedTender ? (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">Tenders with Submitted Bids</h6>
            <div className="input-group" style={{ maxWidth: "300px" }}>
              <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
              <input type="search" className="form-control" placeholder="Search tenders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Tender No</th><th>Title</th><th>Department</th><th>Bids Received</th><th className="text-center">Action</th></tr>
                </thead>
                <tbody>
                  {filteredTenders.length === 0 ? (
                    <td><td colSpan={5} className="text-center py-5 text-muted-soft">No tenders found</td></td>
                  ) : (
                    filteredTenders.map(t => (
                      <tr key={t.tenderId}>
                        <td className="fw-semibold text-primary">{t.tenderNo}</td>
                        <td>{t.tenderTitle}</td>
                        <td>{t.department || "-"}</td>
                        <td><span className="badge bg-primary">{t.bidCount || 0}</span></td>
                        <td className="text-center">
                          <button className="btn btn-sm btn-primary" onClick={() => handleSelectTender(t)}>
                            <i className="bi bi-clipboard-check me-1" />Evaluate Bids
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => setSelectedTender(null)}>
            <i className="bi bi-arrow-left me-2" />Back to Tenders
          </button>

          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">{selectedTender.tenderNo} - {selectedTender.tenderTitle}</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3"><small className="text-muted">Department</small><div>{selectedTender.department || "-"}</div></div>
                <div className="col-md-3"><small className="text-muted">Project</small><div>{selectedTender.projectName || "-"}</div></div>
                <div className="col-md-3"><small className="text-muted">Total Bids</small><div><span className="badge bg-primary">{bids.length}</span></div></div>
                <div className="col-md-3"><small className="text-muted">Qualified</small><div><span className="badge bg-success">{qualifiedCount}</span> / {bids.length}</div></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold">Vendor Technical Bids</h6>
              {bids.length > 0 && allEvaluated && qualifiedCount > 0 && (
                <button className="btn btn-warning btn-sm" onClick={handleRevealFinancial} disabled={loading}>
                  <i className="bi bi-eye me-1" />Reveal Financial Bids
                </button>
              )}
              {bids.length > 0 && !allEvaluated && (
                <span className="text-muted small"><i className="bi bi-info-circle me-1" />{pendingCount} vendor(s) pending evaluation.</span>
              )}
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr><th>Vendor Name</th><th>GST</th><th>Make in India</th><th>Bidder Turnover</th><th>OEM Name</th><th>Status</th><th>Score</th><th>Remarks</th><th className="text-center">Action</th></tr>
                  </thead>
                  <tbody>
                    {bids.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-5 text-muted-soft">No bids submitted yet</td></tr>
                    ) : (
                      bids.map((bid) => (
                        <tr key={bid.bidTechnicalId}>
                          <td className="fw-semibold">{bid.vendorName}</td>
                          <td><code>{bid.gstNumber}</code></td>
                          <td>{bid.makeIndiaClass}</td>
                          <td>₹ {bid.bidderTurnover?.toLocaleString()}</td>
                          <td>{bid.oemName}</td>
                          <td>{getStatusBadge(bid.evaluationStatus)}</td>
                          <td>{bid.evaluationScore || "-"}</td>
                          <td className="text-muted small">{bid.evaluationRemarks || "-"}</td>
                          <td className="text-center">{getActionButtons(bid)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Modal - Approve/Reject */}
      {showModal && modalAction !== "clarification" && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="modal-container" style={{ backgroundColor: "white", borderRadius: "12px", width: "500px", maxWidth: "90%", maxHeight: "90%", overflow: "auto" }}>
            <div className="modal-header" style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h5 className="modal-title">{modalAction === "qualify" ? "✓ Approve / Qualify Vendor" : "✗ Reject / Disqualify Vendor"}</h5>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: "20px" }}>
              <p><strong>Vendor:</strong> {selectedBid?.vendorName}</p>
              <p><strong>Tender:</strong> {selectedTender?.tenderNo}</p>
              {modalAction === "qualify" && (
                <div className="mb-3">
                  <label className="form-label">Technical Score (0-100)</label>
                  <input type="number" className="form-control" min="0" max="100" value={evaluationScore} onChange={(e) => setEvaluationScore(e.target.value)} />
                  <small className="text-muted">Default: 75</small>
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">{modalAction === "qualify" ? "Remarks (Optional)" : "Rejection Reason *"}</label>
                <textarea className="form-control" rows="3" value={evaluationRemarks} onChange={(e) => setEvaluationRemarks(e.target.value)} placeholder={modalAction === "qualify" ? "Add any remarks..." : "Please provide detailed reason..."} />
              </div>
            </div>
            <div className="modal-footer" style={{ padding: "16px 20px", borderTop: "1px solid #e5e7eb" }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className={`btn ${modalAction === "qualify" ? "btn-success" : "btn-danger"}`} onClick={handleEvaluate} disabled={evaluating}>
                {evaluating ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                {modalAction === "qualify" ? "✓ Approve" : "✗ Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Modal */}
      {showModal && modalAction === "clarification" && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="modal-container" style={{ backgroundColor: "white", borderRadius: "12px", width: "550px", maxWidth: "90%", maxHeight: "90%", overflow: "auto" }}>
            <div className="modal-header" style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h5 className="modal-title">⚠ Request Clarification from Vendor</h5>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: "20px" }}>
              <p><strong>Vendor:</strong> {selectedBid?.vendorName}</p>
              <p><strong>Tender:</strong> {selectedTender?.tenderNo}</p>
              <div className="mb-3">
                <label className="form-label">Question for Vendor *</label>
                <textarea className="form-control" rows="4" value={clarificationQuestion} onChange={(e) => setClarificationQuestion(e.target.value)} placeholder="Please describe what clarification is needed in detail..." />
              </div>
              <div className="mb-3">
                <label className="form-label">Response Deadline *</label>
                <input type="datetime-local" className="form-control" value={clarificationDeadline} onChange={(e) => setClarificationDeadline(e.target.value)} />
                <small className="text-muted">Vendor must respond by this date and time</small>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: "16px 20px", borderTop: "1px solid #e5e7eb" }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-warning" onClick={handleClarificationRequest} disabled={evaluating}>
                {evaluating ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                Send Clarification Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bid Details Modal with Documents */}
      {showBidDetailsModal && selectedBidDetails && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="modal-container" style={{ backgroundColor: "white", borderRadius: "12px", width: "900px", maxWidth: "95%", maxHeight: "90%", overflow: "auto" }}>
            <div className="modal-header" style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h5 className="modal-title">Bid Details - {selectedBidDetails.vendorName}</h5>
              <button className="btn-close" onClick={() => setShowBidDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: "20px" }}>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-primary">Company Details</h6>
                  <table className="table table-sm table-bordered">
                    <tbody>
                      <tr><td style={{ width: "40%" }}><strong>Company Name:</strong></td><td>{selectedBidDetails.companyName}</td></tr>
                      <tr><td><strong>GST Number:</strong></td><td>{selectedBidDetails.gstNumber}</td></tr>
                      <tr><td><strong>PAN Number:</strong></td><td>{selectedBidDetails.panNumber}</td></tr>
                      <tr><td><strong>Make in India Class:</strong></td><td>{selectedBidDetails.makeIndiaClass}</td></tr>
                      <tr><td><strong>Bidder Turnover:</strong></td><td>₹ {selectedBidDetails.bidderTurnover?.toLocaleString()}</td></tr>
                      <tr><td><strong>OEM Name:</strong></td><td>{selectedBidDetails.oemName}</td></tr>
                      <tr><td><strong>OEM Turnover:</strong></td><td>₹ {selectedBidDetails.oemTurnover?.toLocaleString()}</td></tr>
                      <tr><td><strong>Authorization:</strong></td><td>{selectedBidDetails.authorizationDetails}</td></tr>
                      {selectedBidDetails.isMsme && <tr><td><strong>MSME Number:</strong></td><td>{selectedBidDetails.msmeNumber}</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h6 className="text-primary">Evaluation Status</h6>
                  <table className="table table-sm table-bordered">
                    <tbody>
                      <tr><td style={{ width: "40%" }}><strong>Status:</strong></td><td>{getStatusBadge(selectedBidDetails.evaluationStatus)}</td></tr>
                      {selectedBidDetails.evaluationScore && <tr><td><strong>Score:</strong></td><td>{selectedBidDetails.evaluationScore}</td></tr>}
                      {selectedBidDetails.evaluationRemarks && <tr><td><strong>Remarks:</strong></td><td>{selectedBidDetails.evaluationRemarks}</td></tr>}
                      {selectedBidDetails.clarificationQuestion && (
                        <>
                          <tr><td><strong>Clarification Question:</strong></td><td>{selectedBidDetails.clarificationQuestion}</td></tr>
                          <tr><td><strong>Deadline:</strong></td><td>{new Date(selectedBidDetails.clarificationDeadline).toLocaleString()}</td></tr>
                          {selectedBidDetails.vendorResponse && <tr><td><strong>Vendor Response:</strong></td><td>{selectedBidDetails.vendorResponse}</td></tr>}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

             {/* Uploaded Documents Section */}
<div className="mt-4">
    <h6 className="text-primary">Uploaded Documents</h6>
    <div className="row">
        {/* Technical Documents with Labels */}
        <div className="col-md-6">
            <div className="card bg-light">
                <div className="card-header">
                    <strong>Technical Documents</strong>
                </div>
                <div className="card-body">
                    {/* Experience Certificate */}
                    <div className="mb-2">
                        <strong>📄 Experience Certificate:</strong>
                        {bidDocuments["Experience Certificate"] ? (
                            <div className="mt-1">
                                <span className="ms-2">{bidDocuments["Experience Certificate"].displayName}</span>
                                <button 
                                    className="btn btn-sm btn-outline-primary ms-2"
                                    onClick={() =>
  setViewerDoc({
    filePath: getSafeFilePath(bidDocuments["Experience Certificate"]),
    fileName:
      bidDocuments["Experience Certificate"]?.displayName ||
      getFileNameFromPath(bidDocuments["Experience Certificate"]?.filePath)
  })
}
                                >
                                    <i className="bi bi-eye" /> View
                                </button>
                            </div>
                        ) : <p className="text-muted">Not uploaded</p>}
                    </div>
                    
                    {/* OEM Authorization */}
                    <div className="mb-2">
                        <strong>🔑 OEM Authorization Letter:</strong>
                        {bidDocuments["OEM Authorization Letter"] ? (
                            <div className="mt-1">
                                <span className="ms-2">{bidDocuments["OEM Authorization Letter"].displayName}</span>
                                <button 
                                    className="btn btn-sm btn-outline-primary ms-2"
                                    onClick={() => setViewerDoc({ 
                                        filePath: bidDocuments["OEM Authorization Letter"].filePath, 
                                        fileName: bidDocuments["OEM Authorization Letter"].displayName 
                                    })}
                                >
                                    <i className="bi bi-eye" /> View
                                </button>
                            </div>
                        ) : <p className="text-muted">Not uploaded</p>}
                    </div>
                    
                    {/* GST Certificate */}
                    <div className="mb-2">
                        <strong>💰 GST Certificate:</strong>
                        {bidDocuments["GST Certificate"] ? (
                            <div className="mt-1">
                                <span className="ms-2">{bidDocuments["GST Certificate"].displayName}</span>
                                <button 
                                    className="btn btn-sm btn-outline-primary ms-2"
                                    onClick={() => setViewerDoc({ 
                                        filePath: bidDocuments["GST Certificate"].filePath, 
fileName:
  bidDocuments["GST Certificate"].displayName ||
  getFileNameFromPath(bidDocuments["GST Certificate"].filePath)                                    })}
                                >
                                    <i className="bi bi-eye" /> View
                                </button>
                            </div>
                        ) : <p className="text-muted">Not uploaded</p>}
                    </div>
                    
                    {/* PAN Card */}
                    <div className="mb-2">
                        <strong>🆔 PAN Card:</strong>
                        {bidDocuments["PAN Card"] ? (
                            <div className="mt-1">
                                <span className="ms-2">{bidDocuments["PAN Card"].displayName}</span>
                                <button 
                                    className="btn btn-sm btn-outline-primary ms-2"
                                    onClick={() => setViewerDoc({ 
                                        filePath: bidDocuments["PAN Card"].filePath, 
                                        fileName: bidDocuments["PAN Card"].displayName 
                                    })}
                                >
                                    <i className="bi bi-eye" /> View
                                </button>
                            </div>
                        ) : <p className="text-muted">Not uploaded</p>}
                    </div>
                    
                    {/* MSME Certificate */}
                    <div className="mb-2">
                        <strong>🏭 MSME Certificate:</strong>
                        {bidDocuments["MSME Certificate"] ? (
                            <div className="mt-1">
                                <span className="ms-2">{bidDocuments["MSME Certificate"].displayName}</span>
                                <button 
                                    className="btn btn-sm btn-outline-primary ms-2"
                                    onClick={() => setViewerDoc({ 
                                        filePath: bidDocuments["MSME Certificate"].filePath, 
                                        fileName: bidDocuments["MSME Certificate"].displayName 
                                    })}
                                >
                                    <i className="bi bi-eye" /> View
                                </button>
                            </div>
                        ) : <p className="text-muted">Not uploaded</p>}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Other Documents */}
        <div className="col-md-6">
            <div className="card bg-light">
                <div className="card-header">
                    <strong>Other Documents</strong>
                </div>
                <div className="card-body">
                    {bidDocuments["Other Documents"] && bidDocuments["Other Documents"].length > 0 ? (
                        bidDocuments["Other Documents"].map((doc, idx) => (
                            <div key={idx} className="mb-2">
                                <span>📎 {doc.displayName}</span>
                                <button 
                                    className="btn btn-sm btn-outline-primary ms-2"
                                    onClick={() => setViewerDoc({ filePath: doc.filePath, fileName: doc.displayName })}
                                >
                                    <i className="bi bi-eye" /> View
                                </button>
                            </div>
                        ))
                    ) : <p className="text-muted">No other documents uploaded</p>}
                </div>
            </div>
        </div>
    </div>
</div>
            </div>
            <div className="modal-footer" style={{ padding: "16px 20px", borderTop: "1px solid #e5e7eb" }}>
              <button className="btn btn-secondary" onClick={() => setShowBidDetailsModal(false)}>Close</button>
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

export default TechnicalEvaluation;