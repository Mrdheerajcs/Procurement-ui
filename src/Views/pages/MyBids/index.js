import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";
import { useNavigate } from "react-router-dom";
import DocumentViewer from "../../../Components/DocumentViewer";

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);
  const [selectedBid, setSelectedBid] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [financialDetails, setFinancialDetails] = useState(null);
  const [viewerDoc, setViewerDoc] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      const res = await apiClient.get("/api/bids/my-bids");
      if (res.status === "SUCCESS") {
        setBids(res.data);
      }
    } catch (err) {
      console.error("Error fetching bids:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialDetails = async (tenderId, bidTechnicalId) => {
    try {
      const res = await apiClient.get(`/api/bids/financial/tender/${tenderId}`);
      if (res.status === "SUCCESS") {
        const financial = res.data.find(f => f.bidTechnicalId === bidTechnicalId);
        setFinancialDetails(financial);
      }
    } catch (err) {
      console.error("Error fetching financial details:", err);
    }
  };

  const handleViewDetails = async (bid) => {
    setSelectedBid(bid);
    await fetchFinancialDetails(bid.tenderId, bid.bidTechnicalId);
    setShowDetailsModal(true);
  };

  const handleWithdraw = async (bidId, reason) => {
    if (!window.confirm("Are you sure you want to withdraw this bid? This action cannot be undone.")) return;

    setWithdrawing(bidId);
    try {
      const res = await apiClient.put(`/api/bids/withdraw/${bidId}`, null, {
        params: { reason: reason || "Withdrawn by vendor" }
      });
      if (res.status === "SUCCESS") {
        alert("Bid withdrawn successfully");
        fetchMyBids();
      }
    } catch (err) {
      alert(err.message || "Failed to withdraw bid");
    } finally {
      setWithdrawing(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "QUALIFIED": return <span className="badge bg-success">✓ Qualified</span>;
      case "DISQUALIFIED": return <span className="badge bg-danger">✗ Disqualified</span>;
      case "CLARIFICATION_NEEDED": return <span className="badge bg-warning text-dark">⚠ Clarification Needed</span>;
      case "WITHDRAWN": return <span className="badge bg-secondary">🗑 Withdrawn</span>;
      case "PENDING": return <span className="badge bg-secondary">⏳ Pending</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹ 0";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const getFileIcon = (fileName) => {
    if (fileName?.toLowerCase().includes('.pdf')) return <i className="bi bi-file-pdf-fill text-danger" />;
    if (fileName?.toLowerCase().includes('.xlsx')) return <i className="bi bi-file-excel-fill text-success" />;
    if (fileName?.toLowerCase().includes('.doc')) return <i className="bi bi-file-word-fill text-primary" />;
    return <i className="bi bi-file-earmark-fill" />;
  };

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">My Bids</h1>
        <p className="text-muted-soft">Track your submitted bids, view financial details, and download documents</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-center bg-primary text-white">
            <div className="card-body">
              <h2>{bids.length}</h2>
              <p className="mb-0">Total Bids Submitted</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-success text-white">
            <div className="card-body">
              <h2>{bids.filter(b => b.evaluationStatus === "QUALIFIED").length}</h2>
              <p className="mb-0">Qualified</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-danger text-white">
            <div className="card-body">
              <h2>{bids.filter(b => b.evaluationStatus === "DISQUALIFIED").length}</h2>
              <p className="mb-0">Disqualified</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-warning text-dark">
            <div className="card-body">
              <h2>{bids.filter(b => b.evaluationStatus === "CLARIFICATION_NEEDED").length}</h2>
              <p className="mb-0">Clarification Needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bids Table */}
      <div className="card">
        <div className="card-header">
          <h6 className="mb-0 fw-semibold">All Bids</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tender No</th>
                  <th>Tender Title</th>
                  <th>Submitted On</th>
                  <th>Technical Status</th>
                  <th>Score</th>
                  <th>Financial Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {bids.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-5">No bids submitted yet</td></tr>
                ) : (
                  bids.map((bid) => (
                    <tr key={bid.bidTechnicalId}>
                      <td className="fw-semibold text-primary">{bid.tenderNo}</td>
                      <td>{bid.tenderTitle}</td>
                      <td>{new Date(bid.submittedAt).toLocaleDateString()}</td>
                      <td>{getStatusBadge(bid.evaluationStatus)}</td>
                      <td>{bid.evaluationScore || "-"}</td>
                      <td>{bid.financialSubmitted ? <span className="badge bg-success">Submitted</span> : <span className="badge bg-secondary">Pending</span>}</td>
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          <button className="btn btn-sm btn-info" onClick={() => handleViewDetails(bid)} title="View Details">
                            <i className="bi bi-eye" />
                          </button>
                          {bid.evaluationStatus === "PENDING" && (
                            <button className="btn btn-sm btn-danger" onClick={() => handleWithdraw(bid.bidTechnicalId)} disabled={withdrawing === bid.bidTechnicalId} title="Withdraw Bid">
                              {withdrawing === bid.bidTechnicalId ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-x-lg" />}
                            </button>
                          )}
                          {bid.evaluationStatus === "CLARIFICATION_NEEDED" && (
                            <button className="btn btn-sm btn-warning" onClick={() => navigate(`/clarification-response/${bid.bidTechnicalId}`)} title="Respond to Clarification">
                              <i className="bi bi-chat-dots" />
                            </button>
                          )}
                        </div>
                      </td>
                      </tr>
                      ))
                  )}
                    </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bid Details Modal */}
      {showDetailsModal && selectedBid && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="modal-container" style={{ backgroundColor: "white", borderRadius: "12px", width: "800px", maxWidth: "95%", maxHeight: "90%", overflow: "auto" }}>
            <div className="modal-header" style={{ padding: "16px 20px", borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h5 className="modal-title">Bid Details - {selectedBid.tenderNo}</h5>
              <button className="btn-close" onClick={() => setShowDetailsModal(false)} style={{ background: "none", border: "none", fontSize: "20px" }}>×</button>
            </div>
            <div className="modal-body" style={{ padding: "20px" }}>
              {/* Technical Details */}
              <h6 className="text-primary">Technical Details</h6>
              <div className="row mb-4">
                <div className="col-md-6">
                  <table className="table table-sm">
                    <tbody>
                      <tr><td className="text-muted">Company Name:</td><td className="fw-semibold">{selectedBid.companyName}</td></tr>
                      <tr><td className="text-muted">GST Number:</td><td>{selectedBid.gstNumber}</td></tr>
                      <tr><td className="text-muted">PAN Number:</td><td>{selectedBid.panNumber}</td></tr>
                      <tr><td className="text-muted">Make in India Class:</td><td>{selectedBid.makeIndiaClass}</td></tr>
                      <tr><td className="text-muted">Bidder Turnover:</td><td>{formatCurrency(selectedBid.bidderTurnover)}</td></tr>
                      <tr><td className="text-muted">OEM Name:</td><td>{selectedBid.oemName}</td></tr>
                      <tr><td className="text-muted">OEM Turnover:</td><td>{formatCurrency(selectedBid.oemTurnover)}</td></tr>
                      <tr><td className="text-muted">Technical Score:</td><td>{selectedBid.evaluationScore || "Pending"}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h6 className="text-primary">Technical Documents</h6>
                  {selectedBid.experienceCertPath && <div><button className="btn btn-sm btn-link" onClick={() => setViewerDoc({ filePath: selectedBid.experienceCertPath, fileName: "Experience Certificate" })}>📄 Experience Certificate</button></div>}
                  {selectedBid.oemAuthPath && <div><button className="btn btn-sm btn-link" onClick={() => setViewerDoc({ filePath: selectedBid.oemAuthPath, fileName: "OEM Authorization" })}>📄 OEM Authorization</button></div>}
                  {selectedBid.gstCertPath && <div><button className="btn btn-sm btn-link" onClick={() => setViewerDoc({ filePath: selectedBid.gstCertPath, fileName: "GST Certificate" })}>📄 GST Certificate</button></div>}
                  {selectedBid.panCardPath && <div><button className="btn btn-sm btn-link" onClick={() => setViewerDoc({ filePath: selectedBid.panCardPath, fileName: "PAN Card" })}>📄 PAN Card</button></div>}
                  {selectedBid.msmeCertPath && <div><button className="btn btn-sm btn-link" onClick={() => setViewerDoc({ filePath: selectedBid.msmeCertPath, fileName: "MSME Certificate" })}>📄 MSME Certificate</button></div>}
                </div>
              </div>

              {/* Financial Details */}
              {financialDetails && (
                <>
                  <h6 className="text-primary mt-3">Financial Details</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <table className="table table-sm">
                        <tbody>
                          <tr><td className="text-muted">Total Bid Amount:</td><td className="fw-semibold">{formatCurrency(financialDetails.totalBidAmount)}</td></tr>
                          <tr><td className="text-muted">GST %:</td><td>{financialDetails.gstPercent}%</td></tr>
                          <tr><td className="text-muted">Total Cost:</td><td>{formatCurrency(financialDetails.totalCost)}</td></tr>
                          <tr><td className="text-muted">EMD Number:</td><td>{financialDetails.emdNumber || "-"}</td></tr>
                          <tr><td className="text-muted">EMD Value:</td><td>{formatCurrency(financialDetails.emdValue)}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-primary">Financial Documents</h6>
                      {financialDetails.boqFilePath && <div><button className="btn btn-sm btn-link" onClick={() => setViewerDoc({ filePath: financialDetails.boqFilePath, fileName: "BOQ File" })}>📊 BOQ File</button></div>}
                      {financialDetails.priceBreakupPath && <div><button className="btn btn-sm btn-link" onClick={() => setViewerDoc({ filePath: financialDetails.priceBreakupPath, fileName: "Price Breakup" })}>📊 Price Breakup</button></div>}
                      {financialDetails.emdReceiptPath && <div><button className="btn btn-sm btn-link" onClick={() => setViewerDoc({ filePath: financialDetails.emdReceiptPath, fileName: "EMD Receipt" })}>🧾 EMD Receipt</button></div>}
                    </div>
                  </div>
                </>
              )}

              {/* Evaluation Remarks */}
              {selectedBid.evaluationRemarks && (
                <div className="mt-3">
                  <h6 className="text-primary">Evaluation Remarks</h6>
                  <div className="alert alert-info">{selectedBid.evaluationRemarks}</div>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ padding: "16px 20px", borderTop: "1px solid #ddd" }}>
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer */}
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

export default MyBids;