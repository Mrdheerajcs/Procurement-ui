import React, { useState, useEffect, useMemo } from "react";
import apiClient from "../../auth/apiClient";

const MPRHistory = () => {
    const [mprList, setMprList] = useState([]);
    const [selectedMPR, setSelectedMPR] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMprHistory();
    }, []);

    const fetchMprHistory = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get("/api/mpr/getallbyMultiStatus", {
                params: {
                    status: ["a", "r"],
                },
                paramsSerializer: (params) => {
                    return params.status.map(s => `status=${s}`).join("&");
                }
            });

            if (res.status === "SUCCESS") {
                setMprList(res.data || []);
            } else {
                console.error("Failed:", res.data?.message);
            }
        } catch (err) {
            console.error("Error fetching MPR history:", err);
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

    const getStatusLabel = (status) => {
        if (status === "a") return "Approved";
        if (status === "r") return "Rejected";
        return status;
    };

    const getStatusBadgeClass = (status) => {
        if (status === "a") return "badge bg-success";
        if (status === "r") return "badge bg-danger";
        return "badge bg-secondary";
    };

    return (
        <div className="container-fluid">
            <div className="mb-4">
                <h1 className="page-title">MPR History</h1>
                <p className="text-muted-soft">View approved and rejected material purchase requests</p>
            </div>

            {!selectedMPR ? (
                <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between gap-3 flex-wrap">
                        <h6 className="mb-0 fw-semibold">Approved &amp; Rejected MPRs</h6>
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
                                            <th>Date</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredList.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="text-center py-5 text-muted-soft">
                                                    <i className="bi bi-inbox fs-3 d-block mb-2" />No history records found
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
                                                <td>{new Date(mpr.mprDate).toLocaleDateString()}</td>
                                                <td className="text-center">
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedMPR(mpr)}>
                                                        <i className="bi bi-eye me-1" />View
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
                        <i className="bi bi-arrow-left me-2" />Back to History
                    </button>

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

                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0 fw-semibold">Line Items</h6>
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
                                            <th>Vendors</th>
                                            <th>Status</th>
                                            <th>Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedMPR.mprDetailResponnces || []).map((row, idx) => (
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
                                                <td>
                                                    {row.vendors?.length > 0
                                                        ? row.vendors.map((v) => v.vendorName).join(", ")
                                                        : <span className="text-muted-soft">—</span>}
                                                </td>
                                                <td>
                                                    <span className={row.status === "a" ? "badge bg-success" : "badge bg-danger"}>
                                                        {row.status === "a" ? "Approved" : "Rejected"}
                                                    </span>
                                                </td>
                                                <td>{row.status === "r" ? row.reason || "—" : "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="card-footer">
                            <button className="btn btn-outline-secondary" onClick={() => setSelectedMPR(null)}>
                                <i className="bi bi-arrow-left me-2" />Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MPRHistory;

/*

                <input
                    className="form-control mb-2"
                    placeholder="Search by MPR No / Dept / Project"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {loading ? (
                    <div className="text-center p-3">Loading...</div>
                ) : (
                    <>
                        {!selectedMPR ? (
                            <table className="table table-bordered table-striped table-sm text-center align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th>MPR No</th>
                                        <th>Department</th>
                                        <th>Project</th>
                                        <th>Priority</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.length === 0 && (
                                        <tr>
                                            <td colSpan={7}>No MPRs found</td>
                                        </tr>
                                    )}
                                    {filteredList.map((mpr) => (
                                        <tr key={mpr.mprId}>
                                            <td>{mpr.mprNo}</td>
                                            <td>{mpr.departmentName || `Dept-${mpr.departmentId}`}</td>
                                            <td>{mpr.projectName}</td>
                                            <td>{mpr.priority}</td>

                                            <td>{new Date(mpr.mprDate).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => setSelectedMPR(mpr)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
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
                                            <b>Department:</b>{" "}
                                            {selectedMPR.departmentName ||
                                                `Dept-${selectedMPR.departmentId}`}
                                        </div>
                                        <div className="col-md-3">
                                            <b>Project:</b> {selectedMPR.projectName}
                                        </div>
                                    </div>
                                </div>

                                <h5 className="mt-3 text-primary">Items</h5>
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
                                                <th>Vendors</th>
                                                <th>Status</th>
                                                <th>Rejected Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(selectedMPR.mprDetailResponnces || []).map((row, idx) => (
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
                                                    <td>
                                                        {row.vendors?.length > 0
                                                            ? row.vendors.map((v) => v.vendorName).join(", ")
                                                            : "-"}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={
                                                                row.status === "a"
                                                                    ? "badge bg-success"
                                                                    : "badge bg-danger"
                                                            }
                                                        >
                                                            {row.status === "a" ? "Approved" : "Rejected"}
                                                        </span>
                                                    </td>
                                                    <td>{row.status === "r" ? row.reason || "-" : "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-3">
                                    <button
                                        className="btn btn-light"
                                        onClick={() => setSelectedMPR(null)}
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MPRHistory;
*/