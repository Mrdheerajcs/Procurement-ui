import React, { useState, useEffect, useMemo } from "react";
import apiClient from "../../auth/apiClient";
import DocumentViewer from "../../Components/DocumentViewer";

const MPRHistory = () => {
  const [mprList, setMprList] = useState([]);
  const [selectedMPR, setSelectedMPR] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [mprDocuments, setMprDocuments] = useState([]);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  useEffect(() => {
    fetchMprHistory();
  }, []);

  const fetchMprHistory = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/mpr/getallbyMultiStatus", {
        params: {
          status: ["a", "r"],
        },
        paramsSerializer: (params) => {
          return params.status.map(s => `status=${s}`).join("&");
        }
      });

      if (res.status === "SUCCESS") {
        setMprList(res.data || []);
      } else {
        console.error("Failed:", res.data?.message);
      }
    } catch (err) {
      console.error("Error fetching MPR history:", err);
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
      <div className="mb-4">
        <h1 className="page-title">MPR History</h1>
        <p className="text-muted-soft">View approved and rejected material purchase requests</p>
      </div>

      {!selectedMPR ? (
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <h6 className="mb-0 fw-semibold">Approved &amp; Rejected MPRs</h6>
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
                      <th>Date</th>
                      <th>Status</th>
                      <th>Documents</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-5 text-muted-soft">
                          <i className="bi bi-inbox fs-3 d-block mb-2" />No history records found
                        </td>
                      </tr>
                    )}
                    {filteredList.map((mpr) => {
                      // Determine overall status from details
                      const hasApproved = mpr.mprDetailResponnces?.some(d => d.status === "a");
                      const hasRejected = mpr.mprDetailResponnces?.some(d => d.status === "r");
                      let overallStatus = "Mixed";
                      let statusClass = "bg-secondary";
                      if (hasApproved && !hasRejected) {
                        overallStatus = "Fully Approved";
                        statusClass = "bg-success";
                      } else if (!hasApproved && hasRejected) {
                        overallStatus = "Rejected";
                        statusClass = "bg-danger";
                      }
                      return (
                        <tr key={mpr.mprId}>
                          <td className="fw-semibold text-primary">{mpr.mprNo}</td>
                          <td>{mpr.departmentName || `Dept-${mpr.departmentId}`}</td>
                          <td>{mpr.projectName}</td>
                          <td>
                            <span className={`badge rounded-pill ${mpr.priority === 'HIGH' ? 'bg-danger' : mpr.priority === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                              {mpr.priority}
                            </span>
                          </td>
                          <td>{new Date(mpr.mprDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${statusClass}`}>{overallStatus}</span>
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
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedMPR(mpr)}>
                              <i className="bi bi-eye me-1" />View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => setSelectedMPR(null)}>
            <i className="bi bi-arrow-left me-2" />Back to History
          </button>

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

          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">Line Items</h6>
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
                      <th>Vendors</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedMPR.mprDetailResponnces || []).map((row, idx) => (
                      <tr key={row.mprDetailId || idx}>
                        <td>{idx + 1}</td>
                        <td><code>{row.itemCode}</code></td>
                        <td className="fw-semibold">{row.itemName}</td>
                        <td>{row.uom}</td>
                        <td>{row.specification}</td>
                        <td className="text-end">{row.requestedQty}</td>
                        <td className="text-end">₹ {row.estimatedRate?.toLocaleString()}</td>
                        <td className="text-end">₹ {row.estimatedValue?.toLocaleString()}</td>
                        <td className="text-end">{row.stockAvailable}</td>
                        <td>
                          {row.vendors?.length > 0
                            ? row.vendors.map((v) => v.vendorName).join(", ")
                            : <span className="text-muted-soft">—</span>}
                        </td>
                        <td>
                          <span className={row.status === "a" ? "badge bg-success" : row.status === "r" ? "badge bg-danger" : "badge bg-secondary"}>
                            {row.status === "a" ? "Approved" : row.status === "r" ? "Rejected" : row.status}
                          </span>
                        </td>
                        <td className="text-muted small">{row.remarks || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer">
              <button className="btn btn-outline-secondary" onClick={() => setSelectedMPR(null)}>
                <i className="bi bi-arrow-left me-2" />Back
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

export default MPRHistory;