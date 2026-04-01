import { useState, useEffect } from "react"

const MPRManagement = () => {
    const [formData, setFormData] = useState({
        mprNumber: "",
        department: "",
        itemName: "",
        quantity: "",
        unit: "",
        estimatedCost: "",
        requiredBy: "",
        priority: "Normal",
        description: ""
    });
    const [showForm, setShowForm] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingMPR, setEditingMPR] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [pageInput, setPageInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [mprData, setMprData] = useState([
        { 
            id: 1, 
            mprNumber: "MPR/2025/001", 
            department: "IT Department",
            itemName: "Laptop Computers",
            quantity: 10,
            unit: "Units",
            estimatedCost: 850000,
            requiredBy: "2025-05-15",
            priority: "High",
            status: "y",
            requestedBy: "John Doe",
            requestDate: "2025-04-01"
        },
        { 
            id: 2, 
            mprNumber: "MPR/2025/002", 
            department: "HR Department",
            itemName: "Office Chairs",
            quantity: 25,
            unit: "Units",
            estimatedCost: 125000,
            requiredBy: "2025-05-30",
            priority: "Medium",
            status: "y",
            requestedBy: "Jane Smith",
            requestDate: "2025-04-02"
        },
        { 
            id: 3, 
            mprNumber: "MPR/2025/003", 
            department: "Operations",
            itemName: "Printer Paper",
            quantity: 100,
            unit: "Reams",
            estimatedCost: 25000,
            requiredBy: "2025-05-10",
            priority: "Normal",
            status: "y",
            requestedBy: "Mike Johnson",
            requestDate: "2025-04-03"
        },
        { 
            id: 4, 
            mprNumber: "MPR/2025/004", 
            department: "Finance",
            itemName: "Accounting Software",
            quantity: 1,
            unit: "License",
            estimatedCost: 450000,
            requiredBy: "2025-06-01",
            priority: "High",
            status: "y",
            requestedBy: "Sarah Williams",
            requestDate: "2025-04-04"
        },
        { 
            id: 5, 
            mprNumber: "MPR/2025/005", 
            department: "Marketing",
            itemName: "Marketing Materials",
            quantity: 500,
            unit: "Pieces",
            estimatedCost: 75000,
            requiredBy: "2025-05-20",
            priority: "Medium",
            status: "y",
            requestedBy: "David Brown",
            requestDate: "2025-04-05"
        },
        { 
            id: 6, 
            mprNumber: "MPR/2025/006", 
            department: "IT Department",
            itemName: "Network Switches",
            quantity: 5,
            unit: "Units",
            estimatedCost: 180000,
            requiredBy: "2025-06-15",
            priority: "High",
            status: "y",
            requestedBy: "John Doe",
            requestDate: "2025-04-06"
        },
        { 
            id: 7, 
            mprNumber: "MPR/2025/007", 
            department: "Admin",
            itemName: "Office Furniture",
            quantity: 15,
            unit: "Sets",
            estimatedCost: 350000,
            requiredBy: "2025-07-01",
            priority: "Normal",
            status: "y",
            requestedBy: "Emma Wilson",
            requestDate: "2025-04-07"
        }
    ]);

    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, mprId: null, newStatus: false });

    const filteredMPRs = mprData.filter(mpr =>
        mpr.mprNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mpr.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mpr.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleEdit = (mpr) => {
        setEditingMPR(mpr);
        setFormData({
            mprNumber: mpr.mprNumber,
            department: mpr.department,
            itemName: mpr.itemName,
            quantity: mpr.quantity,
            unit: mpr.unit,
            estimatedCost: mpr.estimatedCost,
            requiredBy: mpr.requiredBy,
            priority: mpr.priority,
            description: mpr.description || ""
        });
        setShowForm(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        if (editingMPR) {
            setMprData(mprData.map(mpr =>
                mpr.id === editingMPR.id
                    ? { ...mpr, ...formData }
                    : mpr
            ));
        } else {
            const newMPR = {
                id: mprData.length + 1,
                ...formData,
                status: "y",
                requestedBy: "Current User",
                requestDate: new Date().toISOString().split('T')[0]
            };
            setMprData([...mprData, newMPR]);
        }

        setEditingMPR(null);
        setFormData({
            mprNumber: "",
            department: "",
            itemName: "",
            quantity: "",
            unit: "",
            estimatedCost: "",
            requiredBy: "",
            priority: "Normal",
            description: ""
        });
        setShowForm(false);
        setIsFormValid(false);
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [id]: value }));
        setIsFormValid(
            formData.mprNumber && 
            formData.department && 
            formData.itemName && 
            formData.quantity && 
            formData.estimatedCost
        );
    };

    const handleSwitchChange = (id, newStatus) => {
        setConfirmDialog({ isOpen: true, mprId: id, newStatus });
    };

    const handleConfirm = (confirmed) => {
        if (confirmed && confirmDialog.mprId !== null) {
            setMprData((prevData) =>
                prevData.map((mpr) =>
                    mpr.id === confirmDialog.mprId ? { ...mpr, status: confirmDialog.newStatus } : mpr
                )
            );
        }
        setConfirmDialog({ isOpen: false, mprId: null, newStatus: null });
    };

    const getPriorityBadge = (priority) => {
        switch(priority) {
            case 'High':
                return <span className="badge" style={{ backgroundColor: '#dc3545', color: 'white' }}>High</span>;
            case 'Medium':
                return <span className="badge" style={{ backgroundColor: '#ffc107', color: '#000' }}>Medium</span>;
            default:
                return <span className="badge" style={{ backgroundColor: '#6c757d', color: 'white' }}>Normal</span>;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const filteredTotalPages = Math.ceil(filteredMPRs.length / itemsPerPage);

    const currentItems = filteredMPRs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageNavigation = () => {
        const pageNumber = parseInt(pageInput, 10);
        if (pageNumber > 0 && pageNumber <= filteredTotalPages) {
            setCurrentPage(pageNumber);
        } else {
            alert("Please enter a valid page number.");
        }
    };

    const renderPagination = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(filteredTotalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            pageNumbers.push(1);
            if (startPage > 2) pageNumbers.push("...");
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (endPage < filteredTotalPages) {
            if (endPage < filteredTotalPages - 1) pageNumbers.push("...");
            pageNumbers.push(filteredTotalPages);
        }

        return pageNumbers.map((number, index) => (
            <li key={index} className={`page-item ${number === currentPage ? "active" : ""}`}>
                {typeof number === "number" ? (
                    <button className="page-link" onClick={() => setCurrentPage(number)}>
                        {number}
                    </button>
                ) : (
                    <span className="page-link disabled">{number}</span>
                )}
            </li>
        ));
    };

    const totalEstimatedCost = filteredMPRs.reduce((sum, mpr) => sum + mpr.estimatedCost, 0);

    return (
        <div className="content-wrapper">
            <div className="row">
                <div className="col-12 grid-margin stretch-card">
                    <div className="card form-card">
                        <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                            <div>
                                <h4 className="card-title mb-0">Material Purchase Requests</h4>
                                <small className="text-muted">Manage and track procurement requests</small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                {!showForm ? (
                                    <form className="d-inline-block searchform me-4" role="search">
                                        <div className="input-group searchinput">
                                            <input
                                                type="search"
                                                className="form-control"
                                                placeholder="Search MPRs..."
                                                aria-label="Search"
                                                value={searchQuery}
                                                onChange={handleSearch}
                                                style={{ fontSize: '14px' }}
                                            />
                                            <span className="input-group-text" id="search-icon" style={{ backgroundColor: '#fff' }}>
                                                <i className="fa fa-search"></i>
                                            </span>
                                        </div>
                                    </form>
                                ) : (
                                    <></>
                                )}

                                <div className="d-flex align-items-center">
                                    {!showForm ? (
                                        <>
                                            <button 
                                                type="button" 
                                                className="btn btn-sm" 
                                                onClick={() => setShowForm(true)}
                                                style={{ backgroundColor: '#0d6efd', color: 'white' }}
                                            >
                                                <i className="mdi mdi-plus"></i> New Request
                                            </button>
                                           
                                        </>
                                    ) : (
                                        <button 
                                            type="button" 
                                            className="btn btn-sm btn-secondary" 
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingMPR(null);
                                                setFormData({
                                                    mprNumber: "",
                                                    department: "",
                                                    itemName: "",
                                                    quantity: "",
                                                    unit: "",
                                                    estimatedCost: "",
                                                    requiredBy: "",
                                                    priority: "Normal",
                                                    description: ""
                                                });
                                            }}
                                        >
                                            <i className="mdi mdi-arrow-left"></i> Back
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            {!showForm ? (
                                <>
                                    {/* Summary Cards */}
                                    <div className="row mb-4">
                                        <div className="col-md-3">
                                            <div className="card" style={{ backgroundColor: '#fff', border: '1px solid #dee2e6' }}>
                                                <div className="card-body py-3">
                                                    <small className="text-muted">Total Requests</small>
                                                    <h4 className="mb-0 mt-1">{filteredMPRs.length}</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card" style={{ backgroundColor: '#fff', border: '1px solid #dee2e6' }}>
                                                <div className="card-body py-3">
                                                    <small className="text-muted">Total Value</small>
                                                    <h4 className="mb-0 mt-1">{formatCurrency(totalEstimatedCost)}</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card" style={{ backgroundColor: '#fff', border: '1px solid #dee2e6' }}>
                                                <div className="card-body py-3">
                                                    <small className="text-muted">High Priority</small>
                                                    <h4 className="mb-0 mt-1">{filteredMPRs.filter(m => m.priority === 'High').length}</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card" style={{ backgroundColor: '#fff', border: '1px solid #dee2e6' }}>
                                                <div className="card-body py-3">
                                                    <small className="text-muted">Active</small>
                                                    <h4 className="mb-0 mt-1">{filteredMPRs.filter(m => m.status === 'y').length}</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="table-responsive">
                                        <table className="table table-sm table-striped table-hover">
                                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                                                <tr>
                                                    <th>MPR Number</th>
                                                    <th>Department</th>
                                                    <th>Item</th>
                                                    <th className="text-end">Qty</th>
                                                    <th className="text-end">Cost</th>
                                                    <th>Required</th>
                                                    <th>Priority</th>
                                                    <th>Status</th>
                                                    <th className="text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((mpr) => (
                                                    <tr key={mpr.id} style={{ fontSize: '14px' }}>
                                                        <td>
                                                            <div>{mpr.mprNumber}</div>
                                                            <small className="text-muted">{mpr.requestDate}</small>
                                                        </td>
                                                        <td>{mpr.department}</td>
                                                        <td>{mpr.itemName}</td>
                                                        <td className="text-end">{mpr.quantity} {mpr.unit}</td>
                                                        <td className="text-end">{formatCurrency(mpr.estimatedCost)}</td>
                                                        <td>{mpr.requiredBy}</td>
                                                        <td>{getPriorityBadge(mpr.priority)}</td>
                                                        <td>
                                                            <div className="form-check form-switch">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    checked={mpr.status === "y"}
                                                                    onChange={() => handleSwitchChange(mpr.id, mpr.status === "y" ? "n" : "y")}
                                                                    id={`switch-${mpr.id}`}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-sm btn-link text-secondary p-0"
                                                                onClick={() => handleEdit(mpr)}
                                                                disabled={mpr.status !== "y"}
                                                                style={{ textDecoration: 'none' }}
                                                                title="Edit"
                                                            >
                                                                <i className="fa fa-pencil" style={{ fontSize: '14px' }}></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                        {filteredMPRs.length === 0 && (
                                            <div className="text-center py-5">
                                                <p className="text-muted">No requests found</p>
                                            </div>
                                        )}

                                        {/* Pagination */}
                                        {filteredMPRs.length > 0 && (
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <small className="text-muted">
                                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMPRs.length)} of {filteredMPRs.length}
                                                </small>
                                                <div className="d-flex align-items-center">
                                                    <ul className="pagination pagination-sm mb-0">
                                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
                                                        </li>
                                                        {renderPagination()}
                                                        <li className={`page-item ${currentPage === filteredTotalPages ? "disabled" : ""}`}>
                                                            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                                                        </li>
                                                    </ul>
                                                    <div className="ms-3" style={{ width: '100px' }}>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            placeholder="Page #"
                                                            value={pageInput}
                                                            onChange={(e) => setPageInput(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && handlePageNavigation()}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <form className="row" onSubmit={handleSave}>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small">MPR Number</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            id="mprNumber"
                                            placeholder="MPR/2025/XXX"
                                            value={formData.mprNumber}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small">Department</label>
                                        <select
                                            className="form-select form-select-sm"
                                            id="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select</option>
                                            <option value="IT Department">IT</option>
                                            <option value="HR Department">HR</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Operations">Operations</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small">Item Name</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            id="itemName"
                                            value={formData.itemName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label small">Quantity</label>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            id="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label small">Unit</label>
                                        <select
                                            className="form-select form-select-sm"
                                            id="unit"
                                            value={formData.unit}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Units">Units</option>
                                            <option value="Pieces">Pieces</option>
                                            <option value="Reams">Reams</option>
                                            <option value="License">License</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small">Estimated Cost (INR)</label>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            id="estimatedCost"
                                            value={formData.estimatedCost}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small">Required By</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            id="requiredBy"
                                            value={formData.requiredBy}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small">Priority</label>
                                        <select
                                            className="form-select form-select-sm"
                                            id="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                        >
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Normal">Normal</option>
                                        </select>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label small">Description</label>
                                        <textarea
                                            className="form-control form-control-sm"
                                            id="description"
                                            rows="2"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>
                                    <div className="col-12">
                                        <hr className="my-2" />
                                        <div className="d-flex justify-content-end">
                                            <button type="submit" className="btn btn-sm btn-primary me-2" disabled={!isFormValid}>
                                                Save
                                            </button>
                                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => {
                                                setShowForm(false);
                                                setEditingMPR(null);
                                                setFormData({
                                                    mprNumber: "",
                                                    department: "",
                                                    itemName: "",
                                                    quantity: "",
                                                    unit: "",
                                                    estimatedCost: "",
                                                    requiredBy: "",
                                                    priority: "Normal",
                                                    description: ""
                                                });
                                            }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                            
                            {/* Confirm Dialog */}
                            {confirmDialog.isOpen && (
                                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                    <div className="modal-dialog modal-dialog-centered modal-sm">
                                        <div className="modal-content">
                                            <div className="modal-body text-center py-4">
                                                <p className="mb-0 small">Change status?</p>
                                            </div>
                                            <div className="modal-footer justify-content-center py-2">
                                                <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleConfirm(false)}>No</button>
                                                <button type="button" className="btn btn-sm btn-primary" onClick={() => handleConfirm(true)}>Yes</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MPRManagement;