import React, { useState } from "react";

const MPRApproval = ({ mprList = [], onUpdateMPR }) => {
  const [selectedMPR, setSelectedMPR] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter MPRs: status "S" first, then "A"
  const filteredList = mprList
    .filter(
      (mpr) =>
        ["S", "A"].includes(mpr.status) &&
        (mpr.mprNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mpr.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mpr.projectName?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => (a.status === "S" ? -1 : 1));

  const handleApprove = () => {
    if (!selectedMPR) return;
    const updatedMPR = { ...selectedMPR, status: "A" };
    onUpdateMPR(updatedMPR);
    setSelectedMPR(null);
    alert(`MPR ${updatedMPR.mprNo} Approved ✅`);
  };

  const handleReject = () => {
    if (!rejectionReason) {
      alert("Please provide rejection reason!");
      return;
    }
    const updatedMPR = { ...selectedMPR, status: "R", rejectionReason };
    onUpdateMPR(updatedMPR);
    setSelectedMPR(null);
    setRejectionReason("");
    alert(`MPR ${updatedMPR.mprNo} Rejected ❌`);
  };

  return (
    <div className="container-fluid mt-4 px-2">
      <div className="card shadow-sm p-2">
        <div className="bg-light border-bottom">
          <h4 className="mb-3 text-black">MPR Approval</h4>
        </div>

        {!selectedMPR && (
          <>
            <input
              className="form-control mb-2"
              placeholder="Search by MPR No / Dept / Project"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <table className="table table-bordered table-striped table-sm text-center align-middle">
              <thead className="table-dark">
                <tr>
                  <th>MPR No</th>
                  <th>Department</th>
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan={6}>No MPRs found</td>
                  </tr>
                )}
                {filteredList.map((mpr, idx) => (
                  <tr key={idx}>
                    <td>{mpr.mprNo}</td>
                    <td>{mpr.department}</td>
                    <td>{mpr.projectName}</td>
                    <td>{mpr.priority}</td>
                    <td>{mpr.status}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => setSelectedMPR(mpr)}>
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {selectedMPR && (
          <div className="mt-3">
            <div className="card mb-3 p-3">
              <div className="row">
                <div className="col-md-3"><b>MPR No:</b> {selectedMPR.mprNo}</div>
                <div className="col-md-3"><b>Date:</b> {selectedMPR.dob}</div>
                <div className="col-md-3"><b>Department:</b> {selectedMPR.department}</div>
                <div className="col-md-3"><b>Project:</b> {selectedMPR.projectName}</div>
              </div>
              <div className="row mt-2">
                <div className="col-md-3"><b>Priority:</b> {selectedMPR.priority}</div>
                <div className="col-md-3"><b>Required By:</b> {selectedMPR.deliverySchedule}</div>
                <div className="col-md-3"><b>Status:</b> {selectedMPR.status}</div>
              </div>
            </div>

            <h5 className="mt-4 text-primary">Items</h5>
            <div className="table-responsive">
              <table className="table table-striped table-bordered table-hover table-sm text-center align-middle">
                <thead className="table-dark">
                  <tr style={{ fontSize: "14px" }}>
                    <th>SR</th>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>UOM</th>
                    <th>Specification</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Value</th>
                    <th>Stock</th>
                    <th>AMC</th>
                    <th>Last Purchase</th>
                    <th>Vendor</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMPR.tableRows.map((row, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      {Object.keys(row).map((key) => (
                        <td key={key}>{row[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <h5>Approval Actions</h5>
              <button className="btn btn-secondary me-2" onClick={handleApprove}>Approve</button>
              <button className="btn btn-danger me-2">Reject</button>

              <div className="mt-2">
                <label>Rejection Reason</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <button className="btn btn-danger mt-2" onClick={handleReject}>Confirm Reject</button>
              <button className="btn btn-light mt-2 ms-2" onClick={() => setSelectedMPR(null)}>Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MPRApproval;