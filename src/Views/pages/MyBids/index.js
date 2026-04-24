import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";
import { useNavigate } from "react-router-dom";

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);
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
    switch(status) {
      case "PENDING": return <span className="badge bg-warning text-dark">⏳ Pending Evaluation</span>;
      case "QUALIFIED": return <span className="badge bg-success">✓ Qualified</span>;
      case "DISQUALIFIED": return <span className="badge bg-danger">✗ Disqualified</span>;
      case "CLARIFICATION_NEEDED": return <span className="badge bg-warning text-dark">⚠ Clarification Needed</span>;
      case "WITHDRAWN": return <span className="badge bg-secondary">🗑 Withdrawn</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
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
        <p className="text-muted-soft">Track your submitted bids and their status</p>
      </div>

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
                  <th>Status</th>
                  <th>Score</th>
                  <th>Remarks</th>
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
                      <td className="text-muted small">{bid.evaluationRemarks || "-"}</td>
                      <td className="text-center">
                        {bid.evaluationStatus === "PENDING" && (
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              const reason = prompt("Enter reason for withdrawal (optional):");
                              if (reason !== null) handleWithdraw(bid.bidTechnicalId, reason);
                            }}
                            disabled={withdrawing === bid.bidTechnicalId}
                          >
                            {withdrawing === bid.bidTechnicalId ? "Withdrawing..." : "Withdraw"}
                          </button>
                        )}
                        {bid.evaluationStatus === "CLARIFICATION_NEEDED" && (
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => navigate(`/clarification-response/${bid.bidTechnicalId}`)}
                          >
                            Respond to Clarification
                          </button>
                        )}
                        {bid.evaluationStatus === "QUALIFIED" && (
                          <span className="text-success">Awaiting Financial Round</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBids;