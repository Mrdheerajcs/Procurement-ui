import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        username: "",
        action: "",
        startDate: "",
        endDate: ""
    });
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const actions = [
        "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", 
        "PUBLISH", "LOGIN_SUCCESS", "LOGIN_FAILED", "LOGOUT"
    ];

    useEffect(() => {
        fetchLogs();
    }, [page, filters]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let url = `/api/audit/logs?page=${page}&size=50`;
            if (filters.username) url += `&username=${filters.username}`;
            if (filters.action) url += `&action=${filters.action}`;
            if (filters.startDate && filters.endDate) {
                url += `&startDate=${filters.startDate}&endDate=${filters.endDate}`;
            }
            const res = await apiClient.get(url);
            if (res.status === "SUCCESS") {
                setLogs(res.data.content);
                setTotalPages(res.data.totalPages);
                setTotalElements(res.data.totalElements);
            }
        } catch (err) {
            console.error("Error fetching audit logs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(0);
    };

    const getActionBadgeClass = (action) => {
        if (action === "CREATE") return "bg-success";
        if (action === "UPDATE") return "bg-warning text-dark";
        if (action === "DELETE") return "bg-danger";
        if (action === "APPROVE") return "bg-info text-dark";
        if (action === "REJECT") return "bg-danger";
        if (action === "PUBLISH") return "bg-primary";
        if (action === "LOGIN_SUCCESS") return "bg-success";
        if (action === "LOGIN_FAILED") return "bg-danger";
        if (action === "LOGOUT") return "bg-secondary";
        return "bg-secondary";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    return (
        <div className="container-fluid">
            <div className="mb-4">
                <h1 className="page-title">Audit Logs</h1>
                <p className="text-muted-soft">Track all user activities and system changes</p>
            </div>

            {/* Filters Card */}
            <div className="card mb-4">
                <div className="card-header">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-funnel me-2" />Filters
                    </h6>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="username"
                                    name="username"
                                    placeholder="Username"
                                    value={filters.username}
                                    onChange={handleFilterChange}
                                />
                                <label htmlFor="username">Username</label>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-floating">
                                <select
                                    className="form-select"
                                    id="action"
                                    name="action"
                                    value={filters.action}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Actions</option>
                                    {actions.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                                <label htmlFor="action">Action</label>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-floating">
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    id="startDate"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                />
                                <label htmlFor="startDate">Start Date</label>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-floating">
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    id="endDate"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                />
                                <label htmlFor="endDate">End Date</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-clock-history me-2" />Activity Logs
                    </h6>
                    <span className="badge bg-primary">{totalElements} total records</span>
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
                                        <th>Timestamp</th>
                                        <th>Username</th>
                                        <th>IP Address</th>
                                        <th>Action</th>
                                        <th>Entity Type</th>
                                        <th>Entity ID</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-5 text-muted-soft">
                                                <i className="bi bi-inbox fs-3 d-block mb-2" />No audit logs found
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id}>
                                                <td><small>{formatDate(log.timestamp)}</small></td>
                                                <td>
                                                    <span className="fw-semibold">{log.username}</span>
                                                </td>
                                                <td><code>{log.ipAddress}</code></td>
                                                <td>
                                                    <span className={`badge rounded-pill ${getActionBadgeClass(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td>{log.entityType}</td>
                                                <td>{log.entityId || "-"}</td>
                                                <td className="text-muted-soft small">
                                                    {log.remarks || (log.oldValue ? "Changes detected" : "-")}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {totalPages > 0 && (
                    <div className="card-footer d-flex justify-content-between align-items-center">
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                        >
                            <i className="bi bi-chevron-left" /> Previous
                        </button>
                        <span className="text-muted-soft small">
                            Page {page + 1} of {totalPages}
                        </span>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            disabled={page + 1 >= totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next <i className="bi bi-chevron-right" />
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal for viewing JSON changes */}
            <div className="modal fade" id="auditDetailModal" tabIndex="-1">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Change Details</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <h6>Old Value:</h6>
                            <pre className="bg-light p-2 rounded" id="oldValuePre" style={{ maxHeight: "200px", overflow: "auto" }} />
                            <h6 className="mt-3">New Value:</h6>
                            <pre className="bg-light p-2 rounded" id="newValuePre" style={{ maxHeight: "200px", overflow: "auto" }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;