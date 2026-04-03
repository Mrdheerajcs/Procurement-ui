import React, { useState } from "react";

const CreateMPR = () => {
  const [mprData, setMprData] = useState({
    mprNo: "MPR001",
    dob: "2026-04-02",
    department: "IT",
    projectName: "Project Alpha",
    mprType: "Type A",
    tenderType: "Open",
    priority: "High",
    deliverySchedule: "2026-04-15",
    duration: "30",
    status: "Pending",
    specialNotes: "Initial request",
    justification: "Required for new project",
    tableRows: [
      {
        itemCode: "IT1001",
        itemName: "Laptop",
        uom: "Pieces",
        specification: "Intel i7, 16GB RAM, 512GB SSD",
        qty: "5",
        rate: "80000",
        value: "400000",
        stock: "10",
        amc: "Yes",
        lastPurchase: "2026-01-15",
        remarks: "Urgent requirement"
      },
    ]
  });

  const [showApproval, setShowApproval] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setMprData({ ...mprData, [name]: value });
  };

  const addRow = () => {
    setMprData({
      ...mprData,
      tableRows: [
        ...mprData.tableRows,
        { itemCode: "", itemName: "", uom: "", specification: "", qty: "", rate: "", value: "", stock: "", amc: "", lastPurchase: "", remarks: "" }
      ]
    });
  };

  const removeRow = (index) => {
    if (mprData.tableRows.length === 1) return;
    const rows = [...mprData.tableRows];
    rows.splice(index, 1);
    setMprData({ ...mprData, tableRows: rows });
  };

  const handleRowChange = (index, e) => {
    const { name, value } = e.target;
    const rows = [...mprData.tableRows];
    rows[index][name] = value;
    setMprData({ ...mprData, tableRows: rows });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowApproval(true);
  };

  const handleApprove = () => {
    alert("MPR Approved ✅");
  };

  const handleReject = () => {
    if (!rejectionReason) {
      alert("Please provide rejection reason!");
      return;
    }
    alert("MPR Rejected ❌ Reason: " + rejectionReason);
  };

  // ================= APPROVAL PAGE =================
  if (showApproval) {
    return (
      <div className="container mt-4" style={{ fontSize: "0.9rem" }}>
        <h2 className="mb-4 text-primary">MPR Approval</h2>

        <div className="card mb-3 p-3">
          <div className="row">
            <div className="col-md-3"><b>MPR No:</b> {mprData.mprNo}</div>
            <div className="col-md-3"><b>Date:</b> {mprData.dob}</div>
            <div className="col-md-3"><b>Department:</b> {mprData.department}</div>
            <div className="col-md-3"><b>Project:</b> {mprData.projectName}</div>
          </div>
          <div className="row mt-2">
            <div className="col-md-3"><b>Priority:</b> {mprData.priority}</div>
            <div className="col-md-3"><b>Required By:</b> {mprData.deliverySchedule}</div>
            <div className="col-md-3"><b>Status:</b> {mprData.status}</div>
          </div>
        </div>

        <h5 className="mt-4 text-primary">Items</h5>
        <table className="table table-striped table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>SR</th><th>Item Code</th><th>Item Name</th><th>UOM</th><th>Specification</th>
              <th>Qty</th><th>Rate</th><th>Value</th><th>Stock</th><th>AMC</th>
              <th>Last Purchase</th><th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {mprData.tableRows.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                {Object.keys(row).map((key) => (
                  <td key={key}>{row[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

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
        </div>
      </div>
    );
  }

  // ================= CREATE PAGE =================
  return (
    <div className="container mt-4" style={{ fontSize: "0.9rem" }}>
      <h2 className="mb-4 text-primary">Create MPR</h2>

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-4">
            <label>MPR No</label>
            <input className="form-control" name="mprNo" value={mprData.mprNo} onChange={handleFieldChange} />
          </div>
          <div className="col-md-4">
            <label>DOB</label>
            <input type="date" className="form-control" name="dob" value={mprData.dob} onChange={handleFieldChange} />
          </div>
          <div className="col-md-4">
            <label>Department</label>
            <input className="form-control" name="department" value={mprData.department} onChange={handleFieldChange} />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label>Project Name</label>
            <input className="form-control" name="projectName" value={mprData.projectName} onChange={handleFieldChange} />
          </div>
          <div className="col-md-4">
            <label>MPR Type</label>
            <input className="form-control" name="mprType" value={mprData.mprType} onChange={handleFieldChange} />
          </div>
          <div className="col-md-4">
            <label>Tender Type</label>
            <input className="form-control" name="tenderType" value={mprData.tenderType} onChange={handleFieldChange} />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label>Priority</label>
            <input className="form-control" name="priority" value={mprData.priority} onChange={handleFieldChange} />
          </div>
          <div className="col-md-4">
            <label>Delivery Schedule</label>
            <input type="date" className="form-control" name="deliverySchedule" value={mprData.deliverySchedule} onChange={handleFieldChange} />
          </div>
          <div className="col-md-4">
            <label>Duration</label>
            <input type="number" className="form-control" name="duration" value={mprData.duration} onChange={handleFieldChange} />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label>Status</label>
            <input className="form-control" name="status" value={mprData.status} onChange={handleFieldChange} />
          </div>
          <div className="col-md-4">
            <label>Special Notes</label>
            <textarea className="form-control" rows={2} name="specialNotes" value={mprData.specialNotes} onChange={handleFieldChange}></textarea>
          </div>
          <div className="col-md-4">
            <label>Justification</label>
            <textarea className="form-control" rows={2} name="justification" value={mprData.justification} onChange={handleFieldChange}></textarea>
          </div>
        </div>

        <h5 className="mt-4 text-primary">Items</h5>
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>SR</th><th>Item Code</th><th>Item Name</th><th>UOM</th><th>Specification</th>
              <th>Qty</th><th>Rate</th><th>Value</th><th>Stock</th><th>AMC</th>
              <th>Last Purchase</th><th>Remarks</th><th>Action</th>
            </tr>
          </thead>

          <tbody>
            {mprData.tableRows.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                {Object.keys(row).map((key) => (
                  <td key={key}>
                    <input
                      className="form-control"
                      type={key === "qty" || key === "rate" || key === "value" ? "number" : key === "lastPurchase" ? "date" : "text"}
                      name={key}
                      value={row[key]}
                      onChange={(e) => handleRowChange(index, e)}
                    />
                  </td>
                ))}
                <td>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeRow(index)}>X</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-success" onClick={addRow}>+ Add Row</button>
          <button type="submit" className="btn btn-primary">Submit MPR</button>
        </div>
      </form>
    </div>
  );
};

export default CreateMPR;