import React, { useState } from "react";

const mockData = [
  {
    id: 1,
    tenderName: "Road Construction",
    company: "ABC Pvt Ltd",
    oem: "OEM Corp",
    gst: "22AAAAA0000A1Z5",
  },
  {
    id: 2,
    tenderName: "Bridge Project",
    company: "XYZ Ltd",
    oem: "BuildTech",
    gst: "33BBBBB1111B2Z6",
  },
];

export default function TenderDashboard() {
  const [selectedTender, setSelectedTender] = useState(null);

  return (
    <div className="container-fluid mt-3">

      {!selectedTender ? (
        <>
          {/* Search */}
          <div className="card p-3 shadow-sm mb-3">
            <div className="row g-3">
              <div className="col-md-3"><input className="form-control" placeholder="Search by Bid No" /></div>
              <div className="col-md-3"><input className="form-control" placeholder="Bid Name" /></div>
              <div className="col-md-3"><input className="form-control" placeholder="Project Name" /></div>
              <div className="col-md-3"><input type="date" className="form-control" /></div>
            </div>
          </div>

          {/* Table */}
          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>ID / Name</th>
                    <th>Company</th>
                    <th>OEM</th>
                    <th>GST No</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {mockData.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id} - {row.tenderName}</td>
                      <td>{row.company}</td>
                      <td>{row.oem}</td>
                      <td>{row.gst}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setSelectedTender(row)}>
                          Open Tender
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card shadow">
          <div className="card-header">Tender Details</div>

          <div className="card-body">

            <div className="row mb-3">
              <div className="col-md-6"><b>Tender Name:</b> {selectedTender.tenderName}</div>
              <div className="col-md-6"><b>Company:</b> {selectedTender.company}</div>
              <div className="col-md-6"><b>OEM:</b> {selectedTender.oem}</div>
              <div className="col-md-6"><b>GST:</b> {selectedTender.gst}</div>
            </div>

            <h6>Technical Documents</h6>
            <ul>
              <li>Document1.pdf</li>
              <li>Document2.pdf</li>
            </ul>

            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-success">Approve</button>
              <button className="btn btn-danger">Reject</button>
              <button className="btn btn-warning">Clarification Required</button>
            </div>

            <div className="mt-3">
              <button className="btn btn-outline-primary">Open Commercial Section</button>
            </div>

            <button className="btn btn-secondary mt-3" onClick={() => setSelectedTender(null)}>
              Back
            </button>

          </div>
        </div>
      )}
    </div>
  );
}