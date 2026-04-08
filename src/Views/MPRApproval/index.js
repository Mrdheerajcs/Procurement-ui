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
    <div className="container-fluid mt-4 px-2">
      <div className="card shadow-sm p-2">
        <div className="bg-light border-bottom">
          <h4 className="mb-3 text-black">MPR Approval</h4>
        </div>

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