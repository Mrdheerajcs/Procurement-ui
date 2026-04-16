import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../auth/apiClient";

const PendingClarifications = () => {
  const navigate = useNavigate();
  const [clarifications, setClarifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingClarifications();
  }, []);

  const fetchPendingClarifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/bids/vendor/pending-clarifications");
      console.log("Pending Clarifications Response:", res);
      
      if (res.status === "SUCCESS") {
        setClarifications(res.data || []);
      } else {
        setError(res.message || "Failed to load clarifications");
      }
    } catch (err) {
      console.error("Error fetching pending clarifications:", err);
      setError(err.message || "Failed to load clarifications");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = (bidId) => {
    navigate(`/clarification-response/${bidId}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No deadline";
    return new Date(dateStr).toLocaleString();
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
  };

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading pending clarifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger m-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Pending Clarifications</h1>
        <p className="text-muted-soft">Respond to admin clarification requests</p>
      </div>

      {clarifications.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-inbox fs-1 text-muted d-block mb-3" />
            <h5>No pending clarifications</h5>
            <p className="text-muted">You don't have any clarification requests at this time.</p>
            <button className="btn btn-primary" onClick={() => navigate("/searchtender")}>
              Browse Tenders
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {clarifications.map((item) => {
            const deadlinePassed = isDeadlinePassed(item.clarificationDeadline);
            return (
              <div key={item.bidTechnicalId} className="col-md-6 mb-4">
                <div className={`card h-100 ${deadlinePassed ? "border-danger" : "border-warning"}`}>
                  <div className={`card-header ${deadlinePassed ? "bg-danger text-white" : "bg-warning text-dark"}`}>
                    <h6 className="mb-0">
                      <i className="bi bi-question-circle-fill me-2" />
                      Clarification Required - {item.tenderNo}
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="fw-semibold">Question from Admin:</label>
                      <div className="border p-2 rounded bg-light mt-1">
                        {item.clarificationQuestion}
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <small className="text-muted">Tender Title</small>
                        <div className="fw-semibold">{item.tenderTitle}</div>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Vendor Name</small>
                        <div className="fw-semibold">{item.vendorName}</div>
                      </div>
                    </div>
                    
                    <div className="alert alert-info mb-3">
                      <i className="bi bi-clock-fill me-2" />
                      <strong>Response Deadline:</strong> {formatDate(item.clarificationDeadline)}
                      {deadlinePassed && (
                        <span className="badge bg-danger ms-2">Deadline Passed!</span>
                      )}
                    </div>
                    
                    {item.vendorResponse ? (
                      <div className="alert alert-success">
                        <i className="bi bi-check-circle-fill me-2" />
                        <strong>Your Response Submitted:</strong> {item.vendorResponse}
                      </div>
                    ) : (
                      <button 
                        className="btn btn-primary w-100"
                        onClick={() => handleRespond(item.bidTechnicalId)}
                        disabled={deadlinePassed}
                      >
                        <i className="bi bi-reply-fill me-2" />
                        Respond to Clarification
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingClarifications;