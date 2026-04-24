import React, { useState, useEffect } from "react";
import apiClient from "../../auth/apiClient";
import DocumentViewer from "../../Components/DocumentViewer";

const CreateMPR = () => {
  const [mprData, setMprData] = useState({
    mprNo: "",
    mprDate: "",
    departmentId: "",
    projectName: "",
    mprTypeId: "",
    tenderTypeId: "",
    priority: "",
    requiredByDate: "",
    deliverySchedule: "",
    durationDays: "",
    specialNotes: "",
    justification: "",
    totalValue: 0,
    mprDocs: [],
    existingDocuments: [],
    tableRows: [
      {
        id: null,
        itemCode: "",
        itemName: "",
        uom: "",
        specification: "",
        qty: "",
        rate: "",
        value: "",
        stock: "",
        amc: "",
        lastPurchase: "",
        vendorIds: [],
        vendorNames: "",
      },
    ],
    removedDetails: [],
    mprId: null,
    isSubmittedForApproval: false,  // ✅ NEW: Track if already submitted
    approvalStatus: null,            // ✅ NEW: Track approval status
  });

  const [mprList, setMprList] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [vendorPopupIndex, setVendorPopupIndex] = useState(null);
  const [vendorSearch, setVendorSearch] = useState("");
  const [mprTypes, setMprTypes] = useState([]);
  const [tenderTypes, setTenderTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loginError, setLoginError] = useState("");
  const [showSubmitApproval, setShowSubmitApproval] = useState(false);
  const [createdMprId, setCreatedMprId] = useState(null);
  const [viewerDoc, setViewerDoc] = useState(null);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchMprType();
    fetchTenderTypes();
    fetchDepartments();
    fetchVendors();
  }, []);

  const fetchMprType = async () => {
    try {
      const res = await apiClient.get("/api/master/getAllMprType");
      if (res.status === "SUCCESS") setMprTypes(res.data);
    } catch (err) {
      console.log(err);
      setLoginError(err.message || "Something went wrong");
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await apiClient.get("api/vendors");
      if (res.status === "SUCCESS") setVendors(res.data);
    } catch (err) {
      console.log(err);
      setLoginError(err.message || "Something went wrong");
    }
  };

  const fetchTenderTypes = async () => {
    try {
      const res = await apiClient.get("/api/master/getAllTenderType");
      if (res.status === "SUCCESS") setTenderTypes(res.data);
    } catch (err) {
      console.log(err);
      setLoginError(err.message || "Something went wrong");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await apiClient.get("/api/master/getAllDepartment");
      if (res.status === "SUCCESS") setDepartments(res.data);
    } catch (err) {
      console.log(err);
      setLoginError(err.message || "Something went wrong");
    }
  };

  const fetchMprDocuments = async (mprId) => {
    try {
      const res = await apiClient.get(`/api/mpr/documents/${mprId}`);
      if (res.status === "SUCCESS") {
        return res.data;
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
    return [];
  };

  // ✅ NEW: Fetch approval status for an MPR
  const fetchApprovalStatus = async (mprId) => {
    try {
      const res = await apiClient.get(`/api/mpr/approval-level/status/${mprId}`);
      if (res.status === "SUCCESS" && res.data) {
        return {
          isSubmitted: res.data.currentStatus === "PENDING" || 
                       res.data.currentStatus === "APPROVED" || 
                       res.data.currentStatus === "REJECTED",
          approvalStatus: res.data.currentStatus,
          currentLevel: res.data.currentLevel
        };
      }
    } catch (err) {
      console.error("Error fetching approval status:", err);
    }
    return { isSubmitted: false, approvalStatus: null, currentLevel: null };
  };

  useEffect(() => {
    fetchMprList();
  }, []);

  const fetchMprList = async () => {
    try {
      const res = await apiClient.get("/api/mpr/getallbyStatus", {
        params: { status: "n" }
      });
      if (res.status === "SUCCESS") setMprList(res.data);
      else console.error("Failed to fetch MPR List:", res.message);
    } catch (err) {
      console.error("Error fetching MPR List:", err);
      setLoginError(err.message || "Failed to fetch MPR List");
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setMprData({ ...mprData, [name]: value });
  };

  const addRow = () => {
    setMprData({
      ...mprData,
      tableRows: [
        ...mprData.tableRows,
        {
          id: null,
          itemCode: "",
          itemName: "",
          uom: "",
          specification: "",
          qty: "",
          rate: "",
          value: "",
          stock: "",
          amc: "",
          lastPurchase: "",
          vendorIds: [],
          vendorNames: "",
        },
      ],
    });
  };

  const removeRow = (index) => {
    if (mprData.tableRows.length === 1) return;
    const rows = [...mprData.tableRows];
    const removedRow = rows[index];
    if (removedRow.id) {
      setMprData({
        ...mprData,
        removedDetails: [...mprData.removedDetails, removedRow.id]
      });
    }
    rows.splice(index, 1);
    const total = rows.reduce((sum, r) => sum + (parseFloat(r.value) || 0), 0);
    setMprData({ ...mprData, tableRows: rows, totalValue: total });
  };

  const handleRowChange = (index, e) => {
    const { name, value } = e.target;
    const rows = [...mprData.tableRows];
    rows[index][name] = value;

    if (name === "qty" || name === "rate") {
      const qty = parseFloat(rows[index].qty) || 0;
      const rate = parseFloat(rows[index].rate) || 0;
      rows[index].value = (qty * rate).toString();
    }

    const total = rows.reduce((sum, r) => sum + (parseFloat(r.value) || 0), 0);
    setMprData({ ...mprData, tableRows: rows, totalValue: total });
  };

  const toggleVendorSelection = (rowIndex, vendorId) => {
    const rows = [...mprData.tableRows];
    const vendorIds = rows[rowIndex].vendorIds || [];

    if (vendorIds.includes(vendorId)) {
      rows[rowIndex].vendorIds = vendorIds.filter((id) => id !== vendorId);
    } else {
      rows[rowIndex].vendorIds = [...vendorIds, vendorId];
    }

    rows[rowIndex].vendorNames = rows[rowIndex].vendorIds
      .map((id) => vendors.find((v) => v.vendorId === id)?.vendorName)
      .join(", ");

    setMprData({ ...mprData, tableRows: rows });
  };

  const resetForm = () => {
    setMprData({
      mprNo: "",
      mprDate: "",
      departmentId: "",
      projectName: "",
      mprTypeId: "",
      tenderTypeId: "",
      priority: "",
      requiredByDate: "",
      deliverySchedule: "",
      durationDays: "",
      specialNotes: "",
      justification: "",
      totalValue: 0,
      mprDocs: [],
      existingDocuments: [],
      tableRows: [
        {
          id: null,
          itemCode: "",
          itemName: "",
          uom: "",
          specification: "",
          qty: "",
          rate: "",
          value: "",
          stock: "",
          amc: "",
          lastPurchase: "",
          vendorIds: [],
          vendorNames: "",
        },
      ],
      removedDetails: [],
      mprId: null,
      isSubmittedForApproval: false,
      approvalStatus: null,
    });
    setShowSubmitApproval(false);
    setCreatedMprId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mprData.mprNo || !mprData.mprDate || !mprData.departmentId) {
      alert("Please fill required fields");
      return;
    }

    if (!mprData.tableRows.length) {
      alert("Add at least one item");
      return;
    }

    try {
      const mprDetailRequests = mprData.tableRows.map((row, index) => ({
        slNo: index + 1,
        itemCode: row.itemCode,
        itemName: row.itemName,
        uom: row.uom,
        specification: row.specification,
        requestedQty: Number(row.qty) || 0,
        estimatedRate: Number(row.rate) || 0,
        estimatedValue: Number(row.value) || 0,
        stockAvailable: Number(row.stock) || 0,
        avgMonthlyConsumption: Number(row.amc) || 0,
        lastPurchaseInfo: row.lastPurchase || "",
        remarks: "",
        vendorIds: row.vendorIds || []
      }));

      const mprDataPayload = {
        mprNo: mprData.mprNo,
        mprDate: mprData.mprDate,
        departmentId: parseInt(mprData.departmentId),
        projectName: mprData.projectName,
        mprTypeId: mprData.mprTypeId ? parseInt(mprData.mprTypeId) : null,
        tenderTypeId: mprData.tenderTypeId ? parseInt(mprData.tenderTypeId) : null,
        priority: mprData.priority,
        requiredByDate: mprData.requiredByDate,
        deliverySchedule: mprData.deliverySchedule,
        durationDays: mprData.durationDays ? parseInt(mprData.durationDays) : null,
        specialNotes: mprData.specialNotes,
        justification: mprData.justification,
        totalValue: mprData.totalValue,
        mprDetailRequests: mprDetailRequests
      };

      const formData = new FormData();
      formData.append("mprData", new Blob([JSON.stringify(mprDataPayload)], { type: "application/json" }));
      
      if (mprData.mprDocs && mprData.mprDocs.length > 0) {
        mprData.mprDocs.forEach(file => {
          formData.append("documents", file);
        });
      }

      let res;
      if (mprData.mprId) {
        const updatePayload = { 
          ...mprDataPayload, 
          mprId: mprData.mprId,
          details: mprDetailRequests.map((d, idx) => ({
            ...d,
            mprDetailId: mprData.tableRows[idx].id || null,
            specificationn: d.specification
          })),
          deleteDetailIds: mprData.removedDetails || []
        };
        const updateFormData = new FormData();
        updateFormData.append("mprData", new Blob([JSON.stringify(updatePayload)], { type: "application/json" }));
        if (mprData.mprDocs.length > 0) {
          mprData.mprDocs.forEach(file => updateFormData.append("documents", file));
        }
        res = await apiClient.put("/api/mpr/update-with-files", updateFormData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        if (res.status === "SUCCESS") {
          alert("MPR updated successfully!");
          
          // ✅ Check if already submitted for approval
          const approvalStatus = await fetchApprovalStatus(mprData.mprId);
          if (!approvalStatus.isSubmitted) {
            setCreatedMprId(mprData.mprId);
            setShowSubmitApproval(true);
            alert("MPR updated! Click 'Submit for Approval' to start workflow.");
          } else {
            alert("MPR already submitted for approval. No need to submit again.");
          }
        }
        fetchMprList();
        resetForm();
      } else {
        res = await apiClient.post("/api/mpr/registration/with-files", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        if (res.status === "SUCCESS") {
          setCreatedMprId(res.data.mprId);
          setShowSubmitApproval(true);
          alert("MPR created! Click 'Submit for Approval' to start workflow.");
        }
        fetchMprList();
        resetForm();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit MPR: " + (error.response?.data?.message || error.message));
    }
  };

  // ✅ MODIFIED: Edit handler with approval status check
  const handleEdit = async (mpr) => {
    // Fetch existing documents
    const documents = await fetchMprDocuments(mpr.mprId);
    
    // ✅ Fetch approval status to check if already submitted
    const approvalStatus = await fetchApprovalStatus(mpr.mprId);
    
    setMprData({
      mprId: mpr.mprId || null,
      mprNo: mpr.mprNo || "",
      mprDate: mpr.mprDate || "",
      departmentId: mpr.departmentId || "",
      projectName: mpr.projectName || "",
      mprTypeId: mpr.mprTypeId || "",
      tenderTypeId: mpr.tenderTypeId || "",
      priority: mpr.priority || "",
      requiredByDate: mpr.requiredByDate || "",
      deliverySchedule: mpr.deliverySchedule || "",
      durationDays: mpr.durationDays || "",
      specialNotes: mpr.specialNotes || "",
      justification: mpr.justification || "",
      totalValue: mpr.totalValue || 0,
      tableRows: (mpr.mprDetailResponnces || []).map((d) => ({
        id: d.mprDetailId,
        itemCode: d.itemCode,
        itemName: d.itemName,
        uom: d.uom,
        specification: d.specification,
        qty: d.requestedQty,
        rate: d.estimatedRate,
        value: d.estimatedValue,
        stock: d.stockAvailable,
        amc: d.avgMonthlyConsumption,
        lastPurchase: d.lastPurchaseInfo,
        vendorIds: d.vendors ? d.vendors.map(v => v.vendorId) : [],
        vendorNames: d.vendors ? d.vendors.map(v => v.vendorName).join(", ") : "",
      })),
      mprDocs: [],
      existingDocuments: documents,
      removedDetails: [],
      isSubmittedForApproval: approvalStatus.isSubmitted,
      approvalStatus: approvalStatus.approvalStatus,
    });
    
    // ✅ If not submitted, show submit button
    if (!approvalStatus.isSubmitted) {
      setCreatedMprId(mpr.mprId);
      setShowSubmitApproval(true);
    } else {
      setShowSubmitApproval(false);
    }
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitForApproval = async () => {
    try {
      const res = await apiClient.post(`/api/mpr/approval-level/submit/${createdMprId}`);
      if (res.status === "SUCCESS") {
        alert(res.message);
        setShowSubmitApproval(false);
        setCreatedMprId(null);
        resetForm();
        fetchMprList();
      } else {
        alert(res.message || "Failed to submit for approval");
      }
    } catch (err) {
      console.error("Error submitting for approval:", err);
      alert(err.response?.data?.message || err.message || "Failed to submit for approval");
    }
  };

  const removeExistingDocument = (index) => {
    const updatedDocs = [...mprData.existingDocuments];
    updatedDocs.splice(index, 1);
    setMprData({ ...mprData, existingDocuments: updatedDocs });
  };

  const filteredList = mprList.filter((mpr) =>
    mpr.mprNo && mpr.mprNo.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedData = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getFileIcon = (fileName) => {
    if (!fileName) return <i className="bi bi-file-earmark-fill" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <i className="bi bi-file-pdf-fill text-danger" />;
    if (ext === 'xlsx' || ext === 'xls') return <i className="bi bi-file-excel-fill text-success" />;
    if (ext === 'doc' || ext === 'docx') return <i className="bi bi-file-word-fill text-primary" />;
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return <i className="bi bi-file-image-fill text-info" />;
    return <i className="bi bi-file-earmark-fill" />;
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Create MPR</h1>
        <p className="text-muted-soft">Submit a new Material Purchase Request</p>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h6 className="mb-0 fw-semibold">Request Details</h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="form-floating">
                  <input className="form-control" id="mprNo" name="mprNo" placeholder="MPR No" value={mprData.mprNo} onChange={handleFieldChange} />
                  <label htmlFor="mprNo">MPR No</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-floating">
                  <input type="date" className="form-control" id="mprDate" name="mprDate" placeholder="MPR Date" value={mprData.mprDate} onChange={handleFieldChange} />
                  <label htmlFor="mprDate">MPR Date</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-floating">
                  <select className="form-select" id="departmentId" name="departmentId" value={mprData.departmentId} onChange={handleFieldChange}>
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                    ))}
                  </select>
                  <label htmlFor="departmentId">Department</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-floating">
                  <input className="form-control" id="projectName" name="projectName" placeholder="Project Name" value={mprData.projectName} onChange={handleFieldChange} />
                  <label htmlFor="projectName">Project Name</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-floating">
                  <select className="form-select" id="mprTypeId" name="mprTypeId" value={mprData.mprTypeId} onChange={handleFieldChange}>
                    <option value="">Select MPR Type</option>
                    {mprTypes.map((m) => (
                      <option key={m.typeId} value={m.typeId}>{m.typeName}</option>
                    ))}
                  </select>
                  <label htmlFor="mprTypeId">MPR Type</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-floating">
                  <select className="form-select" id="tenderTypeId" name="tenderTypeId" value={mprData.tenderTypeId} onChange={handleFieldChange}>
                    <option value="">Select Tender Type</option>
                    {tenderTypes.map((t) => (
                      <option key={t.tenderTypeId} value={t.tenderTypeId}>{t.tenderName}</option>
                    ))}
                  </select>
                  <label htmlFor="tenderTypeId">Tender Type</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-floating">
                  <select className="form-select" id="priority" name="priority" value={mprData.priority} onChange={handleFieldChange}>
                    <option value="">Select Priority</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                  <label htmlFor="priority">Priority</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-floating">
                  <input type="date" className="form-control" id="requiredByDate" name="requiredByDate" placeholder="Required By" value={mprData.requiredByDate} onChange={handleFieldChange} />
                  <label htmlFor="requiredByDate">Required By Date</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-floating">
                  <input className="form-control" id="deliverySchedule" name="deliverySchedule" placeholder="Delivery Schedule" value={mprData.deliverySchedule} onChange={handleFieldChange} />
                  <label htmlFor="deliverySchedule">Delivery Schedule</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-floating">
                  <input type="number" className="form-control" id="durationDays" name="durationDays" placeholder="Duration Days" value={mprData.durationDays} onChange={handleFieldChange} />
                  <label htmlFor="durationDays">Duration Days</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-floating">
                  <textarea className="form-control" id="specialNotes" name="specialNotes" placeholder="Special Notes" style={{ height: "80px" }} value={mprData.specialNotes} onChange={handleFieldChange}></textarea>
                  <label htmlFor="specialNotes">Special Notes</label>
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-floating">
                  <textarea className="form-control" id="justification" name="justification" placeholder="Justification" style={{ height: "80px" }} value={mprData.justification} onChange={handleFieldChange}></textarea>
                  <label htmlFor="justification">Justification</label>
                </div>
              </div>
              
              <div className="col-md-12">
                <div className="form-floating mb-2">
                  <input type="file" multiple className="form-control" onChange={(e) => setMprData({ ...mprData, mprDocs: Array.from(e.target.files) })} />
                  <label>Upload New Documents (PDF, Excel, Word, Images)</label>
                </div>
                
                {mprData.existingDocuments.length > 0 && (
                  <div className="mt-2 border rounded p-2 bg-light">
                    <small className="text-muted fw-semibold">📎 Existing Documents:</small>
                    <div className="mt-1">
                      {mprData.existingDocuments.map((doc, idx) => (
                        <div key={idx} className="d-flex align-items-center justify-content-between p-1 border-bottom">
                          <div>
                            {getFileIcon(doc.fileName)}
                            <span className="ms-2">{doc.fileName}</span>
                            <small className="text-muted ms-2">({(doc.fileSize / 1024).toFixed(2)} KB)</small>
                          </div>
                          <div>
                            <button 
                              type="button"
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => setViewerDoc({ filePath: doc.filePath, fileName: doc.fileName })}
                            >
                              <i className="bi bi-eye" /> View
                            </button>
                            <button 
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeExistingDocument(idx)}
                            >
                              <i className="bi bi-trash" /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <small className="text-muted">Note: Remove will delete on next save</small>
                  </div>
                )}
                
                {mprData.mprDocs.length > 0 && (
                  <div className="mt-2">
                    <small className="text-success fw-semibold">📤 New Files to Upload:</small>
                    <div className="mt-1">
                      {mprData.mprDocs.map((file, idx) => (
                        <div key={idx} className="d-inline-block me-2 mb-1 badge bg-info text-dark">
                          {file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mt-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="section-title mb-0">Items</h6>
                <button type="button" className="btn btn-sm btn-outline-success" onClick={addRow}>
                  <i className="bi bi-plus-lg me-1" />Add Row
                </button>
              </div>
              <div className="table-responsive" style={{ overflowX: "auto" }}>
                <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                  <table className="table table-bordered table-hover table-sm align-middle" style={{ minWidth: "1500px" }}>
                    <colgroup>
                      <col style={{ width: "50px" }} />
                      <col style={{ width: "110px" }} />
                      <col style={{ width: "140px" }} />
                      <col style={{ width: "90px" }} />
                      <col style={{ width: "190px" }} />
                      <col style={{ width: "90px" }} />
                      <col style={{ width: "90px" }} />
                      <col style={{ width: "110px" }} />
                      <col style={{ width: "90px" }} />
                      <col style={{ width: "75px" }} />
                      <col style={{ width: "140px" }} />
                      <col style={{ width: "360px" }} />
                      <col style={{ width: "70px" }} />
                    </colgroup>
                    <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 1 }}>
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
                      </tr>
                    </thead>
                    <tbody>
                      {mprData.tableRows.map((row, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          {["itemCode", "itemName", "uom", "specification", "qty", "rate", "value", "stock", "amc", "lastPurchase"].map((key) => (
                            <td key={key}>
                              <input
                                className="form-control form-control-sm"
                                type={["qty", "rate", "value", "stock", "amc"].includes(key) ? "number" : key === "lastPurchase" ? "date" : "text"}
                                name={key}
                                value={row[key]}
                                onChange={(e) => handleRowChange(index, e)}
                              />
                            </td>
                          ))}
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <input className="form-control form-control-sm" readOnly value={row.vendorNames || ""} placeholder="Select Vendors" />
                              <button type="button" className="btn btn-sm btn-primary" onClick={() => setVendorPopupIndex(index)}>
                                <i className="bi bi-people" />
                              </button>
                            </div>
                          </td>
                          <td>
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeRow(index)}>
                              <i className="bi bi-trash" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="text-end mt-2">
                <h6 className="text-primary">Total Value: ₹ {mprData.totalValue.toLocaleString()}</h6>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button type="submit" className="btn btn-primary px-4">
                <i className="bi bi-send me-2" />{mprData.mprId ? "Update MPR" : "Submit MPR"}
              </button>
            </div>
          </form>

          {/* ✅ Submit for Approval Button - Shows after create or edit if not submitted */}
          {showSubmitApproval && (
            <div className="alert alert-info mt-3">
              <p>
                <strong>MPR {mprData.mprId ? "updated" : "created"} successfully!</strong>
                {mprData.isSubmittedForApproval ? (
                  <span className="ms-2 text-warning">⚠️ Already submitted for approval. No action needed.</span>
                ) : (
                  <span className="ms-2">Click below to start the multi-level approval workflow.</span>
                )}
              </p>
              {!mprData.isSubmittedForApproval && (
                <button className="btn btn-primary" onClick={handleSubmitForApproval}>
                  <i className="bi bi-send me-2" />Submit for Approval
                </button>
              )}
            </div>
          )}

          {/* ✅ Show approval status if already submitted */}
          {mprData.mprId && mprData.isSubmittedForApproval && mprData.approvalStatus && (
            <div className="alert alert-secondary mt-3">
              <strong>Approval Status:</strong> {mprData.approvalStatus === "PENDING" ? "⏳ Pending Approval" : 
                mprData.approvalStatus === "APPROVED" ? "✅ Fully Approved" : "❌ Rejected"}
            </div>
          )}
        </div>
      </div>

      {/* MPR List */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <h6 className="mb-0 fw-semibold">Saved MPRs</h6>
          <div className="input-group" style={{ maxWidth: "280px" }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted" />
            </span>
            <input
              className="form-control border-start-0"
              placeholder="Search by MPR No"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>MPR No</th>
                  <th>Department</th>
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Total Value</th>
                  <th>Approval Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((mpr, i) => {
                  const departmentName = departments.find(d => Number(d.departmentId) === Number(mpr.departmentId))?.departmentName || '';
                  return (
                    <tr key={i}>
                      <td className="fw-semibold text-primary">{mpr.mprNo}</td>
                      <td>{departmentName}</td>
                      <td>{mpr.projectName}</td>
                      <td>
                        <span className={`badge rounded-pill ${mpr.priority === 'HIGH' ? 'bg-danger' : mpr.priority === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {mpr.priority}
                        </span>
                      </td>
                      <td>₹ {mpr.totalValue?.toLocaleString() || 0}</td>
                      <td>
                        <span className="badge bg-secondary">Pending</span>
                      </td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-warning" onClick={() => handleEdit(mpr)}>
                          <i className="bi bi-pencil me-1" />Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {paginatedData.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-5 text-muted-soft"><i className="bi bi-inbox fs-3 d-block mb-2" />No MPRs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between align-items-center">
          <button className="btn btn-sm btn-outline-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            <i className="bi bi-chevron-left" /> Prev
          </button>
          <span className="text-muted-soft small">Page {currentPage} of {totalPages}</span>
          <button className="btn btn-sm btn-outline-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            Next <i className="bi bi-chevron-right ms-1" />
          </button>
        </div>
      </div>

      {/* Vendor Popup */}
      {vendorPopupIndex !== null && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "420px", width: "100%", margin: 0 }}>
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-semibold">Select Vendors</h6>
                <button type="button" className="btn-close" onClick={() => setVendorPopupIndex(null)} />
              </div>
              <div className="modal-body">
                <div className="input-group mb-3">
                  <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted" /></span>
                  <input className="form-control border-start-0" placeholder="Search vendor…" value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} />
                </div>
                <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                  {vendors.filter((v) => v.vendorName.toLowerCase().includes(vendorSearch.toLowerCase())).map((v) => (
                    <div key={v.vendorId} className="form-check py-1 border-bottom">
                      <input className="form-check-input" type="checkbox" id={`vendor-${v.vendorId}`}
                        checked={mprData.tableRows[vendorPopupIndex]?.vendorIds?.includes(v.vendorId) || false}
                        onChange={() => toggleVendorSelection(vendorPopupIndex, v.vendorId)} />
                      <label className="form-check-label" htmlFor={`vendor-${v.vendorId}`}>
                        <span className="badge bg-light text-dark me-2">{v.vendorCode}</span>{v.vendorName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary btn-sm" onClick={() => setVendorPopupIndex(null)}>Done</button>
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

export default CreateMPR;