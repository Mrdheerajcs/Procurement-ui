import React, { useState, useEffect } from "react";
import apiClient from "../../auth/apiClient";
import DocumentViewer from "../../Components/DocumentViewer";

const VendorContracts = () => {
  const [selected, setSelected] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState({});
  const [viewerDoc, setViewerDoc] = useState(null);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [workOrder, setWorkOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMyContracts();
  }, []);

  const fetchMyContracts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/contracts/my-contracts");
      if (res.status === "SUCCESS") {
        setContracts(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching contracts:", err);
      setError(err.message || "Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadWorkOrder = async (contractId) => {
    try {
      const res = await apiClient.get(`/api/contracts/${contractId}/download-work-order`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `work_order_${contractId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      alert("Work order downloaded successfully!");
    } catch (err) {
      alert("Work order not available yet");
    }
  };

  const handleUploadPBG = async (contractId, file) => {
    if (!file) return;
    if (!file.name.endsWith('.pdf')) {
      alert("Only PDF files are allowed for PBG");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("PBG file size must be less than 5MB");
      return;
    }
    
    setUploading(prev => ({ ...prev, [contractId]: true }));
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiClient.post(`/api/contracts/${contractId}/upload-pbg`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.status === "SUCCESS") {
        alert("PBG uploaded successfully!");
        fetchMyContracts();
      } else {
        alert(res.message || "Failed to upload PBG");
      }
    } catch (err) {
      alert("Failed to upload PBG: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(prev => ({ ...prev, [contractId]: false }));
    }
  };

  const viewWorkOrder = async (contractId) => {
    try {
      const res = await apiClient.get(`/api/contracts/${contractId}/view-work-order`);
      if (res.status === "SUCCESS") {
        setWorkOrder(res.data);
        setShowWorkOrderModal(true);
      }
    } catch (err) {
      alert("Work order details not available");
    }
  };

  const getBadgeClass = (status) => {
    switch(status) {
      case "AWARDED": return "bg-success";
      case "REJECTED": return "bg-danger";
      case "PENDING": return "bg-warning text-dark";
      case "SIGNED": return "bg-info";
      default: return "bg-secondary";
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case "AWARDED": return "✓ Awarded";
      case "REJECTED": return "✗ Rejected";
      case "PENDING": return "⏳ Pending";
      case "SIGNED": return "✍ Signed";
      default: return status;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹ 0";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const filteredContracts = contracts.filter(contract => 
    contract.contractNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.tenderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.tenderTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const awardedCount = contracts.filter(c => c.status === "AWARDED").length;
  const signedCount = contracts.filter(c => c.status === "SIGNED").length;
  const totalValue = contracts.filter(c => c.status === "AWARDED" || c.status === "SIGNED").reduce((sum, c) => sum + (c.amount || 0), 0);

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading your contracts...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">My Contracts</h1>
        <p className="text-muted-soft">View awarded contracts, download work orders, and upload Performance Bank Guarantee (PBG)</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card text-center border-success">
            <div className="card-body">
              <i className="bi bi-trophy-fill fs-1 text-success" />
              <h2 className="mt-2 text-success">{awardedCount}</h2>
              <p className="mb-0 text-muted">Awarded Contracts</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center border-info">
            <div className="card-body">
              <i className="bi bi-pencil-square fs-1 text-info" />
              <h2 className="mt-2 text-info">{signedCount}</h2>
              <p className="mb-0 text-muted">Signed & Active</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center border-primary">
            <div className="card-body">
              <i className="bi bi-currency-rupee fs-1 text-primary" />
              <h2 className="mt-2 text-primary">{formatCurrency(totalValue)}</h2>
              <p className="mb-0 text-muted">Total Contract Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="input-group" style={{ maxWidth: "350px" }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted" />
            </span>
            <input
              type="search"
              className="form-control border-start-0"
              placeholder="Search by Contract No / Tender No / Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="card">
        <div className="card-header">
          <h6 className="mb-0 fw-semibold">All Contracts</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Contract No</th>
                  <th>Tender No</th>
                  <th>Title</th>
                  <th>Award Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Work Order</th>
                  <th>PBG (Bank Guarantee)</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-5 text-muted">No contracts found</td></tr>
                ) : (
                  filteredContracts.map((contract) => (
                    <tr key={contract.contractId}>
                      <td className="fw-semibold text-primary">{contract.contractNo}</td>
                      <td>{contract.tenderNo}</td>
                      <td className="text-truncate" style={{ maxWidth: "250px" }} title={contract.tenderTitle}>
                        {contract.tenderTitle}
                      </td>
                      <td>{new Date(contract.awardDate).toLocaleDateString()}</td>
                      <td className="fw-semibold">{formatCurrency(contract.amount)}</td>
                      <td><span className={`badge ${getBadgeClass(contract.status)}`}>{getStatusText(contract.status)}</span></td>
                      <td>
                        {(contract.status === "AWARDED" || contract.status === "SIGNED") && (
                          <div className="d-flex gap-1">
                            <button 
                              className="btn btn-sm btn-outline-primary" 
                              onClick={() => handleDownloadWorkOrder(contract.contractId)} 
                              title="Download Work Order"
                            >
                              <i className="bi bi-download" />
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-info" 
                              onClick={() => viewWorkOrder(contract.contractId)} 
                              title="Preview Work Order"
                            >
                              <i className="bi bi-eye" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        {(contract.status === "AWARDED" || contract.status === "SIGNED") && (
                          <div className="d-flex align-items-center gap-2">
                            <input 
                              type="file" 
                              className="form-control form-control-sm" 
                              accept=".pdf" 
                              style={{ width: "120px" }}
                              onChange={(e) => handleUploadPBG(contract.contractId, e.target.files[0])} 
                              disabled={uploading[contract.contractId]}
                            />
                            {uploading[contract.contractId] && (
                              <div className="spinner-border spinner-border-sm text-primary" />
                            )}
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelected(contract)}>
                          <i className="bi bi-eye me-1" />Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Contract Details Modal */}
      {selected && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Contract Details - {selected.contractNo}</h5>
                <button type="button" className="btn-close" onClick={() => setSelected(null)} />
              </div>
              <div className="modal-body">
                <table className="table table-bordered">
                  <tbody>
                    <tr><td className="text-muted" style={{ width: "40%" }}>Contract No:</td><td><strong>{selected.contractNo}</strong></td></tr>
                    <tr><td className="text-muted">Tender No:</td><td>{selected.tenderNo}</td></tr>
                    <tr><td className="text-muted">Tender Title:</td><td>{selected.tenderTitle}</td></tr>
                    <tr><td className="text-muted">Award Date:</td><td>{new Date(selected.awardDate).toLocaleDateString()}</td></tr>
                    <tr><td className="text-muted">Start Date:</td><td>{selected.startDate ? new Date(selected.startDate).toLocaleDateString() : "-"}</td></tr>
                    <tr><td className="text-muted">End Date:</td><td>{selected.endDate ? new Date(selected.endDate).toLocaleDateString() : "-"}</td></tr>
                    <tr><td className="text-muted">Amount:</td><td><strong className="text-primary">{formatCurrency(selected.amount)}</strong></td></tr>
                    <tr><td className="text-muted">Status:</td><td><span className={`badge ${getBadgeClass(selected.status)}`}>{getStatusText(selected.status)}</span></td></tr>
                  </tbody>
                </table>
                {selected.status === "AWARDED" && (
                  <div className="alert alert-success mt-2">
                    <i className="bi bi-trophy-fill me-2" />🎉 Congratulations! You have won this contract. Please submit PBG to proceed.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Work Order Modal */}
      {showWorkOrderModal && workOrder && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Work Order - {workOrder.workOrderNo}</h5>
                <button type="button" className="btn-close" onClick={() => setShowWorkOrderModal(false)} />
              </div>
              <div className="modal-body">
                <table className="table table-bordered">
                  <tbody>
                    <tr><td className="text-muted" style={{ width: "40%" }}>Contract No:</td><td>{workOrder.contractNo}</td></tr>
                    <tr><td className="text-muted">Contract Title:</td><td>{workOrder.tenderTitle}</td></tr>
                    <tr><td className="text-muted">Vendor Name:</td><td>{workOrder.vendorName}</td></tr>
                    <tr><td className="text-muted">Issue Date:</td><td>{new Date(workOrder.issueDate).toLocaleDateString()}</td></tr>
                    <tr><td className="text-muted">Delivery Date:</td><td>{new Date(workOrder.deliveryDate).toLocaleDateString()}</td></tr>
                    <tr><td className="text-muted">Total Amount:</td><td><strong className="text-primary">{formatCurrency(workOrder.totalAmount)}</strong></td></tr>
                    <tr><td className="text-muted">Status:</td><td>{workOrder.status}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowWorkOrderModal(false)}>Close</button>
              </div>
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

export default VendorContracts;