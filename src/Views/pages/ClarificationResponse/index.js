import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../auth/apiClient";

const ClarificationResponse = () => {
  // ✅ useParams se actual bidId milega
  const { bidId } = useParams();
  const navigate = useNavigate();
  const [documentFile, setDocumentFile] = useState(null);
  const [bid, setBid] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [deadlinePassed, setDeadlinePassed] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // ✅ Check if bidId exists and is valid
    if (!bidId || bidId === ":bidId") {
      setError("Invalid bid ID. Please use the link from your email or notification.");
      setFetching(false);
      return;
    }
    fetchBidDetails();
  }, [bidId]);

  const fetchBidDetails = async () => {
    setFetching(true);
    try {
      console.log("Fetching bid details for ID:", bidId);
      const res = await apiClient.get(`/api/bids/technical/details/${bidId}`);
      console.log("API Response:", res);

      if (res.status === "SUCCESS") {
        setBid(res.data);
        // Check if deadline passed
        if (res.data.clarificationDeadline) {
          const now = new Date();
          const deadline = new Date(res.data.clarificationDeadline);
          if (now > deadline) {
            setDeadlinePassed(true);
            setError("Deadline has passed. You cannot submit response now.");
          }
        }
      } else {
        setError(res.message || "Failed to load bid details");
      }
    } catch (err) {
      console.error("Error fetching bid details:", err);
      setError(err.message || "Failed to load bid details");
    } finally {
      setFetching(false);
    }
  };

const handleSubmit = async () => {
  if (!response.trim()) {
    setError("Please provide your response");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const formData = new FormData();

    formData.append(
      "data",
      new Blob(
        [
          JSON.stringify({
            bidTechnicalId: parseInt(bidId),
            response: response,
          }),
        ],
        { type: "application/json" }
      )
    );

    if (documentFile) {
      formData.append("file", documentFile);
    }

    const res = await apiClient.post(
      "/api/bids/technical/clarification/response",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Submit Response:", res);

    if (res.status === "SUCCESS") {
      setSuccess("Response submitted successfully! Admin will review your response.");
      setTimeout(() => {
        navigate("/searchtender");
      }, 3000);
    } else {
      setError(res.message || "Failed to submit response");
    }
  } catch (err) {
    console.error("Error submitting response:", err);
    setError(err.message || "Failed to submit response");
  } finally {
    setLoading(false);
  }
};

  // Loading state
  if (fetching) {
    return (
      <div className="container-fluid text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading clarification details...</p>
      </div>
    );
  }

  // Error state (invalid bidId)
  if (error && !bid) {
    return (
      <div className="container-fluid">
        <div className="card mt-4">
          <div className="card-body text-center py-5">
            <i className="bi bi-exclamation-triangle-fill text-danger fs-1 d-block mb-3" />
            <h4 className="text-danger">Invalid Request</h4>
            <p className="text-muted">{error}</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => navigate("/searchtender")}
            >
              Go to Search Tender
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No bid found
  if (!bid) {
    return (
      <div className="container-fluid">
        <div className="card mt-4">
          <div className="card-body text-center py-5">
            <i className="bi bi-inbox fs-1 text-muted d-block mb-3" />
            <h4>No Clarification Request Found</h4>
            <p className="text-muted">You don't have any pending clarification requests.</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => navigate("/searchtender")}
            >
              Browse Tenders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Clarification Request</h1>
        <p className="text-muted-soft">Respond to admin's clarification request</p>
      </div>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          {/* Tender Info Card */}
          <div className="card mb-4">
            <div className="card-header bg-warning text-dark">
              <h6 className="mb-0">
                <i className="bi bi-question-circle-fill me-2" />
                Clarification Required for: {bid.tenderNo}
              </h6>
            </div>
            <div className="card-body">
              {/* Deadline Alert */}
              <div className={`alert ${deadlinePassed ? "alert-danger" : "alert-info"} mb-4`}>
                <div className="d-flex align-items-center">
                  <i className={`bi ${deadlinePassed ? "bi-x-circle-fill" : "bi-clock-fill"} fs-4 me-3`} />
                  <div>
                    <strong>Response Deadline:</strong> {bid.clarificationDeadline ? new Date(bid.clarificationDeadline).toLocaleString() : "Not specified"}
                    {deadlinePassed && (
                      <div className="text-danger mt-1">
                        <strong>⚠ Deadline has passed! You cannot submit response now.</strong>
                      </div>
                    )}
                    {!deadlinePassed && bid.clarificationDeadline && (
                      <div className="text-muted small mt-1">
                        Please submit your response before the deadline.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Question from Admin */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-primary">
                  <i className="bi bi-chat-left-quote-fill me-2" />
                  Question from Admin:
                </label>
                <div className="border p-3 rounded bg-light">
                  {bid.clarificationQuestion || "No question provided"}
                </div>
              </div>

              {/* Vendor Response */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-reply-fill me-2" />
                  Your Response:
                </label>
                <textarea
                  className="form-control"
                  rows="6"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response here..."
                  disabled={deadlinePassed}
                  style={{ fontSize: "14px" }}
                />
                <small className="text-muted">
                  Be clear and provide all requested information.
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-paperclip me-2" />
                  Supporting Documents (Optional)
                </label>
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={(e) => setDocumentFile(e.target.files[0])}
                  disabled={deadlinePassed}
                />
                <small className="text-muted">
                  Upload any supporting documents
                </small>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="alert alert-danger mt-3">
                  <i className="bi bi-exclamation-triangle-fill me-2" />
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success mt-3">
                  <i className="bi bi-check-circle-fill me-2" />
                  {success}
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-2 mt-4">
                <button
                  className="btn btn-primary px-4"
                  onClick={handleSubmit}
                  disabled={loading || deadlinePassed}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2" />
                      Submit Response
                    </>
                  )}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/searchtender")}
                >
                  <i className="bi bi-arrow-left me-2" />
                  Back to Tenders
                </button>
              </div>
            </div>
          </div>

          {/* Original Bid Details (Collapsible) */}
          <div className="card">
            <div className="card-header bg-light">
              <h6 className="mb-0 fw-semibold">
                <i className="bi bi-file-text-fill me-2" />
                Your Original Bid Details
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-primary">Technical Details</h6>
                  <table className="table table-sm table-borderless">
                    <tbody>
                      <tr><td className="text-muted">Company Name:</td><td className="fw-semibold">{bid.companyName}</td></tr>
                      <tr><td className="text-muted">GST Number:</td><td>{bid.gstNumber}</td></tr>
                      <tr><td className="text-muted">PAN Number:</td><td>{bid.panNumber}</td></tr>
                      <tr><td className="text-muted">Make in India Class:</td><td>{bid.makeIndiaClass}</td></tr>
                      <tr><td className="text-muted">Bidder Turnover:</td><td>₹ {bid.bidderTurnover?.toLocaleString()}</td></tr>
                      <tr><td className="text-muted">OEM Name:</td><td>{bid.oemName}</td></tr>
                      <tr><td className="text-muted">OEM Turnover:</td><td>₹ {bid.oemTurnover?.toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <h6 className="text-primary">Bid Status</h6>
                  <table className="table table-sm table-borderless">
                    <tbody>
                      <tr>
                        <td className="text-muted">Status:</td>
                        <td>
                          <span className="badge bg-warning text-dark">
                            {bid.evaluationStatus}
                          </span>
                        </td>
                      </tr>
                      {bid.evaluationRemarks && (
                        <tr><td className="text-muted">Previous Remarks:</td><td>{bid.evaluationRemarks}</td></tr>
                      )}
                      <tr><td className="text-muted">Submitted On:</td><td>{new Date(bid.submittedAt).toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClarificationResponse;