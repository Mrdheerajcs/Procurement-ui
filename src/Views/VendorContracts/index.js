import React, { useState, useEffect } from "react";
import apiClient from "../../auth/apiClient";

const VendorContracts = () => {
  const [selected, setSelected] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyContracts();
  }, []);

  const fetchMyContracts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/contracts/my-contracts");
      console.log("Contracts API Response:", res);
      
      if (res.status === "SUCCESS") {
        setContracts(res.data || []);
      } else {
        setError(res.message || "Failed to load contracts");
      }
    } catch (err) {
      console.error("Error fetching contracts:", err);
      setError(err.message || "Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (status) => {
    if (status === "AWARDED") return "bg-success";
    if (status === "REJECTED") return "bg-danger";
    if (status === "PENDING") return "bg-warning";
    return "bg-secondary";
  };

  const getStatusText = (status) => {
    if (status === "AWARDED") return "✓ Awarded";
    if (status === "REJECTED") return "✗ Rejected";
    if (status === "PENDING") return "⏳ Pending";
    return status;
  };

  if (loading) {
    return (
      <div className="container-fluid text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading your contracts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger m-4">{error}</div>
      </div>
    );
  }

  const awardedCount = contracts.filter(c => c.status === "AWARDED").length;
  const totalValue = contracts.filter(c => c.status === "AWARDED").reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">My Contracts</h1>
        <p className="text-muted-soft">View awarded and rejected contracts</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card text-center bg-success text-white">
            <div className="card-body">
              <i className="bi bi-trophy fs-1" />
              <h2 className="mt-2">{awardedCount}</h2>
              <p className="mb-0">Awarded Contracts</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center bg-danger text-white">
            <div className="card-body">
              <i className="bi bi-x-circle fs-1" />
              <h2 className="mt-2">{contracts.filter(c => c.status === "REJECTED").length}</h2>
              <p className="mb-0">Rejected</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center bg-info text-white">
            <div className="card-body">
              <i className="bi bi-currency-rupee fs-1" />
              <h2 className="mt-2">₹ {totalValue.toLocaleString()}</h2>
              <p className="mb-0">Total Contract Value</p>
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
                  <th>Tender No</th>
                  <th>Title</th>
                  <th>Award Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <i className="bi bi-inbox fs-1 text-muted d-block mb-2" />
                      No contracts found
                      <div className="mt-2">
                        <button className="btn btn-primary btn-sm" onClick={() => window.location.href = "/searchtender"}>
                          Browse Tenders
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contracts.map((contract) => (
                    <tr key={contract.contractId}>
                      <td className="fw-semibold text-primary">{contract.contractNo}</td>
                      <td>{contract.tenderNo}</td>
                      <td>{contract.tenderTitle}</td>
                      <td>{new Date(contract.awardDate).toLocaleDateString()}</td>
                      <td>₹ {contract.amount?.toLocaleString()}</td>
                      <td><span className={`badge ${getBadgeClass(contract.status)}`}>
                        {getStatusText(contract.status)}
                      </span></td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setSelected(contract)}>
                          <i className="bi bi-eye me-1" />View Details
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
        <div className="modal-overlay" style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <div className="modal-container" style={{
            backgroundColor: "white", borderRadius: "12px",
            width: "500px", maxWidth: "90%"
          }}>
            <div className="modal-header" style={{
              padding: "16px 20px", borderBottom: "1px solid #ddd",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <h5 className="modal-title">Contract Details - {selected.contractNo}</h5>
              <button className="btn-close" onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "20px" }}>×</button>
            </div>
            <div className="modal-body" style={{ padding: "20px" }}>
              <table className="table table-sm">
                <tbody>
                  <tr><td className="text-muted">Tender No:</td><td><strong>{selected.tenderNo}</strong></td></tr>
                  <tr><td className="text-muted">Title:</td><td>{selected.tenderTitle}</td></tr>
                  <tr><td className="text-muted">Award Date:</td><td>{new Date(selected.awardDate).toLocaleDateString()}</td></tr>
                  <tr><td className="text-muted">Start Date:</td><td>{new Date(selected.startDate).toLocaleDateString()}</td></tr>
                  <tr><td className="text-muted">End Date:</td><td>{new Date(selected.endDate).toLocaleDateString()}</td></tr>
                  <tr><td className="text-muted">Amount:</td><td><strong>₹ {selected.amount?.toLocaleString()}</strong></td></tr>
                  <tr><td className="text-muted">Status:</td><td><span className={`badge ${getBadgeClass(selected.status)}`}>{getStatusText(selected.status)}</span></td></tr>
                  {selected.status === "AWARDED" && (
                    <tr><td colSpan="2" className="text-success"><i className="bi bi-trophy-fill me-2" />🎉 Congratulations! You have won this contract.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-footer" style={{ padding: "16px 20px", borderTop: "1px solid #ddd" }}>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
              {selected.status === "AWARDED" && (
                <button className="btn btn-primary" onClick={() => alert("Work Order download will be available soon")}>
                  <i className="bi bi-download me-1" />Download Work Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorContracts;