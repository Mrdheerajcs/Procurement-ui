import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";

const TenderApproval = () => {
  const [pendingTenders, setPendingTenders] = useState([]);
  const [approvedTenders, setApprovedTenders] = useState([]);
  const [rejectedTenders, setRejectedTenders] = useState([]);
  const [publishedTenders, setPublishedTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedTender, setSelectedTender] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(""); // approve, reject
  
  // ✅ NEW: View Details Modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTender, setViewTender] = useState(null);
  const [tenderDocuments, setTenderDocuments] = useState([]);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const pendingRes = await apiClient.get("/api/tenders/by-status/PENDING_APPROVAL");
      if (pendingRes.status === "SUCCESS") setPendingTenders(pendingRes.data);

      const approvedRes = await apiClient.get("/api/tenders/by-status/APPROVED");
      if (approvedRes.status === "SUCCESS") setApprovedTenders(approvedRes.data);

      const rejectedRes = await apiClient.get("/api/tenders/by-status/REJECTED");
      if (rejectedRes.status === "SUCCESS") setRejectedTenders(rejectedRes.data);

      const publishedRes = await apiClient.get("/api/tenders/by-status/PUBLISHED");
      if (publishedRes.status === "SUCCESS") setPublishedTenders(publishedRes.data);
    } catch (err) {
      console.error("Error fetching tenders:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch tender documents
  const fetchTenderDocuments = async (tenderId) => {
    try {
      const res = await apiClient.get(`/api/tenders/${tenderId}/documents`);
      if (res.status === "SUCCESS") {
        setTenderDocuments(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setTenderDocuments([]);
    }
  };

  // ✅ NEW: Open View Details Modal
  const handleViewDetails = async (tender) => {
    setViewTender(tender);
    await fetchTenderDocuments(tender.tenderId);
    setShowViewModal(true);
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await apiClient.put(`/api/tenders/${selectedTender.tenderId}/approve`, null, {
        params: { remarks: approvalRemarks }
      });
      if (res.status === "SUCCESS") {
        alert("Tender approved successfully! You can now publish it.");
        setShowModal(false);
        setSelectedTender(null);
        setApprovalRemarks("");
        fetchTenders();
      }
    } catch (err) {
      console.error("Error approving tender:", err);
      alert("Failed to approve tender");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    
    setLoading(true);
    try {
      const res = await apiClient.put(`/api/tenders/${selectedTender.tenderId}/reject`, null, {
        params: { reason: rejectReason }
      });
      if (res.status === "SUCCESS") {
        alert("Tender rejected!");
        setShowModal(false);
        setSelectedTender(null);
        setRejectReason("");
        fetchTenders();
      }
    } catch (err) {
      console.error("Error rejecting tender:", err);
      alert("Failed to reject tender");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (tender) => {
    if (!window.confirm(`Are you sure you want to publish tender "${tender.tenderNo}"? Vendors will be able to see and bid on it.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.put(`/api/tenders/${tender.tenderId}/publish`);
      if (res.status === "SUCCESS") {
        alert("Tender published successfully! Vendors can now view and bid.");
        fetchTenders();
      } else {
        alert(res.message || "Failed to publish tender");
      }
    } catch (err) {
      console.error("Error publishing tender:", err);
      alert(err.message || "Failed to publish tender");
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (tender) => {
    setSelectedTender(tender);
    setModalAction("approve");
    setApprovalRemarks("");
    setShowModal(true);
  };

  const openRejectModal = (tender) => {
    setSelectedTender(tender);
    setModalAction("reject");
    setRejectReason("");
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "PENDING_APPROVAL": return <span className="badge bg-warning text-dark">Pending Approval</span>;
      case "APPROVED": return <span className="badge bg-success">Approved (Ready to Publish)</span>;
      case "REJECTED": return <span className="badge bg-danger">Rejected</span>;
      case "PUBLISHED": return <span className="badge bg-primary">Published ✓</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹ 0";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const getTendersForTab = () => {
    switch(activeTab) {
      case "pending": return pendingTenders;
      case "approved": return approvedTenders;
      case "rejected": return rejectedTenders;
      case "published": return publishedTenders;
      default: return [];
    }
  };

  const getTabCount = (tab) => {
    switch(tab) {
      case "pending": return pendingTenders.length;
      case "approved": return approvedTenders.length;
      case "rejected": return rejectedTenders.length;
      case "published": return publishedTenders.length;
      default: return 0;
    }
  };

  // ✅ Helper to get document icon based on file type
  const getFileIcon = (fileName) => {
    if (fileName?.toLowerCase().includes('.pdf')) return <i className="bi bi-file-pdf-fill text-danger" />;
    if (fileName?.toLowerCase().includes('.xlsx') || fileName?.toLowerCase().includes('.xls')) return <i className="bi bi-file-excel-fill text-success" />;
    if (fileName?.toLowerCase().includes('.doc') || fileName?.toLowerCase().includes('.docx')) return <i className="bi bi-file-word-fill text-primary" />;
    return <i className="bi bi-file-earmark-fill" />;
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Tender Approval & Publishing</h1>
        <p className="text-muted-soft">Review, approve, and publish tenders for vendors</p>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}>
            Pending Approval <span className="badge bg-warning ms-2">{getTabCount("pending")}</span>
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "approved" ? "active" : ""}`} onClick={() => setActiveTab("approved")}>
            Ready to Publish <span className="badge bg-success ms-2">{getTabCount("approved")}</span>
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "published" ? "active" : ""}`} onClick={() => setActiveTab("published")}>
            Published <span className="badge bg-primary ms-2">{getTabCount("published")}</span>
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "rejected" ? "active" : ""}`} onClick={() => setActiveTab("rejected")}>
            Rejected <span className="badge bg-danger ms-2">{getTabCount("rejected")}</span>
          </button>
        </li>
      </ul>

      {/* Tenders Table */}
      <div className="card">
        <div className="card-header">
          <h6 className="mb-0 fw-semibold">
            {activeTab === "pending" && "Tenders Awaiting Approval"}
            {activeTab === "approved" && "Approved Tenders - Click Publish to make live"}
            {activeTab === "published" && "Published Tenders (Visible to Vendors)"}
            {activeTab === "rejected" && "Rejected Tenders"}
          </h6>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tender No</th>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Publish Date</th>
                    <th>Bid End Date</th>
                    <th>Status</th>
                    <th>Submitted By</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {getTendersForTab().length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-5 text-muted-soft">
                        <i className="bi bi-inbox fs-3 d-block mb-2" />No tenders found
                       </td>
                     </tr>
                  ) : (
                    getTendersForTab().map((tender) => (
                      <tr key={tender.tenderId}>
                        <td className="fw-semibold text-primary">{tender.tenderNo}</td>
                        <td>{tender.tenderTitle}</td>
                        <td>{tender.department}</td>
                        <td>{formatDate(tender.publishDate)}</td>
                        <td>{formatDate(tender.bidEndDate)}</td>
                        <td>{getStatusBadge(tender.tenderStatus)}</td>
                        <td>{tender.createdBy || "-"}</td>
                        <td className="text-center">
                          {/* ✅ NEW: View Details Button */}
                          <button 
                            className="btn btn-sm btn-info me-1" 
                            onClick={() => handleViewDetails(tender)}
                            title="View Tender Details"
                          >
                            <i className="bi bi-eye" /> View
                          </button>
                          {activeTab === "pending" && (
                            <>
                              <button className="btn btn-sm btn-success me-1" onClick={() => openApproveModal(tender)}>
                                <i className="bi bi-check-lg" /> Approve
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => openRejectModal(tender)}>
                                <i className="bi bi-x-lg" /> Reject
                              </button>
                            </>
                          )}
                          {activeTab === "approved" && (
                            <button className="btn btn-sm btn-primary" onClick={() => handlePublish(tender)}>
                              <i className="bi bi-globe me-1" /> Publish to Vendors
                            </button>
                          )}
                          {activeTab === "published" && (
                            <span className="badge bg-primary">Live ✓</span>
                          )}
                          {activeTab === "rejected" && tender.rejectionReason && (
                            <span className="text-muted small" title={tender.rejectionReason}>
                              <i className="bi bi-info-circle" /> {tender.rejectionReason.length > 30 ? tender.rejectionReason.substring(0, 30) + "..." : tender.rejectionReason}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ✅ NEW: View Details Modal */}
      {showViewModal && viewTender && (
        <div className="modal-overlay" style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <div className="modal-container" style={{
            backgroundColor: "white", borderRadius: "12px",
            width: "900px", maxWidth: "95%", maxHeight: "90%", overflow: "auto"
          }}>
            <div className="modal-header" style={{
              padding: "16px 20px", borderBottom: "1px solid #e5e7eb",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <h5 className="modal-title">Tender Details - {viewTender.tenderNo}</h5>
              <button className="btn-close" onClick={() => setShowViewModal(false)} style={{ background: "none", border: "none", fontSize: "20px" }}>×</button>
            </div>
            <div className="modal-body" style={{ padding: "20px" }}>
              
              {/* Basic Information */}
              <div className="card mb-3">
                <div className="card-header bg-light">
                  <h6 className="mb-0">Basic Information</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4"><small className="text-muted">Tender Title</small><div className="fw-semibold">{viewTender.tenderTitle}</div></div>
                    <div className="col-md-4"><small className="text-muted">Tender Type</small><div>{viewTender.tenderType || "-"}</div></div>
                    <div className="col-md-4"><small className="text-muted">Bid Type</small><div>{viewTender.bidType || "Two Bid"}</div></div>
                    <div className="col-md-4"><small className="text-muted">BOQ Type</small><div>{viewTender.boqType || "Item Rate"}</div></div>
                    <div className="col-md-4"><small className="text-muted">Department</small><div>{viewTender.department || "-"}</div></div>
                    <div className="col-md-4"><small className="text-muted">Project</small><div>{viewTender.projectName || "-"}</div></div>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="card mb-3">
                <div className="card-header bg-light">
                  <h6 className="mb-0">Financial Details</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3"><small className="text-muted">Estimated Value</small><div className="fw-semibold">{formatCurrency(viewTender.estimatedValue)}</div></div>
                    <div className="col-md-3"><small className="text-muted">EMD Amount</small><div>{formatCurrency(viewTender.emdAmount)}</div></div>
                    <div className="col-md-3"><small className="text-muted">Tender Fee</small><div>{formatCurrency(viewTender.tenderFee)}</div></div>
                    <div className="col-md-3"><small className="text-muted">Bid Validity</small><div>{viewTender.bidValidity || "30"} days</div></div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="card mb-3">
                <div className="card-header bg-light">
                  <h6 className="mb-0">Tender Timeline</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3"><small className="text-muted">Publish Date</small><div>{formatDate(viewTender.publishDate)}</div></div>
                    <div className="col-md-3"><small className="text-muted">Closing Date</small><div>{formatDate(viewTender.bidEndDate)}</div></div>
                    <div className="col-md-3"><small className="text-muted">Bid Time</small><div>{viewTender.bidSubmissionEndTime || "17:00"}</div></div>
                    <div className="col-md-3"><small className="text-muted">Pre-bid Meeting</small><div>{formatDate(viewTender.preBidMeetingDate)}</div></div>
                    <div className="col-md-3"><small className="text-muted">Technical Opening</small><div>{formatDate(viewTender.techBidOpenDate)}</div></div>
                    <div className="col-md-3"><small className="text-muted">Financial Opening</small><div>{formatDate(viewTender.finBidOpenDate)}</div></div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {viewTender.tenderDescription && (
                <div className="card mb-3">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">Description</h6>
                  </div>
                  <div className="card-body">
                    <p className="mb-0">{viewTender.tenderDescription}</p>
                  </div>
                </div>
              )}

              {/* ✅ Uploaded Documents */}
              <div className="card">
                <div className="card-header bg-light">
                  <h6 className="mb-0">Uploaded Documents</h6>
                </div>
                <div className="card-body">
                  {tenderDocuments.length === 0 ? (
                    <p className="text-muted mb-0">No documents uploaded</p>
                  ) : (
                    <div className="list-group">
                      {tenderDocuments.map((doc, idx) => (
                        <div key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            {getFileIcon(doc.fileName)}
                            <span className="ms-2">{doc.fileName}</span>
                            <small className="text-muted d-block">{doc.fileType}</small>
                          </div>
                          <a 
                            href={`http://localhost:8080/api/files/download?path=${encodeURIComponent(doc.filePath)}`} 
                            className="btn btn-sm btn-outline-primary"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="bi bi-download me-1" /> Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: "16px 20px", borderTop: "1px solid #e5e7eb" }}>
              <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalAction === "approve" ? "Approve Tender" : "Reject Tender"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <p>
                  <strong>Tender:</strong> {selectedTender?.tenderNo} - {selectedTender?.tenderTitle}
                </p>
                
                {modalAction === "approve" ? (
                  <div className="mb-3">
                    <label className="form-label">Remarks (Optional)</label>
                    <textarea className="form-control" rows="3" value={approvalRemarks} onChange={(e) => setApprovalRemarks(e.target.value)} placeholder="Add any remarks..." />
                    <small className="text-muted">After approval, you can publish the tender from the "Ready to Publish" tab.</small>
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="form-label">Rejection Reason <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows="3" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Please provide reason for rejection..." required />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className={modalAction === "approve" ? "btn btn-success" : "btn btn-danger"} onClick={modalAction === "approve" ? handleApprove : handleReject} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                  {modalAction === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderApproval;