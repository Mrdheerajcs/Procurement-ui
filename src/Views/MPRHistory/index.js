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
        <div className="container-fluid mt-4 px-2">
            <div className="card shadow-sm p-2">
                <div className="bg-light border-bottom mb-3">
                    <h4 className="mb-3 text-black">MPR History (Approved / Rejected)</h4>
                </div>

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