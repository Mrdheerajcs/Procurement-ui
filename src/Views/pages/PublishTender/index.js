import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";
import DocumentViewer from "../../../Components/DocumentViewer";

const PublishTender = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedMPR, setSelectedMPR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mprList, setMprList] = useState([]);
  const [fetchingMPRs, setFetchingMPRs] = useState(false);
  
  // ✅ NEW: Document viewer states
  const [viewerDoc, setViewerDoc] = useState(null);
  const [mprDocuments, setMprDocuments] = useState([]);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  const [formData, setFormData] = useState({
    mprNo: "",
    department: "",
    projectName: "",
    priority: "",
    tenderTitle: "",
    tenderType: "Open",
    bidType: "Two Bid",
    boqType: "Item Rate",
    estimatedValue: "",
    emdAmount: "",
    tenderFee: "",
    bidValidity: "",
    publishDate: "",
    closingDate: "",
    bidTime: "",
    preBidDate: "",
    techBidOpenDate: "",
    finBidOpenDate: "",
    nitDoc: null,
    boqDoc: null,
    techDoc: null,
    otherDocs: [],
    description: ""
  });

  const formatNumber = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-IN").format(value);
  };

  const parseNumber = (value) => {
    return value.replace(/,/g, "");
  };

  // ✅ NEW: Fetch documents for an MPR
  const fetchMprDocuments = async (mprId) => {
    try {
      const res = await apiClient.get(`/api/mpr/documents/${mprId}`);
      if (res.status === "SUCCESS") {
        setMprDocuments(res.data);
        setShowDocumentsModal(true);
      } else {
        alert("No documents found for this MPR");
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      alert("Failed to load documents");
    }
  };

  const fetchApprovedMPRs = async () => {
    setFetchingMPRs(true);
    try {
      const res = await apiClient.get("/api/mpr/getallbyStatus", {
        params: { status: "a" }
      });

      if (res.status === "SUCCESS" && res.data) {
        const approvedMPRs = res.data.map(mpr => ({
          mprId: parseInt(mpr.mprId),
          mprNo: mpr.mprNo,
          department: mpr.departmentName || "N/A",
          projectName: mpr.projectName || "N/A",
          priority: mpr.priority || "Normal",
          totalValue: mpr.totalValue || 0
        }));
        setMprList(approvedMPRs);
      } else {
        setMprList([]);
      }
    } catch (err) {
      console.error("Error fetching approved MPRs:", err);
      setMprList([]);
    } finally {
      setFetchingMPRs(false);
    }
  };

  useEffect(() => {
    fetchApprovedMPRs();
  }, []);

  const resetForm = () => {
    setFormData({
      mprNo: "",
      department: "",
      projectName: "",
      priority: "",
      tenderTitle: "",
      tenderType: "Open",
      bidType: "Two Bid",
      boqType: "Item Rate",
      estimatedValue: "",
      emdAmount: "",
      tenderFee: "",
      bidValidity: "",
      publishDate: "",
      closingDate: "",
      bidTime: "",
      preBidDate: "",
      techBidOpenDate: "",
      finBidOpenDate: "",
      nitDoc: null,
      boqDoc: null,
      techDoc: null,
      otherDocs: [],
      description: ""
    });
  };

  const handlePublishClick = (mpr) => {
    setSelectedMPR(mpr);
    setFormData({
      ...formData,
      mprNo: mpr.mprNo,
      department: mpr.department,
      projectName: mpr.projectName,
      priority: mpr.priority,
      tenderTitle: "",
      estimatedValue: "",
      emdAmount: "",
      tenderFee: "",
      bidValidity: "",
      publishDate: "",
      closingDate: "",
      bidTime: "",
      preBidDate: "",
      techBidOpenDate: "",
      finBidOpenDate: "",
      nitDoc: null,
      boqDoc: null,
      techDoc: null,
      otherDocs: [],
      description: ""
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      if (name === "otherDocs") {
        setFormData(prev => ({ ...prev, [name]: Array.from(files) }));
      } else {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      }
    } else {
      if (["estimatedValue", "emdAmount", "tenderFee"].includes(name)) {
        const rawValue = parseNumber(value);
        if (!isNaN(rawValue)) {
          setFormData(prev => ({ ...prev, [name]: rawValue }));
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tenderTitle || !formData.publishDate || !formData.closingDate) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();

    const tenderRequest = {
      mprId: selectedMPR?.mprId,
      tenderNo: `TND/${Date.now()}`,
      tenderTitle: formData.tenderTitle,
      tenderType: formData.tenderType,
      department: formData.department,
      projectName: formData.projectName,
      priority: formData.priority,
      bidType: formData.bidType,
      boqType: formData.boqType,
      estimatedValue: formData.estimatedValue,
      emdAmount: formData.emdAmount,
      tenderFee: formData.tenderFee,
      bidValidity: formData.bidValidity,
      publishDate: formData.publishDate,
      closingDate: formData.closingDate,
      bidSubmissionEndTime: formData.bidTime,
      preBidDate: formData.preBidDate,
      techBidOpenDate: formData.techBidOpenDate,
      finBidOpenDate: formData.finBidOpenDate,
      description: formData.description,
    };

    formDataToSend.append("data", new Blob([JSON.stringify(tenderRequest)], { type: "application/json" }));

    if (formData.nitDoc) formDataToSend.append("nitDoc", formData.nitDoc);
    if (formData.boqDoc) formDataToSend.append("boqDoc", formData.boqDoc);
    if (formData.techDoc) formDataToSend.append("techDoc", formData.techDoc);

    formData.otherDocs.forEach(file => {
      formDataToSend.append("otherDocs", file);
    });

    try {
      const res = await apiClient.post("/api/mpr/publish", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.status === "SUCCESS") {
        alert("Tender created successfully and submitted for approval!");
        setShowForm(false);
        setSelectedMPR(null);
        resetForm();
        fetchApprovedMPRs();
      } else {
        alert(res.message || "Failed to create tender");
      }
    } catch (err) {
      console.error("Error:", err);
      alert(err.message || "Failed to create tender");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper to get file icon
  const getFileIcon = (fileName) => {
    if (!fileName) return <i className="bi bi-file-earmark-fill" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <i className="bi bi-file-pdf-fill text-danger" />;
    if (ext === 'xlsx' || ext === 'xls') return <i className="bi bi-file-excel-fill text-success" />;
    if (ext === 'doc' || ext === 'docx') return <i className="bi bi-file-word-fill text-primary" />;
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return <i className="bi bi-file-image-fill text-info" />;
    return <i className="bi bi-file-earmark-fill" />;
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "HIGH": return <span className="badge bg-danger">High</span>;
      case "MEDIUM": return <span className="badge bg-warning text-dark">Medium</span>;
      default: return <span className="badge bg-secondary">LOW</span>;
    }
  };

  // ✅ UPDATED LIST with Document View column
  const renderList = () => (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Publish Tender</h1>
        <p className="text-muted">Select an Approved MPR to publish tender</p>
      </div>
      <div className="card">
        <div className="card-body p-0">
          {fetchingMPRs ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2">Loading approved MPRs...</p>
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
                    <th>Total Value</th>
                    <th>Documents</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mprList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted-soft">
                        <i className="bi bi-inbox fs-3 d-block mb-2" />
                        No approved MPRs found. Please approve MPRs first.
                      </td>
                    </tr>
                  ) : (
                    mprList.map((mpr) => (
                      <tr key={mpr.mprId}>
                        <td className="fw-semibold text-primary">{mpr.mprNo}</td>
                        <td>{mpr.department}</td>
                        <td>{mpr.projectName}</td>
                        <td>{getPriorityBadge(mpr.priority)}</td>
                        <td>₹ {mpr.totalValue?.toLocaleString() || 0}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-info" 
                            onClick={() => fetchMprDocuments(mpr.mprId)}
                            title="View MPR Documents"
                          >
                            <i className="bi bi-paperclip" /> View Docs
                          </button>
                        </td>
                        <td className="text-center">
                          <button className="btn btn-primary btn-sm" onClick={() => handlePublishClick(mpr)}>
                            <i className="bi bi-megaphone me-1" />Create Tender
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

      {/* ✅ Documents Modal */}
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

      {/* ✅ Document Viewer */}
      {viewerDoc && (
        <DocumentViewer
          filePath={viewerDoc.filePath}
          fileName={viewerDoc.fileName}
          onClose={() => setViewerDoc(null)}
        />
      )}
    </div>
  );

  const renderForm = () => (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="page-title">Create Tender</h1>
          <p className="text-muted">Based on MPR: <strong>{selectedMPR?.mprNo}</strong></p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>
          <i className="bi bi-arrow-left me-2" />Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* MPR INFO */}
          <div className="col-12">
            <div className="card">
              <div className="card-body row g-3">
                <div className="col-md-3"><label className="form-label">MPR No</label><input className="form-control bg-light" value={formData.mprNo} readOnly /></div>
                <div className="col-md-3"><label className="form-label">Department</label><input className="form-control bg-light" value={formData.department} readOnly /></div>
                <div className="col-md-3"><label className="form-label">Project</label><input className="form-control bg-light" value={formData.projectName} readOnly /></div>
                <div className="col-md-3"><label className="form-label">Priority</label><input className="form-control bg-light" value={formData.priority} readOnly /></div>
              </div>
            </div>
          </div>

          {/* BASIC INFO */}
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-light"><h6 className="mb-0">Basic Information</h6></div>
              <div className="card-body row g-3">
                <div className="col-md-6"><label className="form-label">Tender Title <span className="text-danger">*</span></label><input className="form-control" name="tenderTitle" value={formData.tenderTitle} onChange={handleChange} required /></div>
                <div className="col-md-3"><label className="form-label">Tender Type</label><select className="form-select" name="tenderType" value={formData.tenderType} onChange={handleChange}><option>Open</option><option>Limited</option><option>Single</option><option>Global</option></select></div>
                <div className="col-md-3"><label className="form-label">Bid Type</label><select className="form-select" name="bidType" value={formData.bidType} onChange={handleChange}><option>Single Bid</option><option>Two Bid</option></select></div>
                <div className="col-md-3"><label className="form-label">BOQ Type</label><select className="form-select" name="boqType" value={formData.boqType} onChange={handleChange}><option>Item Rate</option><option>Lump Sum</option></select></div>
              </div>
            </div>
          </div>

          {/* FINANCIAL DETAILS */}
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-light"><h6 className="mb-0">Financial Details</h6></div>
              <div className="card-body row g-3">
                <div className="col-md-3"><label className="form-label">Estimated Value (₹)</label>
                  <input type="text" className="form-control" name="estimatedValue" value={formatNumber(formData.estimatedValue)} onChange={handleChange} />
                </div>
                <div className="col-md-3"><label className="form-label">EMD Amount (₹)</label><input type="text" className="form-control" name="emdAmount" value={formatNumber(formData.emdAmount)} onChange={handleChange} /></div>
                <div className="col-md-3"><label className="form-label">Tender Fee (₹)</label><input type="text" className="form-control" name="tenderFee" value={formatNumber(formData.tenderFee)} onChange={handleChange} /></div>
                <div className="col-md-3"><label className="form-label">Bid Validity (Days)</label><input type="text" className="form-control" name="bidValidity" value={formatNumber(formData.bidValidity)} onChange={handleChange} /></div>
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-light"><h6 className="mb-0">Tender Timeline</h6></div>
              <div className="card-body row g-3">
                <div className="col-md-3"><label className="form-label">Publish Date <span className="text-danger">*</span></label><input type="date" className="form-control" name="publishDate" value={formData.publishDate} onChange={handleChange} required /></div>
                <div className="col-md-3"><label className="form-label">Closing Date <span className="text-danger">*</span></label><input type="date" className="form-control" name="closingDate" value={formData.closingDate} onChange={handleChange} required /></div>
                <div className="col-md-3"><label className="form-label">Bid Time</label><input type="time" className="form-control" name="bidTime" value={formData.bidTime} onChange={handleChange} /></div>
                <div className="col-md-3"><label className="form-label">Pre-bid Meeting Date</label><input type="date" className="form-control" name="preBidDate" value={formData.preBidDate} onChange={handleChange} /></div>
                <div className="col-md-3"><label className="form-label">Technical Bid Opening</label><input type="date" className="form-control" name="techBidOpenDate" value={formData.techBidOpenDate} onChange={handleChange} /></div>
                <div className="col-md-3"><label className="form-label">Financial Bid Opening</label><input type="date" className="form-control" name="finBidOpenDate" value={formData.finBidOpenDate} onChange={handleChange} /></div>
              </div>
            </div>
          </div>

          {/* DOCUMENTS */}
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-light"><h6 className="mb-0">Tender Documents</h6></div>
              <div className="card-body row g-3">
                <div className="col-md-6"><label className="form-label">NIT Document</label><input type="file" className="form-control" name="nitDoc" onChange={handleChange} /></div>
                <div className="col-md-6"><label className="form-label">BOQ Document</label><input type="file" className="form-control" name="boqDoc" onChange={handleChange} /></div>
                <div className="col-md-6"><label className="form-label">Technical Specification</label><input type="file" className="form-control" name="techDoc" onChange={handleChange} /></div>
                <div className="col-md-6"><label className="form-label">Other Documents</label><input type="file" multiple className="form-control" name="otherDocs" onChange={handleChange} /></div>
                <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" name="description" rows="4" value={formData.description} onChange={handleChange} /></div>
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="col-12 text-end">
            <button type="submit" className="btn btn-primary px-5" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              Submit for Approval
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  return showForm ? renderForm() : renderList();
};

export default PublishTender;