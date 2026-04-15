import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";

const TechnicalEvaluation = () => {
  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/tenders/all?status=PUBLISHED");
      if (res.status === "SUCCESS") {
        setTenders(res.data);
      }
    } catch (err) {
      console.error("Error fetching tenders:", err);
    } finally {
      setLoading(false);
    }
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

  const handleSelectTender = (tender) => {
    setSelectedTender(tender);
    fetchBidsForTender(tender.tenderId);
  };

const handleEvaluate = async (bidTechnicalId, status, score, remarks) => {
    setEvaluating(true);
    try {
        // ✅ FIX: Use correct API endpoint
        const res = await apiClient.put(`/api/bids/technical/${bidTechnicalId}/evaluate`, null, {
            params: { 
                status: status,
                score: score || 0,
                remarks: remarks || ""
            }
        });
        
        console.log("Evaluation response:", res);
        
        if (res.status === "SUCCESS") {
            alert(`Bid ${status === "QUALIFIED" ? "Qualified" : "Disqualified"} successfully`);
            // Refresh bids list
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

  const handleRevealFinancial = async () => {
    if (!window.confirm("Are you sure you want to reveal all financial bids? This action cannot be undone.")) return;
    
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
    switch(status) {
      case "QUALIFIED": return <span className="badge bg-success">Qualified</span>;
      case "DISQUALIFIED": return <span className="badge bg-danger">Disqualified</span>;
      case "CLARIFICATION_NEEDED": return <span className="badge bg-warning text-dark">Clarification Needed</span>;
      default: return <span className="badge bg-secondary">Pending</span>;
    }
  };

  const filteredTenders = tenders.filter(t =>
    t.tenderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tenderTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const qualifiedCount = bids.filter(b => b.evaluationStatus === "QUALIFIED").length;
  const pendingCount = bids.filter(b => b.evaluationStatus === "PENDING").length;

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Technical Evaluation</h1>
        <p className="text-muted-soft">Evaluate vendor technical bids and qualify for financial round</p>
      </div>

      {!selectedTender ? (
        // Tender List View
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
                  <tr><th>Tender No</th><th>Title</th><th>Department</th><th>Bid End Date</th><th>Bids Received</th><th className="text-center">Action</th></tr>
                </thead>
                <tbody>
                  {filteredTenders.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-5 text-muted-soft">No tenders found</td></tr>
                  ) : (
                    filteredTenders.map(t => (
                      <tr key={t.tenderId}>
                        <td className="fw-semibold text-primary">{t.tenderNo}</td>
                        <td>{t.tenderTitle}</td>
                        <td>{t.department}</td>
                        <td>{t.bidEndDate ? new Date(t.bidEndDate).toLocaleDateString() : "-"}</td>
                        <td><span className="badge bg-primary">{t.bidCount || 0}</span></td>
                        <td className="text-center">
                          <button className="btn btn-sm btn-primary" onClick={() => handleSelectTender(t)}>
                            <i className="bi bi-clipboard-check me-1" />Evaluate
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
        // Evaluation View
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => setSelectedTender(null)}>
            <i className="bi bi-arrow-left me-2" />Back to Tenders
          </button>

          {/* Tender Info Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">{selectedTender.tenderNo} - {selectedTender.tenderTitle}</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3"><small className="text-muted">Department</small><div>{selectedTender.department}</div></div>
                <div className="col-md-3"><small className="text-muted">Project</small><div>{selectedTender.projectName}</div></div>
                <div className="col-md-3"><small className="text-muted">Total Bids</small><div><span className="badge bg-primary">{bids.length}</span></div></div>
                <div className="col-md-3"><small className="text-muted">Qualified</small><div><span className="badge bg-success">{qualifiedCount}</span> / {bids.length}</div></div>
              </div>
            </div>
          </div>

          {/* Bids Table */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold">Vendor Technical Bids</h6>
              {qualifiedCount > 0 && (
                <button className="btn btn-warning btn-sm" onClick={handleRevealFinancial} disabled={loading}>
                  <i className="bi bi-eye me-1" />Reveal Financial Bids
                </button>
              )}
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Vendor Name</th>
                      <th>GST</th>
                      <th>Make in India</th>
                      <th>Bidder Turnover</th>
                      <th>OEM Name</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid) => (
                      <tr key={bid.bidTechnicalId}>
                        <td className="fw-semibold">{bid.vendorName}</td>
                        <td><code>{bid.gstNumber}</code></td>
                        <td>{bid.makeIndiaClass}</td>
                        <td>₹ {bid.bidderTurnover?.toLocaleString()}</td>
                        <td>{bid.oemName}</td>
                        <td>{getStatusBadge(bid.evaluationStatus)}</td>
                        <td>{bid.evaluationScore || "-"}</td>
                        <td className="text-center">
                          {bid.evaluationStatus === "PENDING" ? (
                            <div className="dropdown">
                              <button className="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">
                                Evaluate
                              </button>
                              <div className="dropdown-menu">
                                <button className="dropdown-item text-success" onClick={() => handleEvaluate(bid.bidTechnicalId, "QUALIFIED", 85, "Meets all criteria")}>
                                  <i className="bi bi-check-circle me-2" />Qualify
                                </button>
                                <button className="dropdown-item text-danger" onClick={() => handleEvaluate(bid.bidTechnicalId, "DISQUALIFIED", 45, "Does not meet turnover criteria")}>
                                  <i className="bi bi-x-circle me-2" />Disqualify
                                </button>
                                <button className="dropdown-item text-warning" onClick={() => {
                                  const remarks = prompt("Enter clarification required:");
                                  if (remarks) handleEvaluate(bid.bidTechnicalId, "CLARIFICATION_NEEDED", null, remarks);
                                }}>
                                  <i className="bi bi-question-circle me-2" />Need Clarification
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted small">Evaluated</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalEvaluation;