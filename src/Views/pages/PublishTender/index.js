import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";

const PublishTender = () => {
  // =========================
  // VIEW STATE
  // =========================
  const [showForm, setShowForm] = useState(false);
  const [selectedMPR, setSelectedMPR] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mprList, setMprList] = useState([]);
  const [fetchingMPRs, setFetchingMPRs] = useState(false);

  // =========================
  // FORM STATE
  // =========================
  const [formData, setFormData] = useState({
    mprNo: "",
    department: "",
    projectName: "",
    priority: "",
    tenderTitle: "",
    tenderType: "Open / Limited",
    publishDate: "",
    closingDate: "",
    bidTime: "",
    emdAmount: "",
    documents: null,
    description: ""
  });

  // =========================
  // FETCH APPROVED MPRs FROM API
  // =========================
  const fetchApprovedMPRs = async () => {
    setFetchingMPRs(true);
    try {
      // Fetch MPRs with status 'a' (approved)
      const res = await apiClient.get("/api/mpr/getallbyStatus", {
        params: { status: "a" }
      });
      
      console.log("API Response:", res);
      
      if (res.status === "SUCCESS" && res.data) {
        // Transform API response to match component structure
        const approvedMPRs = res.data.map(mpr => ({
          mprId: parseInt(mpr.mprId),
          mprNo: mpr.mprNo,
          department: mpr.departmentName || "N/A",
          projectName: mpr.projectName || "N/A",
          priority: mpr.priority || "Normal"
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

  // Load MPRs when component mounts
  useEffect(() => {
    fetchApprovedMPRs();
  }, []);

  // =========================
  // RESET FORM FUNCTION
  // =========================
  const resetForm = () => {
    setFormData({
      mprNo: "",
      department: "",
      projectName: "",
      priority: "",
      tenderTitle: "",
      tenderType: "Open / Limited",
      publishDate: "",
      closingDate: "",
      bidTime: "",
      emdAmount: "",
      documents: null,
      description: ""
    });
  };

  // =========================
  // HANDLERS
  // =========================
  const handlePublishClick = (mpr) => {
    setSelectedMPR(mpr);
    setFormData({
      mprNo: mpr.mprNo,
      department: mpr.department,
      projectName: mpr.projectName,
      priority: mpr.priority,
      tenderTitle: "",
      tenderType: "Open / Limited",
      publishDate: "",
      closingDate: "",
      bidTime: "",
      emdAmount: "",
      documents: null,
      description: ""
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
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
      publishDate: formData.publishDate,
      closingDate: formData.closingDate,
      bidSubmissionEndTime: formData.bidTime || "17:00:00",
      emdAmount: parseFloat(formData.emdAmount) || 0,
      tenderDescription: formData.description,
    };

    formDataToSend.append("data", new Blob([JSON.stringify(tenderRequest)], { type: "application/json" }));

    if (formData.documents) {
      formDataToSend.append("files", formData.documents);
    }

    try {
      const res = await apiClient.post("/api/mpr/publish", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.status === "SUCCESS") {
        alert("Tender created successfully and submitted for approval!");
        setShowForm(false);
        setSelectedMPR(null);
        resetForm();
        // Refresh MPR list
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

  // =========================
  // PRIORITY BADGE
  // =========================
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return <span className="badge bg-danger">High</span>;
      case "Medium":
        return <span className="badge bg-warning text-dark">Medium</span>;
      default:
        return <span className="badge bg-secondary">Normal</span>;
    }
  };

  // =========================
  // LIST VIEW
  // =========================
  const renderList = () => (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">MPR List</h1>
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
                    <th className="text-center">Action</th>
                </tr>
                </thead>
                <tbody>
                  {mprList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted-soft">
                        <i className="bi bi-inbox fs-3 d-block mb-2" />
                        No approved MPRs found. Please approve MPRs first from MPR Approval page.
                      </td>
                    </tr>
                  ) : (
                    mprList.map((mpr) => (
                      <tr key={mpr.mprId}>
                        <td className="fw-semibold text-primary">{mpr.mprNo}</td>
                        <td>{mpr.department}</td>
                        <td>{mpr.projectName}</td>
                        <td>{getPriorityBadge(mpr.priority)}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handlePublishClick(mpr)}
                          >
                            Create Tender
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
    </div>
  );

  // =========================
  // FORM VIEW
  // =========================
  const renderForm = () => (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="page-title">Create Tender</h1>
          <p className="text-muted">
            Based on MPR: <strong>{selectedMPR?.mprNo}</strong>
          </p>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* MPR INFO */}
          <div className="col-12">
            <div className="card">
              <div className="card-body row g-3">
                <div className="col-md-3">
                  <label className="form-label">MPR No</label>
                  <input className="form-control bg-light" value={formData.mprNo} readOnly />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Department</label>
                  <input className="form-control bg-light" value={formData.department} readOnly />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Project</label>
                  <input className="form-control bg-light" value={formData.projectName} readOnly />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Priority</label>
                  <input className="form-control bg-light" value={formData.priority} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* TENDER DETAILS */}
          <div className="col-12">
            <div className="card">
              <div className="card-body row g-3">
                <div className="col-md-6">
                  <label className="form-label">Tender Title <span className="text-danger">*</span></label>
                  <input className="form-control" name="tenderTitle" value={formData.tenderTitle} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Tender Type</label>
                  <select className="form-select" name="tenderType" value={formData.tenderType} onChange={handleChange}>
                    <option>Open / Limited</option>
                    <option>Single Tender</option>
                    <option>Global Tender</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Publish Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" name="publishDate" value={formData.publishDate} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Closing Date <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" name="closingDate" value={formData.closingDate} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Bid Time</label>
                  <input type="time" className="form-control" name="bidTime" value={formData.bidTime} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">EMD Amount (₹)</label>
                  <input type="number" className="form-control" name="emdAmount" value={formData.emdAmount} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Tender Documents</label>
                  <input type="file" className="form-control" name="documents" onChange={handleChange} />
                  <small className="text-muted">Upload NIT, BOQ, Specifications etc.</small>
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" name="description" rows="4" value={formData.description} onChange={handleChange} />
                </div>
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