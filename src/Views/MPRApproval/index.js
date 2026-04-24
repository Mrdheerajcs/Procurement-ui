import React, { useState, useEffect, useMemo } from "react";
import apiClient from "../../auth/apiClient";
import MessagePopup from "../../Components/MessagePopup";
import DocumentViewer from "../../Components/DocumentViewer";

const MPRApproval = () => {
  const [mprList, setMprList] = useState([]);
  const [selectedMPR, setSelectedMPR] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemActions, setItemActions] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [mprDocuments, setMprDocuments] = useState([]);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  useEffect(() => {
    fetchMprList();
  }, []);

  const fetchMprList = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/mpr/getallbyStatus", {
        params: { status: "n" },
      });

      if (res.status === "SUCCESS") {
        setMprList(res.data || []);
      } else {
        console.error("Failed:", res.data?.message);
      }
    } catch (err) {
      console.error("Error fetching MPR List:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch documents for MPR
  const fetchMprDocuments = async (mprId) => {
    try {
      const res = await apiClient.get(`/api/mpr/documents/${mprId}`);
      if (res.status === "SUCCESS") {
        setMprDocuments(res.data);
        setShowDocumentsModal(true);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      alert("Failed to load documents");
    }
  };

  const filteredList = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return mprList.filter((mpr) => {
      const department = mpr.departmentName || `Dept-${mpr.departmentId}`;
      return (
        String(mpr.mprNo || "").toLowerCase().includes(search) ||
        String(mpr.projectName || "").toLowerCase().includes(search) ||
        department.toLowerCase().includes(search)
      );
    });
  }, [searchTerm, mprList]);

  const handleStatusChange = (id, status) => {
    setItemActions((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status,
      },
    }));
  };

  const handleReasonChange = (id, reason) => {
    setItemActions((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        reason,
      },
    }));
  };

  const isAllSelected = selectedMPR?.mprDetailResponnces?.every((row) => {
    const action = itemActions[row.mprDetailId];
    return action?.status && (action.status !== "r" || action.reason?.trim());
  });

  const handleSubmit = async () => {
    if (!selectedMPR) return;

    const payload = {
      mprHeaderId: parseInt(selectedMPR.mprId),
      mprApprovalLists: (selectedMPR.mprDetailResponnces || []).map((row) => ({
        mprdetailId: row.mprDetailId,
        status: itemActions[row.mprDetailId]?.status,
        remarks: itemActions[row.mprDetailId]?.reason || "",
      })),
    };

    try {
      const res = await apiClient.put("/api/mpr/approve", payload);

      if (res.status === "SUCCESS") {
        setMsg({ type: "success", text: "MPR approved successfully!" });
        setSelectedMPR(null);
        fetchMprList();
      } else {
        setMsg({
          type: "error",
          text: res.message || "Submission failed",
        });
      }
    } catch (err) {
      console.error("Error submitting approval:", err);
      setMsg({
        type: "error",
        text: "Server error. Please try again.",
      });
    }
  };

  const formatNumber = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-IN").format(value);
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <i className="bi bi-file-earmark-fill" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <i className="bi bi-file-pdf-fill text-danger" />;
    if (ext === 'xlsx' || ext === 'xls') return <i className="bi bi-file-excel-fill text-success" />;
    if (ext === 'doc' || ext === 'docx') return <i className="bi bi-file-word-fill text-primary" />;
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return <i className="bi bi-file-image-fill text-info" />;
    return <i className="bi bi-file-earmark-fill" />;
  };

  return (
    <div className="container-fluid">
      {msg && (
        <MessagePopup type={msg.type} message={msg.text} duration={4000} onClose={() => setMsg(null)} />
      )}

      <div className="mb-4">
        <h1 className="page-title">MPR Approval</h1>
        <p className="text-muted-soft">Review and approve pending material purchase requests</p>
      </div>

      {!selectedMPR ? (
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <h6 className="mb-0 fw-semibold">Pending Approvals</h6>
            <div className="input-group" style={{ maxWidth: "320px" }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted" />
              </span>
              <input
                type="search"
                className="form-control border-start-0"
                placeholder="Search by MPR No / Dept / Project…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                      <th>Documents</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted-soft">
                          <i className="bi bi-inbox fs-3 d-block mb-2" />No pending MPRs found
                        </td>
                      </tr>
                    )}
                    {filteredList.map((mpr) => (
                      <tr key={mpr.mprId}>
                        <td className="fw-semibold text-primary">{mpr.mprNo}</td>
                        <td>{mpr.departmentName || `Dept-${mpr.departmentId}`}</td>
                        <td>{mpr.projectName}</td>
                        <td>
                          <span className={`badge rounded-pill ${mpr.priority === 'HIGH' ? 'bg-danger' : mpr.priority === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                            {mpr.priority}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-info" 
                            onClick={() => fetchMprDocuments(mpr.mprId)}
                            title="View Documents"
                          >
                            <i className="bi bi-paperclip" /> View Docs
                          </button>
                        </td>
                        <td className="text-center">
                          <button className="btn btn-sm btn-primary" onClick={() => { setSelectedMPR(mpr); setItemActions({}); }}>
                            <i className="bi bi-folder2-open me-1" />Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => setSelectedMPR(null)}>
            <i className="bi bi-arrow-left me-2" />Back to List
          </button>

          {/* MPR Header Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">MPR Details — {selectedMPR.mprNo}</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted-soft small mb-1">MPR Number</div>
                  <div className="fw-semibold">{selectedMPR.mprNo}</div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted-soft small mb-1">Date</div>
                  <div className="fw-semibold">{new Date(selectedMPR.mprDate).toLocaleDateString()}</div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted-soft small mb-1">Department</div>
                  <div className="fw-semibold">{selectedMPR.departmentName || `Dept-${selectedMPR.departmentId}`}</div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted-soft small mb-1">Project</div>
                  <div className="fw-semibold">{selectedMPR.projectName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">Line Items — Approve / Reject</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>SR</th>
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>UOM</th>
                      <th>Specification</th>
                      <th className="text-end">Qty</th>
                      <th className="text-end">Rate</th>
                      <th className="text-end">Value</th>
                      <th className="text-end">Stock</th>
                      <th>AMC</th>
                      <th>Last Purchase</th>
                      <th>Vendors</th>
                      <th>Decision</th>
                      <th>Reason (if rejected)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedMPR.mprDetailResponnces || []).map((row, idx) => {
                      const action = itemActions[row.mprDetailId] || {};
                      return (
                        <tr key={row.mprDetailId || idx}>
                          <td>{idx + 1}</td>
                          <td><code>{row.itemCode}</code></td>
                          <td className="fw-semibold">{row.itemName}</td>
                          <td>{row.uom}</td>
                          <td>{row.specification}</td>
                          <td className="text-end">{row.requestedQty}</td>
                          <td className="text-end">{formatNumber(row.estimatedRate)}</td>
                          <td className="text-end">{formatNumber(row.estimatedValue)}</td>
                          <td className="text-end">{row.stockAvailable}</td>
                          <td>{row.avgMonthlyConsumption}</td>
                          <td>{row.lastPurchaseInfo}</td>
                          <td>
                            {row.vendors?.length > 0
                              ? row.vendors.map((v) => v.vendorName).join(", ")
                              : <span className="text-muted-soft">—</span>}
                          </td>
                          <td style={{ minWidth: "130px" }}>
                            <select
                              className={`form-select form-select-sm ${action.status === 'a' ? 'border-success' : action.status === 'r' ? 'border-danger' : ''}`}
                              value={action.status || ""}
                              onChange={(e) => handleStatusChange(row.mprDetailId, e.target.value)}
                            >
                              <option value="">— Select —</option>
                              <option value="a">✓ Approve</option>
                              <option value="r">✗ Reject</option>
                            </select>
                          </td>
                          <td style={{ minWidth: "180px" }}>
                            {action.status === "r" && (
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Enter reason…"
                                value={action.reason || ""}
                                onChange={(e) => handleReasonChange(row.mprDetailId, e.target.value)}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer d-flex gap-2 justify-content-end">
              <button className="btn btn-outline-secondary" onClick={() => setSelectedMPR(null)}>
                <i className="bi bi-arrow-left me-2" />Back
              </button>
              <button className="btn btn-success" disabled={!isAllSelected} onClick={handleSubmit}>
                <i className="bi bi-check2-all me-2" />Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {showDocumentsModal && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="modal-container" style={{ backgroundColor: "white", borderRadius: "12px", width: "600px", maxWidth: "90%", maxHeight: "80%", overflow: "auto" }}>
            <div className="modal-header" style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h5 className="modal-title">📄 MPR Documents</h5>
              <button className="btn-close" onClick={() => setShowDocumentsModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: "20px" }}>
              {mprDocuments.length === 0 ? (
                <p className="text-muted text-center">No documents uploaded for this MPR</p>
              ) : (
                <div className="list-group">
                  {mprDocuments.map((doc, idx) => (
                    <div key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        {getFileIcon(doc.fileName)}
                        <span className="ms-2">{doc.fileName}</span>
                        <small className="text-muted ms-2">({(doc.fileSize / 1024).toFixed(2)} KB)</small>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setViewerDoc({ filePath: doc.filePath, fileName: doc.fileName })}
                      >
                        <i className="bi bi-eye" /> View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ padding: "16px 20px", borderTop: "1px solid #e5e7eb" }}>
              <button className="btn btn-secondary" onClick={() => setShowDocumentsModal(false)}>Close</button>
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

export default MPRApproval;