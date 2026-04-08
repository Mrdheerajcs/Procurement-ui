
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
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Publish Tender</h1>
        <p className="text-muted-soft">Create and publish a new tender from an MPR</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* MPR Info (read-only) */}
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0 fw-semibold">
                  <i className="bi bi-clipboard2-check me-2 text-primary" />MPR Information
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-sm-6 col-md-3">
                    <label className="form-label text-muted-soft small">MPR No</label>
                    <input className="form-control bg-light" value={formData.mprNo} readOnly />
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <label className="form-label text-muted-soft small">Department</label>
                    <input className="form-control bg-light" value={formData.department} readOnly />
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <label className="form-label text-muted-soft small">Project Name</label>
                    <input className="form-control bg-light" value={formData.projectName} readOnly />
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <label className="form-label text-muted-soft small d-block">Priority</label>
                    <span className={`badge rounded-pill fs-6 px-3 py-2 ${formData.priority === 'High' ? 'bg-danger' : formData.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                      {formData.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tender Details */}
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0 fw-semibold">
                  <i className="bi bi-megaphone me-2 text-primary" />Tender Details
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input className="form-control" id="tenderTitle" name="tenderTitle" placeholder="Tender Title" value={formData.tenderTitle} onChange={handleChange} />
                      <label htmlFor="tenderTitle">Tender Title</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input className="form-control" id="tenderType" name="tenderType" placeholder="Tender Type" value={formData.tenderType} onChange={handleChange} />
                      <label htmlFor="tenderType">Tender Type</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input type="date" className="form-control" id="publishDate" name="publishDate" placeholder="Publish Date" value={formData.publishDate} onChange={handleChange} />
                      <label htmlFor="publishDate">Publish Date</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input type="date" className="form-control" id="closingDate" name="closingDate" placeholder="Closing Date" value={formData.closingDate} onChange={handleChange} />
                      <label htmlFor="closingDate">Closing Date</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input type="time" className="form-control" id="bidTime" name="bidTime" placeholder="Bid Submission End Time" value={formData.bidTime} onChange={handleChange} />
                      <label htmlFor="bidTime">Bid Submission End Time</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input type="number" className="form-control" id="emdAmount" name="emdAmount" placeholder="EMD Amount" value={formData.emdAmount} onChange={handleChange} />
                      <label htmlFor="emdAmount">EMD Amount (INR)</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents & Description */}
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0 fw-semibold">
                  <i className="bi bi-paperclip me-2 text-primary" />Documents &amp; Description
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted-soft small">Upload Documents</label>
                    <input type="file" className="form-control" name="documents" onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <div className="form-floating">
                      <textarea className="form-control" id="description" name="description" placeholder="Description" style={{ height: "120px" }} value={formData.description} onChange={handleChange}></textarea>
                      <label htmlFor="description">Description</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 d-flex justify-content-end">
            <button type="submit" className="btn btn-primary px-5">
              <i className="bi bi-send me-2" />Publish Tender
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PublishTender;
