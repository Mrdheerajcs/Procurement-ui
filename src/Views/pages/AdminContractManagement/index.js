import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";
import DocumentViewer from "../../../Components/DocumentViewer";

const AdminContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    awarded: 0,
    signed: 0,
    pending: 0
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/contracts/by-status");
      if (res.status === "SUCCESS") {
        setContracts(res.data || []);
        calculateStats(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (contractsList) => {
    setStats({
      total: contractsList.length,
      awarded: contractsList.filter(c => c.status === "AWARDED").length,
      signed: contractsList.filter(c => c.status === "SIGNED").length,
      pending: contractsList.filter(c => c.status === "PENDING").length
    });
  };

  const filterContracts = () => {
    let filtered = [...contracts];
    
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.contractNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tenderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tenderTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredContracts(filtered);
  };

  useEffect(() => {
    filterContracts();
  }, [statusFilter, searchTerm, contracts]);

  const handleViewDetails = (contract) => {
    setSelectedContract(contract);
    setShowModal(true);
  };

  const handleUpdateStatus = async (contractId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this contract as ${newStatus}?`)) return;
    
    setUpdating(true);
    try {
      const res = await apiClient.patch(`/api/contracts/${contractId}/status?status=${newStatus}`);
      if (res.status === "SUCCESS") {
        alert(`Contract marked as ${newStatus} successfully!`);
        fetchContracts();
        setShowModal(false);
        setSelectedContract(null);
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadWorkOrder = async (contractId) => {
    try {
      const res = await apiClient.get(`/api/contracts/${contractId}/generate-work-order`, {
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
      alert("Work Order downloaded successfully!");
    } catch (err) {
      alert("Failed to generate Work Order");
    }
  };

  // ✅ FIXED: Simplified viewPBG function
  const viewPBG = (filePath) => {
    console.log("PBG File Path:", filePath);
    if (filePath) {
      // Clean the file path (remove any extra quotes or spaces)
      const cleanPath = filePath.replace(/^["']|["']$/g, '').trim();
      console.log("Clean file path:", cleanPath);
      setViewerDoc({ filePath: cleanPath, fileName: "Performance Bank Guarantee" });
    } else {
      alert("PBG not uploaded yet");
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹ 0";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "AWARDED": return <span className="badge bg-success">✓ Awarded</span>;
      case "SIGNED": return <span className="badge bg-info">✍ Signed</span>;
      case "REJECTED": return <span className="badge bg-danger">✗ Rejected</span>;
      case "PENDING": return <span className="badge bg-warning text-dark">⏳ Pending</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading contracts...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Contract Management</h1>
        <p className="text-muted-soft">Manage all awarded contracts, verify PBG, and mark contracts as signed</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-center bg-primary text-white">
            <div className="card-body">
              <i className="bi bi-files fs-1" />
              <h2 className="mt-2">{stats.total}</h2>
              <p className="mb-0">Total Contracts</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-warning text-dark">
            <div className="card-body">
              <i className="bi bi-hourglass-split fs-1" />
              <h2 className="mt-2">{stats.pending}</h2>
              <p className="mb-0">Pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-success text-white">
            <div className="card-body">
              <i className="bi bi-trophy fs-1" />
              <h2 className="mt-2">{stats.awarded}</h2>
              <p className="mb-0">Awarded</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-info text-white">
            <div className="card-body">
              <i className="bi bi-pencil-square fs-1" />
              <h2 className="mt-2">{stats.signed}</h2>
              <p className="mb-0">Signed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small">Status Filter</label>
              <select 
                className="form-select" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Contracts</option>
                <option value="PENDING">Pending</option>
                <option value="AWARDED">Awarded</option>
                <option value="SIGNED">Signed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by Contract No / Vendor / Tender..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-outline-secondary w-100" onClick={filterContracts}>
                <i className="bi bi-search me-1" />Apply Filters
              </button>
            </div>
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
                  <th>Vendor Name</th>
                  <th>Tender Title</th>
                  <th>Award Date</th>
                  <th>Amount</th>
                  <th>PBG Status</th>
                  <th>Contract Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.length === 0 ? (
                  <td><td colSpan={8} className="text-center py-5 text-muted">No contracts found</td></td>
                ) : (
                  filteredContracts.map((contract) => (
                    <tr key={contract.contractId}>
                      <td className="fw-semibold text-primary">{contract.contractNo}</td>
                      <td>{contract.vendorName}</td>
                      <td className="text-truncate" style={{ maxWidth: "200px" }} title={contract.tenderTitle}>
                        {contract.tenderTitle}
                      </td>
                      <td>{new Date(contract.awardDate).toLocaleDateString()}</td>
                      <td className="fw-semibold">{formatCurrency(contract.amount)}</td>
                      <td>
                        {contract.pbgPath ? (
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle me-1" />Uploaded
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            <i className="bi bi-clock me-1" />Pending
                          </span>
                        )}
                      </td>
                      <td>{getStatusBadge(contract.status)}</td>
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          <button 
                            className="btn btn-sm btn-outline-info" 
                            onClick={() => handleDownloadWorkOrder(contract.contractId)}
                            title="Download Work Order"
                          >
                            <i className="bi bi-file-pdf" />
                          </button>
                          {contract.pbgPath && (
                            <button 
                              className="btn btn-sm btn-outline-primary" 
                              onClick={() => viewPBG(contract.pbgPath)}
                              title="View PBG"
                            >
                              <i className="bi bi-eye" />
                            </button>
                          )}
                          <button 
                            className="btn btn-sm btn-outline-secondary" 
                            onClick={() => handleViewDetails(contract)}
                            title="View Details"
                          >
                            <i className="bi bi-three-dots" />
                          </button>
                        </div>
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
      {showModal && selectedContract && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Contract Details - {selectedContract.contractNo}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-primary">Basic Information</h6>
                    <table className="table table-sm table-bordered">
                      <tbody>
                        <tr><td className="text-muted" style={{ width: "40%" }}>Contract No:</td><td><strong>{selectedContract.contractNo}</strong></td></tr>
                        <tr><td className="text-muted">Tender No:</td><td>{selectedContract.tenderNo}</td></tr>
                        <tr><td className="text-muted">Tender Title:</td><td>{selectedContract.tenderTitle}</td></tr>
                        <tr><td className="text-muted">Vendor Name:</td><td>{selectedContract.vendorName}</td></tr>
                        <tr><td className="text-muted">Award Date:</td><td>{new Date(selectedContract.awardDate).toLocaleDateString()}</td></tr>
                        <tr><td className="text-muted">Start Date:</td><td>{selectedContract.startDate ? new Date(selectedContract.startDate).toLocaleDateString() : "-"}</td></tr>
                        <tr><td className="text-muted">End Date:</td><td>{selectedContract.endDate ? new Date(selectedContract.endDate).toLocaleDateString() : "-"}</td></tr>
                        <tr><td className="text-muted">Amount:</td><td><strong className="text-primary">{formatCurrency(selectedContract.amount)}</strong></td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-primary">PBG Information</h6>
                    <table className="table table-sm table-bordered">
                      <tbody>
                        <tr><td className="text-muted" style={{ width: "40%" }}>PBG Status:</td>
                          <td>{selectedContract.pbgPath ? 
                            <span className="badge bg-success">✓ Uploaded</span> : 
                            <span className="badge bg-warning text-dark">Pending</span>}
                          </td>
                        </tr>
                        {selectedContract.pbgPath && (
                          <tr>
                            <td className="text-muted">PBG Document:</td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => viewPBG(selectedContract.pbgPath)}>
                                <i className="bi bi-eye me-1" />View PBG
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    
                    <h6 className="text-primary mt-3">Contract Status</h6>
                    <div className="alert alert-info">
                      <strong>Current Status:</strong> {getStatusBadge(selectedContract.status)}
                    </div>
                    
                    {selectedContract.status === "AWARDED" && (
                      <div className="alert alert-warning">
                        <i className="bi bi-info-circle me-2" />
                        PBG received? Click "Sign Contract" after verification.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleDownloadWorkOrder(selectedContract.contractId)}
                >
                  <i className="bi bi-download me-1" />Download Work Order
                </button>
                {selectedContract.status === "AWARDED" && selectedContract.pbgPath && (
                  <button 
                    className="btn btn-success" 
                    onClick={() => handleUpdateStatus(selectedContract.contractId, "SIGNED")}
                    disabled={updating}
                  >
                    {updating ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-check-lg me-1" />}
                    Sign Contract
                  </button>
                )}
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

export default AdminContractManagement;