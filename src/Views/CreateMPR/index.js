
import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Row, Col, Button, Table, Card } from "react-bootstrap";

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

  // Handle input fields
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

  if (showApproval) {
    return (
      <div className="container mt-4" style={{ fontSize: '0.9rem' }}>
        <h2 className="mb-4" style={{ color: '#007bff' }}>MPR Approval</h2>

        {/* Summary */}
        <Card className="mb-3 p-3">
          <Row>
            <Col md={3}><b>MPR No:</b> {mprData.mprNo}</Col>
            <Col md={3}><b>Date:</b> {mprData.dob}</Col>
            <Col md={3}><b>Department:</b> {mprData.department}</Col>
            <Col md={3}><b>Project:</b> {mprData.projectName}</Col>
          </Row>
          <Row className="mt-2">
            <Col md={3}><b>Priority:</b> {mprData.priority}</Col>
            <Col md={3}><b>Required By:</b> {mprData.deliverySchedule}</Col>
            <Col md={3}><b>Status:</b> {mprData.status}</Col>
          </Row>
        </Card>

        {/* Items Table */}
        <h5 className="mt-4" style={{ color: '#007bff' }}>Items</h5>
        <Table striped bordered hover responsive>
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
        </Table>

        {/* Approval Actions */}
        <div className="mt-3">
          <h5>Approval Actions</h5>
          <div className="mb-2">
            <Button variant="secondary" className="me-2" onClick={handleApprove}>Approve</Button>
            <Button variant="danger" className="me-2" onClick={() => setRejectionReason("")}>Reject</Button>
          </div>
          <Form.Group className="mb-2">
            <Form.Label>Rejection Reason</Form.Label>
            <Form.Control as="textarea" rows={2} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
          </Form.Group>
          <Button variant="danger" onClick={handleReject}>Confirm Reject</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ fontSize: '0.9rem' }}>
      <h2 className="mb-4" style={{ color: '#007bff' }}>Create MPR</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={4}><Form.Group><Form.Label>MPR No</Form.Label><Form.Control type="text" name="mprNo" value={mprData.mprNo} onChange={handleFieldChange} placeholder="Enter MPR No" /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>DOB</Form.Label><Form.Control type="date" name="dob" value={mprData.dob} onChange={handleFieldChange} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Department</Form.Label><Form.Control type="text" name="department" value={mprData.department} onChange={handleFieldChange} placeholder="Enter Department" /></Form.Group></Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}><Form.Group><Form.Label>Project Name</Form.Label><Form.Control type="text" name="projectName" value={mprData.projectName} onChange={handleFieldChange} placeholder="Enter Project Name" /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>MPR Type</Form.Label><Form.Control type="text" name="mprType" value={mprData.mprType} onChange={handleFieldChange} placeholder="Enter MPR Type" /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Tender Type</Form.Label><Form.Control type="text" name="tenderType" value={mprData.tenderType} onChange={handleFieldChange} placeholder="Enter Tender Type" /></Form.Group></Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}><Form.Group><Form.Label>Priority</Form.Label><Form.Control type="text" name="priority" value={mprData.priority} onChange={handleFieldChange} placeholder="Enter Priority" /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Delivery Schedule</Form.Label><Form.Control type="date" name="deliverySchedule" value={mprData.deliverySchedule} onChange={handleFieldChange} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Duration (Days)</Form.Label><Form.Control type="number" name="duration" value={mprData.duration} onChange={handleFieldChange} placeholder="Enter Duration" /></Form.Group></Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}><Form.Group><Form.Label>Status</Form.Label><Form.Control type="text" name="status" value={mprData.status} onChange={handleFieldChange} placeholder="Enter Status" /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Special Notes</Form.Label><Form.Control as="textarea" rows={2} name="specialNotes" value={mprData.specialNotes} onChange={handleFieldChange} /></Form.Group></Col>
          <Col md={4}><Form.Group><Form.Label>Justification</Form.Label><Form.Control as="textarea" rows={2} name="justification" value={mprData.justification} onChange={handleFieldChange} /></Form.Group></Col>
        </Row>

        {/* Items Table */}
        <h5 className="mt-4" style={{ color: '#007bff' }}>Items</h5>
        <Table striped bordered hover responsive>
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
                    <Form.Control
                      type={key === "qty" || key === "rate" || key === "value" ? "number" : key === "lastPurchase" ? "date" : "text"}
                      name={key}
                      value={row[key]}
                      onChange={(e) => handleRowChange(index, e)}
                    />
                  </td>
                ))}
                <td><Button variant="danger" size="sm" onClick={() => removeRow(index)}>X</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="d-flex justify-content-between">
          <Button variant="success" onClick={addRow}>+ Add Row</Button>
          <Button type="submit" variant="primary">Submit MPR</Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateMPR;