import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";
import { useAuth } from "../../../auth/useAuth";

const MPRApprovalLevels = () => {
  const { auth } = useAuth();
  const [pendingMprs, setPendingMprs] = useState([]);
  const [selectedMpr, setSelectedMpr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(""); // approve or reject

  // Get user role from auth
  const userRole = auth?.roles?.[0] || "";

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/mpr/approval-level/pending?role=${userRole}`);
      if (res.status === "SUCCESS") {
        setPendingMprs(res.data);
      }
    } catch (err) {
      console.error("Error fetching pending approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalStatus = async (mprId) => {
    try {
      const res = await apiClient.get(`/api/mpr/approval-level/status/${mprId}`);
      if (res.status === "SUCCESS") {
        setSelectedMpr(res.data);
      }
    } catch (err) {
      console.error("Error fetching status:", err);
    }
  };

  const handleViewDetails = (mpr) => {
    fetchApprovalStatus(mpr.mprId);
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await apiClient.put("/api/mpr/approval-level/approve", {
        mprId: selectedMpr.mprId,
        action: "APPROVE",
        remarks: remarks
      });
      if (res.status === "SUCCESS") {
        alert(res.message);
        setShowModal(false);
        setRemarks("");
        setSelectedMpr(null);
        fetchPendingApprovals();
      }
    } catch (err) {
      console.error("Error approving:", err);
      alert(err.message || "Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      alert("Please provide rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiClient.put("/api/mpr/approval-level/reject", {
        mprId: selectedMpr.mprId,
        action: "REJECT",
        remarks: remarks
      });
      if (res.status === "SUCCESS") {
        alert(res.message);
        setShowModal(false);
        setRemarks("");
        setSelectedMpr(null);
        fetchPendingApprovals();
      }
    } catch (err) {
      console.error("Error rejecting:", err);
      alert(err.message || "Rejection failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openApproveModal = () => {
    setModalAction("approve");
    setRemarks("");
    setShowModal(true);
  };

  const openRejectModal = () => {
    setModalAction("reject");
    setRemarks("");
    setShowModal(true);
  };

  const getCurrentLevelName = (level) => {
    switch(level) {
      case "MANAGER": return "Manager Approval";
      case "FINANCE": return "Finance Approval";
      case "DIRECTOR": return "Director Approval";
      case "COMPLETED": return "Fully Approved";
      default: return level;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "APPROVED": return <span className="badge bg-success">✓ Approved</span>;
      case "REJECTED": return <span className="badge bg-danger">✗ Rejected</span>;
      case "PENDING": return <span className="badge bg-warning text-dark">⏳ Pending</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">MPR Approval - {userRole.replace("ROLE_", "")}</h1>
        <p className="text-muted-soft">Review and approve MPRs at your level</p>
      </div>

      {!selectedMpr ? (
        // List View
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0 fw-semibold">Pending Approvals</h6>
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
                      <th>MPR No</th>
                      <th>Department</th>
                      <th>Project</th>
                      <th>Priority</th>
                      <th>Current Level</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingMprs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          <i className="bi bi-inbox fs-3 d-block mb-2" />
                          No pending approvals at your level
                        </td>
                      </tr>
                    ) : (
                      pendingMprs.map((mpr) => (
                        <tr key={mpr.mprId}>
                          <td className="fw-semibold text-primary">{mpr.mprNo}</td>
                          <td>{mpr.departmentName || "-"}</td>
                          <td>{mpr.projectName || "-"}</td>
                          <td>
                            <span className={`badge ${mpr.priority === 'HIGH' ? 'bg-danger' : 'bg-secondary'}`}>
                              {mpr.priority}
                            </span>
                          </td>
                          <td>{getCurrentLevelName(mpr.currentLevel)}</td>
                          <td className="text-center">
                            <button className="btn btn-sm btn-primary" onClick={() => handleViewDetails(mpr)}>
                              <i className="bi bi-eye me-1" />View & Approve
                            </button>
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
      ) : (
        // Detail View
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => setSelectedMpr(null)}>
            <i className="bi bi-arrow-left me-2" />Back to List
          </button>

          {/* MPR Header Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">MPR Details — {selectedMpr.mprNo}</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="text-muted small">MPR Number</div>
                  <div className="fw-semibold">{selectedMpr.mprNo}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted small">Department</div>
                  <div>{selectedMpr.departmentName || "-"}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted small">Project</div>
                  <div>{selectedMpr.projectName || "-"}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted small">Current Status</div>
                  <div>{getCurrentLevelName(selectedMpr.currentLevel)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Levels Status */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">Approval Workflow Status</h6>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Level 1 - Manager */}
                <div className="col-md-4 mb-3">
                  <div className="card h-100 border">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Level 1: Manager</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-2">{getStatusBadge(selectedMpr.level1?.status)}</div>
                      {selectedMpr.level1?.approvedBy && (
                        <>
                          <div className="text-muted small">Approved By: {selectedMpr.level1.approvedBy}</div>
                          <div className="text-muted small">Date: {new Date(selectedMpr.level1.approvedAt).toLocaleString()}</div>
                          {selectedMpr.level1.remarks && <div className="mt-2"><strong>Remarks:</strong> {selectedMpr.level1.remarks}</div>}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Level 2 - Finance */}
                <div className="col-md-4 mb-3">
                  <div className="card h-100 border">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Level 2: Finance</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-2">{getStatusBadge(selectedMpr.level2?.status)}</div>
                      {selectedMpr.level2?.approvedBy && (
                        <>
                          <div className="text-muted small">Approved By: {selectedMpr.level2.approvedBy}</div>
                          <div className="text-muted small">Date: {new Date(selectedMpr.level2.approvedAt).toLocaleString()}</div>
                          {selectedMpr.level2.remarks && <div className="mt-2"><strong>Remarks:</strong> {selectedMpr.level2.remarks}</div>}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Level 3 - Director */}
                <div className="col-md-4 mb-3">
                  <div className="card h-100 border">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Level 3: Director</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-2">{getStatusBadge(selectedMpr.level3?.status)}</div>
                      {selectedMpr.level3?.approvedBy && (
                        <>
                          <div className="text-muted small">Approved By: {selectedMpr.level3.approvedBy}</div>
                          <div className="text-muted small">Date: {new Date(selectedMpr.level3.approvedAt).toLocaleString()}</div>
                          {selectedMpr.level3.remarks && <div className="mt-2"><strong>Remarks:</strong> {selectedMpr.level3.remarks}</div>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Show only if current level matches user role */}
          {selectedMpr.currentStatus === "PENDING" && selectedMpr.currentLevel !== "COMPLETED" && (
            <div className="card">
              <div className="card-body text-center">
                <h6 className="mb-3">Your Action Required</h6>
                <button className="btn btn-success me-2" onClick={openApproveModal}>
                  <i className="bi bi-check-lg me-1" />Approve
                </button>
                <button className="btn btn-danger" onClick={openRejectModal}>
                  <i className="bi bi-x-lg me-1" />Reject
                </button>
              </div>
            </div>
          )}

          {selectedMpr.currentStatus === "REJECTED" && (
            <div className="alert alert-danger">
              <strong>Rejected:</strong> {selectedMpr.rejectionReason}
            </div>
          )}

          {selectedMpr.currentStatus === "APPROVED" && selectedMpr.currentLevel === "COMPLETED" && (
            <div className="alert alert-success">
              <i className="bi bi-check-circle-fill me-2" />
              <strong>MPR Fully Approved!</strong> Ready for tender creation.
            </div>
          )}
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalAction === "approve" ? "Approve MPR" : "Reject MPR"}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <p>
                  <strong>MPR:</strong> {selectedMpr?.mprNo}
                </p>
                <div className="mb-3">
                  <label className="form-label">
                    {modalAction === "approve" ? "Remarks (Optional)" : "Rejection Reason *"}
                  </label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    value={remarks} 
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={modalAction === "approve" ? "Add any remarks..." : "Please provide reason for rejection..."}
                    required={modalAction === "reject"}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button 
                  className={modalAction === "approve" ? "btn btn-success" : "btn btn-danger"} 
                  onClick={modalAction === "approve" ? handleApprove : handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
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

export default MPRApprovalLevels;