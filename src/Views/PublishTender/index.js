
import React, { useState } from "react";

const PublishTender = () => {

  const [formData, setFormData] = useState({
    mprNo: "MPR-2026-001",
    department: "IT Department",
    projectName: "ERP Development",
    priority: "High",
    tenderTitle: "",
    tenderType: "Open / Limited",
    publishDate: "",
    closingDate: "",
    bidTime: "",
    emdAmount: "",
    documents: null,
    description: ""
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Final Tender Data:", formData);
    alert("Tender Published 🚀");
  };

  return (
    <div className="container mt-4 card shadow-sm p-4">
      <h4 className="mb-4 fw-bold">Publish Tender</h4>

      <form onSubmit={handleSubmit}>

        {/* ===== TOP CARD ===== */}
        <div className="card p-4 mb-4 shadow-sm">
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">MPR No</label>
              <input className="form-control" value={formData.mprNo} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label">Department</label>
              <input className="form-control" value={formData.department} readOnly />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Project Name</label>
              <input className="form-control" value={formData.projectName} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label">Priority</label>
              <input className="form-control" value={formData.priority} readOnly />
            </div>
          </div>
        </div>

        {/* ===== SECOND CARD ===== */}
        <div className="card p-4 mb-4 shadow-sm">

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Tender Title</label>
              <input
                className="form-control"
                name="tenderTitle"
                placeholder="Enter Tender Title"
                value={formData.tenderTitle}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Tender Type</label>
              <input
                className="form-control"
                name="tenderType"
                value={formData.tenderType}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Publish Date</label>
              <input
                type="date"
                className="form-control"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Closing Date</label>
              <input
                type="date"
                className="form-control"
                name="closingDate"
                value={formData.closingDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Bid Submission End Time</label>
              <input
                type="time"
                className="form-control"
                name="bidTime"
                value={formData.bidTime}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">EMD Amount</label>
              <input
                type="number"
                className="form-control"
                name="emdAmount"
                placeholder="Enter EMD Amount"
                value={formData.emdAmount}
                onChange={handleChange}
              />
            </div>
          </div>

        </div>

        {/* ===== UPLOAD + DESCRIPTION ===== */}
        <div className="card p-4 mb-4 shadow-sm">

          <div className="mb-3">
            <label className="form-label">Upload Documents</label>
            <input
              type="file"
              className="form-control"
              name="documents"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={4}
              name="description"
              placeholder="Enter description..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* ===== BUTTON ===== */}
        <div className="text-end">
          <button type="submit" className="btn btn-primary">
            Publish Tender
          </button>
        </div>

      </form>
    </div>
  );
};

export default PublishTender;