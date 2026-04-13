import React, { useState } from "react";

const VendorContracts = () => {
  const [selected, setSelected] = useState(null);

  const contracts = [
    {
      id: "CNT-001",
      title: "Supply of IT Equipment",
      client: "ABC Corp",
      date: "2026-04-01",
      status: "Awarded",
      description: "Procurement of laptops, servers, and networking devices.",
      amount: "₹12,50,000",
      reason: "",
    },
    {
      id: "CNT-002",
      title: "Office Furniture Procurement",
      client: "XYZ Ltd",
      date: "2026-03-28",
      status: "Rejected",
      description: "Chairs, desks, and modular office setup.",
      amount: "₹8,20,000",
      reason: "Vendor compliance failed",
    },
    {
      id: "CNT-003",
      title: "Electrical Maintenance Contract",
      client: "Govt Dept",
      date: "2026-03-20",
      status: "Rejected",
      description: "Annual maintenance of electrical systems.",
      amount: "₹5,75,000",
      reason: "Technical rejection",
    },
  ];

  const getBadgeClass = (status) => {
    if (status === "Awarded") return "bg-success";
    if (status === "Rejected") return "bg-danger";
    return "bg-secondary";
  };

  return (
    <div className="container-fluid">

      {/* PAGE HEADER (Same style as CreateMPR) */}
      <div className="mb-4">
        <h1 className="page-title">My Contracts</h1>
        <p className="text-muted-soft">
          View awarded and rejected vendor contracts
        </p>
      </div>

      {/* CONTRACT LIST CARD */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-semibold">Contract List</h6>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Contract ID</th>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {contracts.map((c, index) => (
                  <tr key={index}>
                    <td className="fw-semibold text-primary">{c.id}</td>
                    <td>{c.title}</td>
                    <td>{c.client}</td>
                    <td>{c.date}</td>
                    <td>{c.amount}</td>

                    <td>
                      <span className={`badge rounded-pill ${getBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => setSelected(c)}
                      >
                        <i className="bi bi-eye me-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>

      {/* DETAILS CARD (MPR-style expansion panel) */}
      {selected && (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0 fw-semibold">
              Contract Details - {selected.id}
            </h6>
          </div>

          <div className="card-body">
            <div className="row g-3">

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    className="form-control"
                    value={selected.id}
                    readOnly
                  />
                  <label>Contract ID</label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    className="form-control"
                    value={selected.title}
                    readOnly
                  />
                  <label>Title</label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    className="form-control"
                    value={selected.client}
                    readOnly
                  />
                  <label>Client</label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    className="form-control"
                    value={selected.date}
                    readOnly
                  />
                  <label>Date</label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    className="form-control"
                    value={selected.amount}
                    readOnly
                  />
                  <label>Amount</label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-floating">
                  <input
                    className="form-control"
                    value={selected.status}
                    readOnly
                  />
                  <label>Status</label>
                </div>
              </div>

              <div className="col-md-12">
                <div className="form-floating">
                  <textarea
                    className="form-control"
                    style={{ height: "100px" }}
                    value={selected.description}
                    readOnly
                  />
                  <label>Description</label>
                </div>
              </div>

              {selected.status === "Rejected" && (
                <div className="col-md-12">
                  <div className="alert alert-danger mb-0">
                    <strong>Rejection Reason:</strong> {selected.reason}
                  </div>
                </div>
              )}

              {selected.status === "Awarded" && (
                <div className="col-md-12">
                  <div className="alert alert-success mb-0">
                    🎉 This contract has been awarded to you.
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="card-footer d-flex justify-content-end">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorContracts;