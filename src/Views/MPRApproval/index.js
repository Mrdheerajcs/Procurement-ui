import React, { useState, useEffect, useMemo } from "react";
import apiClient from "../../auth/apiClient";
import MessagePopup from "../../Components/MessagePopup";

const MPRApproval = () => {
  const [mprList, setMprList] = useState([]);
  const [selectedMPR, setSelectedMPR] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemActions, setItemActions] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetchMprList();
  }, []);

  const fetchMprList = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/mpr/getallbyStatus", {
        params: { status: "n" },
      });

      if (res.status === "SUCCESS") {
        setMprList(res.data || []); // store raw data
      } else {
        console.error("Failed:", res.data?.message);
      }
    } catch (err) {
      console.error("Error fetching MPR List:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return mprList.filter((mpr) => {
      const department = mpr.departmentName || `Dept-${mpr.departmentId}`;
      return (
        String(mpr.mprNo || "").toLowerCase().includes(search) ||
        String(mpr.projectName || "").toLowerCase().includes(search) ||
        department.toLowerCase().includes(search)
      );
    });
  }, [searchTerm, mprList]);

  const handleStatusChange = (id, status) => {
    setItemActions((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status,
      },
    }));
  };

  const handleReasonChange = (id, reason) => {
    setItemActions((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        reason,
      },
    }));
  };

  const isAllSelected = selectedMPR?.mprDetailResponnces?.every((row) => {
    const action = itemActions[row.mprDetailId];
    return action?.status && (action.status !== "r" || action.reason?.trim());
  });

  const handleSubmit = async () => {
    if (!selectedMPR) return;

    const payload = {
      mprHeaderId: selectedMPR.mprId,
      mprApprovalLists: (selectedMPR.mprDetailResponnces || []).map((row) => ({
        mprdetailId: row.mprDetailId,
        status: itemActions[row.mprDetailId]?.status,
        remarks: itemActions[row.mprDetailId]?.reason || "",
      })),
    };

    try {
      const res = await apiClient.put("/api/mpr/approve", payload);

      console.log("API RESPONSE:", res);

      if (res.status === "SUCCESS") {
        setMsg({ type: "success", text: res.message });

        setSelectedMPR(null);
        fetchMprList();
      } else {
        setMsg({
          type: "error",
          text: res.message || "Submission failed",
        });
      }
    } catch (err) {
      console.error("Error submitting approval:", err);
      setMsg({
        type: "error",
        text: "Server error. Please try again.",
      });
    }
  };


  const getStatusLabel = (status) => {
    if (status === "n") return "Pending";
    if (status === "a") return "Approved";
    if (status === "r") return "Rejected";
    return status;
  };

  return (
    <div className="container-fluid">
      {msg && (
        <MessagePopup type={msg.type} message={msg.text} duration={4000} onClose={() => setMsg(null)} />
      )}

      <div className="mb-4">
        <h1 className="page-title">MPR Approval</h1>
        <p className="text-muted-soft">Review and approve pending material purchase requests</p>
      </div>

      {!selectedMPR ? (
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <h6 className="mb-0 fw-semibold">Pending Approvals</h6>
            <div className="input-group" style={{ maxWidth: "320px" }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted" />
              </span>
              <input
                type="search"
                className="form-control border-start-0"
                placeholder="Search by MPR No / Dept / Project…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>MPR No</th>
                      <th>Department</th>
                      <th>Project</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted-soft">
                          <i className="bi bi-inbox fs-3 d-block mb-2" />No pending MPRs found
                        </td>
                      </tr>
                    )}
                    {filteredList.map((mpr) => (
                      <tr key={mpr.mprId}>
                        <td><span className="fw-semibold text-primary">{mpr.mprNo}</span></td>
                        <td>{mpr.departmentName || `Dept-${mpr.departmentId}`}</td>
                        <td>{mpr.projectName}</td>
                        <td>
                          <span className={`badge rounded-pill ${mpr.priority === 'High' ? 'bg-danger' : mpr.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                            {mpr.priority}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-warning text-dark">{getStatusLabel(mpr.status)}</span>
                        </td>
                        <td className="text-center">
                          <button className="btn btn-sm btn-primary" onClick={() => { setSelectedMPR(mpr); setItemActions({}); }}>
                            <i className="bi bi-folder2-open me-1" />Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => setSelectedMPR(null)}>
            <i className="bi bi-arrow-left me-2" />Back to List
          </button>

          {/* MPR Header Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">MPR Details — {selectedMPR.mprNo}</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted-soft small mb-1">MPR Number</div>
                  <div className="fw-semibold">{selectedMPR.mprNo}</div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted-soft small mb-1">Date</div>
                  <div className="fw-semibold">{new Date(selectedMPR.mprDate).toLocaleDateString()}</div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted-soft small mb-1">Department</div>
                  <div className="fw-semibold">{selectedMPR.departmentName || `Dept-${selectedMPR.departmentId}`}</div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted-soft small mb-1">Project</div>
                  <div className="fw-semibold">{selectedMPR.projectName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">Line Items — Approve / Reject</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>SR</th>
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>UOM</th>
                      <th>Specification</th>
                      <th className="text-end">Qty</th>
                      <th className="text-end">Rate</th>
                      <th className="text-end">Value</th>
                      <th className="text-end">Stock</th>
                      <th>AMC</th>
                      <th>Last Purchase</th>
                      <th>Vendors</th>
                      <th>Decision</th>
                      <th>Reason (if rejected)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedMPR.mprDetailResponnces || []).map((row, idx) => {
                      const action = itemActions[row.mprDetailId] || {};
                      return (
                        <tr key={row.mprDetailId || idx}>
                          <td>{idx + 1}</td>
                          <td><code>{row.itemCode}</code></td>
                          <td className="fw-semibold">{row.itemName}</td>
                          <td>{row.uom}</td>
                          <td>{row.specification}</td>
                          <td className="text-end">{row.requestedQty}</td>
                          <td className="text-end">{row.estimatedRate}</td>
                          <td className="text-end">{row.estimatedValue}</td>
                          <td className="text-end">{row.stockAvailable}</td>
                          <td>{row.avgMonthlyConsumption}</td>
                          <td>{row.lastPurchaseInfo}</td>
                          <td>
                            {row.vendors?.length > 0
                              ? row.vendors.map((v) => v.vendorName).join(", ")
                              : <span className="text-muted-soft">—</span>}
                          </td>
                          <td style={{ minWidth: "130px" }}>
                            <select
                              className={`form-select form-select-sm ${action.status === 'a' ? 'border-success' : action.status === 'r' ? 'border-danger' : ''}`}
                              value={action.status || ""}
                              onChange={(e) => handleStatusChange(row.mprDetailId, e.target.value)}
                            >
                              <option value="">— Select —</option>
                              <option value="a">✓ Approve</option>
                              <option value="r">✗ Reject</option>
                            </select>
                          </td>
                          <td style={{ minWidth: "180px" }}>
                            {action.status === "r" && (
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Enter reason…"
                                value={action.reason || ""}
                                onChange={(e) => handleReasonChange(row.mprDetailId, e.target.value)}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer d-flex gap-2 justify-content-end">
              <button className="btn btn-outline-secondary" onClick={() => setSelectedMPR(null)}>
                <i className="bi bi-arrow-left me-2" />Back
              </button>
              <button className="btn btn-success" disabled={!isAllSelected} onClick={handleSubmit}>
                <i className="bi bi-check2-all me-2" />Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MPRApproval;

/*

        {msg && (
          <MessagePopup
            type={msg.type}
            message={msg.text}
            duration={4000}
            onClose={() => setMsg(null)}
          />
        )}
        {!selectedMPR && (
          <>
            <input
              className="form-control mb-2"
              placeholder="Search by MPR No / Dept / Project"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading ? (
              <div className="text-center p-3">Loading...</div>
            ) : (
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

                  {filteredList.map((mpr) => (
                    <tr key={mpr.mprId}>
                      <td>{mpr.mprNo}</td>
                      <td>{mpr.departmentName || `Dept-${mpr.departmentId}`}</td>
                      <td>{mpr.projectName}</td>
                      <td>{mpr.priority}</td>
                      <td>{getStatusLabel(mpr.status)}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSelectedMPR(mpr);
                            setItemActions({});
                          }}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {selectedMPR && (
          <div className="mt-3">
            <div className="card mb-3 p-3">
              <div className="row">
                <div className="col-md-3">
                  <b>MPR No:</b> {selectedMPR.mprNo}
                </div>
                <div className="col-md-3">
                  <b>Date:</b>{" "}
                  {new Date(selectedMPR.mprDate).toLocaleDateString()}
                </div>
                <div className="col-md-3">
                  <b>Department:</b> {selectedMPR.departmentName || `Dept-${selectedMPR.departmentId}`}
                </div>
                <div className="col-md-3">
                  <b>Project:</b> {selectedMPR.projectName}
                </div>
              </div>
            </div>

            <h5 className="mt-4 text-primary">Items</h5>
            <div className="table-responsive">
              <table className="table table-striped table-bordered table-hover table-sm text-center align-middle">
                <thead className="table-dark">
                  <tr>
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
                    <th>Vendors</th>
                    <th>Action</th>
                    <th>Rejected Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {(selectedMPR.mprDetailResponnces || []).map((row, idx) => {
                    const action = itemActions[row.mprDetailId] || {};
                    return (
                      <tr key={row.mprDetailId || idx}>
                        <td>{idx + 1}</td>
                        <td>{row.itemCode}</td>
                        <td>{row.itemName}</td>
                        <td>{row.uom}</td>
                        <td>{row.specification}</td>
                        <td>{row.requestedQty}</td>
                        <td>{row.estimatedRate}</td>
                        <td>{row.estimatedValue}</td>
                        <td>{row.stockAvailable}</td>
                        <td>{row.avgMonthlyConsumption}</td>
                        <td>{row.lastPurchaseInfo}</td>
                        <td>
                          {row.vendors?.length > 0
                            ? row.vendors.map((v) => v.vendorName).join(", ")
                            : "-"}
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={action.status || ""}
                            onChange={(e) =>
                              handleStatusChange(row.mprDetailId, e.target.value)
                            }
                          >
                            <option value="">Select</option>
                            <option value="a">Approve</option>
                            <option value="r">Reject</option>
                          </select>
                        </td>
                        <td>
                          {action.status === "r" && (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Enter reason"
                              value={action.reason || ""}
                              onChange={(e) =>
                                handleReasonChange(row.mprDetailId, e.target.value)
                              }
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <button
                className="btn btn-success"
                disabled={!isAllSelected}
                onClick={handleSubmit}
              >
                Submit
              </button>

              <button
                className="btn btn-light ms-2"
                onClick={() => setSelectedMPR(null)}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MPRApproval;
*/