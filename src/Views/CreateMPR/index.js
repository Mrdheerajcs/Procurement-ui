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
    isSubmittedForApproval: false,
    approvalStatus: null,
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
  const [showSubmitApproval, setShowSubmitApproval] = useState(false);
  const [createdMprId, setCreatedMprId] = useState(null);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [errors, setErrors] = useState({});
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  // ✅ UPDATED COLUMN WIDTHS - Larger for better readability
  const columnWidths = {
    sr: "50px",
    itemCode: "160px",
    itemName: "260px",
    uom: "110px",
    specification: "300px",
    qty: "130px",
    rate: "150px",
    value: "150px",
    stock: "110px",
    amc: "100px",
    lastPurchase: "140px",
    vendors: "380px",
    action: "80px",
  };

  const itemsPerPage = 5;

  // ✅ Auto-generate MPR number on page load
  useEffect(() => {
    if (!mprData.mprId && !mprData.mprNo) {
      generateMprNumber();
    }
  }, []);

  const generateMprNumber = async () => {
    try {
      const res = await apiClient.get("/api/mpr/generate-number");
      if (res.status === "SUCCESS") {
        setMprData(prev => ({ ...prev, mprNo: res.data }));
      }
    } catch (err) {
      // Fallback: manual entry allowed
      console.log("Auto-generation failed, manual entry allowed");
    }
  };

  // ✅ Check duplicate MPR number
  const checkDuplicateMprNo = async (mprNo) => {
    if (!mprNo || mprData.mprId) return true; // Skip for edit mode
    setCheckingDuplicate(true);
    try {
      const res = await apiClient.get(`/api/mpr/check-duplicate?mprNo=${encodeURIComponent(mprNo)}`);
      if (res.status === "SUCCESS" && res.data === true) {
        setErrors(prev => ({ ...prev, mprNo: "MPR number already exists! Please use a different number." }));
        return false;
      }
      setErrors(prev => ({ ...prev, mprNo: "" }));
      return true;
    } catch (err) {
      console.error("Error checking duplicate:", err);
      return true;
    } finally {
      setCheckingDuplicate(false);
    }
  };

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
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await apiClient.get("api/vendors");
      if (res.status === "SUCCESS") setVendors(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTenderTypes = async () => {
    try {
      const res = await apiClient.get("/api/master/getAllTenderType");
      if (res.status === "SUCCESS") setTenderTypes(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await apiClient.get("/api/master/getAllDepartment");
      if (res.status === "SUCCESS") setDepartments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMprDocuments = async (mprId) => {
    try {
      const res = await apiClient.get(`/api/mpr/documents/${mprId}`);
      if (res.status === "SUCCESS") return res.data;
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
    return [];
  };

  const fetchApprovalStatus = async (mprId) => {
    try {
      const res = await apiClient.get(`/api/mpr/approval-level/status/${mprId}`);
      if (res.status === "SUCCESS" && res.data) {
        return {
          isSubmitted: res.data.currentStatus === "PENDING" ||
                       res.data.currentStatus === "APPROVED" ||
                       res.data.currentStatus === "REJECTED",
          approvalStatus: res.data.currentStatus,
          currentLevel: res.data.currentLevel,
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
        params: { status: "n" },
      });
      if (res.status === "SUCCESS") setMprList(res.data);
    } catch (err) {
      console.error("Error fetching MPR List:", err);
    }
  };

  // ✅ UPDATED VALIDATION - Real industry standards
  const validateForm = () => {
    const newErrors = {};

    // MPR No validation
    if (!mprData.mprNo.trim()) newErrors.mprNo = "MPR Number is required";

    // MPR Date validation - PREVIOUS DATE ALLOWED but not future
    if (!mprData.mprDate) newErrors.mprDate = "MPR Date is required";
    else {
      const selectedDate = new Date(mprData.mprDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) newErrors.mprDate = "MPR Date cannot be in the future";
      // ✅ Previous date is allowed - no validation for past dates
    }

    // Required By Date validation - CANNOT BE IN PAST
    if (!mprData.requiredByDate) newErrors.requiredByDate = "Required By Date is required";
    else {
      const requiredDate = new Date(mprData.requiredByDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (requiredDate < today) {
        newErrors.requiredByDate = "Required By Date cannot be in the past";
      } else if (mprData.mprDate && requiredDate < new Date(mprData.mprDate)) {
        newErrors.requiredByDate = "Required By Date cannot be earlier than MPR Date";
      }
    }

    // Department validation
    if (!mprData.departmentId) newErrors.departmentId = "Department is required";

    // Project Name validation
    if (!mprData.projectName.trim()) newErrors.projectName = "Project Name is required";

    // MPR Type validation
    if (!mprData.mprTypeId) newErrors.mprTypeId = "MPR Type is required";

    // Tender Type validation
    if (!mprData.tenderTypeId) newErrors.tenderTypeId = "Tender Type is required";

    // Priority validation
    if (!mprData.priority) newErrors.priority = "Priority is required";

    // Duration Days validation
    if (mprData.durationDays && (mprData.durationDays < 1 || mprData.durationDays > 730)) {
      newErrors.durationDays = "Duration Days must be between 1 and 730";
    }

    // Justification validation
    if (!mprData.justification.trim()) newErrors.justification = "Business Justification is required";

    // Items validation
    if (mprData.tableRows.length === 0) {
      newErrors.items = "At least one item is required";
    } else {
      mprData.tableRows.forEach((row, idx) => {
        if (!row.itemCode.trim()) newErrors[`itemCode_${idx}`] = "Item Code required";
        if (!row.itemName.trim()) newErrors[`itemName_${idx}`] = "Item Name required";
        if (!row.qty || row.qty <= 0) newErrors[`qty_${idx}`] = "Valid Quantity required";
        if (!row.rate || row.rate <= 0) newErrors[`rate_${idx}`] = "Valid Rate required";
        if (!row.vendorIds || row.vendorIds.length === 0) newErrors[`vendors_${idx}`] = "At least one vendor required";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = async (e) => {
    const { name, value } = e.target;
    setMprData({ ...mprData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    
    // Check duplicate when MPR number changes
    if (name === "mprNo" && value) {
      await checkDuplicateMprNo(value);
    }
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
    if (mprData.tableRows.length === 1) {
      alert("At least one item is required");
      return;
    }
    const rows = [...mprData.tableRows];
    const removedRow = rows[index];
    if (removedRow.id) {
      setMprData({
        ...mprData,
        removedDetails: [...mprData.removedDetails, removedRow.id],
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

    if (errors[`itemCode_${index}`]) setErrors({ ...errors, [`itemCode_${index}`]: "" });
    if (errors[`itemName_${index}`]) setErrors({ ...errors, [`itemName_${index}`]: "" });
    if (errors[`qty_${index}`]) setErrors({ ...errors, [`qty_${index}`]: "" });
    if (errors[`rate_${index}`]) setErrors({ ...errors, [`rate_${index}`]: "" });
    if (errors[`vendors_${index}`]) setErrors({ ...errors, [`vendors_${index}`]: "" });
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
    if (errors[`vendors_${rowIndex}`]) setErrors({ ...errors, [`vendors_${rowIndex}`]: "" });
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
    setErrors({});
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
    generateMprNumber();
  };

  const cancelEdit = () => {
    if (window.confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
      resetForm();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

    // ✅ Final duplicate check before submit
    const isUnique = await checkDuplicateMprNo(mprData.mprNo);
    if (!isUnique) {
      alert("MPR number already exists. Please use a different number.");
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
        vendorIds: row.vendorIds || [],
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
        mprDetailRequests: mprDetailRequests,
      };

      const formData = new FormData();
      formData.append("mprData", new Blob([JSON.stringify(mprDataPayload)], { type: "application/json" }));

      if (mprData.mprDocs && mprData.mprDocs.length > 0) {
        mprData.mprDocs.forEach((file) => {
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
            specificationn: d.specification,
          })),
          deleteDetailIds: mprData.removedDetails || [],
        };
        const updateFormData = new FormData();
        updateFormData.append("mprData", new Blob([JSON.stringify(updatePayload)], { type: "application/json" }));
        if (mprData.mprDocs.length > 0) {
          mprData.mprDocs.forEach((file) => updateFormData.append("documents", file));
        }
        res = await apiClient.put("/api/mpr/update-with-files", updateFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.status === "SUCCESS") {
          alert("MPR updated successfully!");
          const approvalStatus = await fetchApprovalStatus(mprData.mprId);
          if (!approvalStatus.isSubmitted) {
            setCreatedMprId(mprData.mprId);
            setShowSubmitApproval(true);
          }
          resetForm();
          fetchMprList();
        }
      } else {
        res = await apiClient.post("/api/mpr/registration/with-files", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.status === "SUCCESS") {
          setCreatedMprId(res.data.mprId);
          setShowSubmitApproval(true);
          alert("MPR created successfully! Click 'Submit for Approval' to start workflow.");
          resetForm();
          fetchMprList();
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit MPR: " + (error.response?.data?.message || error.message));
    }
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

  const handleEdit = async (mpr) => {
    const documents = await fetchMprDocuments(mpr.mprId);
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
        vendorIds: d.vendors ? d.vendors.map((v) => v.vendorId) : [],
        vendorNames: d.vendors ? d.vendors.map((v) => v.vendorName).join(", ") : "",
      })),
      mprDocs: [],
      existingDocuments: documents,
      removedDetails: [],
      isSubmittedForApproval: approvalStatus.isSubmitted,
      approvalStatus: approvalStatus.approvalStatus,
    });

    if (!approvalStatus.isSubmitted) {
      setCreatedMprId(mpr.mprId);
      setShowSubmitApproval(true);
    } else {
      setShowSubmitApproval(false);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeExistingDocument = (index) => {
    const updatedDocs = [...mprData.existingDocuments];
    updatedDocs.splice(index, 1);
    setMprData({ ...mprData, existingDocuments: updatedDocs });
  };

  const filteredList = mprList.filter((mpr) => mpr.mprNo && mpr.mprNo.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedData = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getFileIcon = (fileName) => {
    if (!fileName) return <i className="bi bi-file-earmark-fill" />;
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <i className="bi bi-file-pdf-fill text-danger" />;
    if (ext === "xlsx" || ext === "xls") return <i className="bi bi-file-excel-fill text-success" />;
    if (ext === "doc" || ext === "docx") return <i className="bi bi-file-word-fill text-primary" />;
    if (ext === "jpg" || ext === "jpeg" || ext === "png") return <i className="bi bi-file-image-fill text-info" />;
    return <i className="bi bi-file-earmark-fill" />;
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Create Material Purchase Request (MPR)</h1>
        <p className="text-muted-soft">
          Submit a new material/service requisition for procurement. Fields marked with <span className="text-danger">*</span> are mandatory.
        </p>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h6 className="mb-0 fw-semibold">Request Details</h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* MPR No */}
              <div className="col-md-4">
                <label className="form-label">
                  MPR No <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    className={`form-control ${errors.mprNo ? "is-invalid" : ""}`}
                    name="mprNo"
                    placeholder="e.g., MPR/2024/04/00001"
                    value={mprData.mprNo}
                    onChange={handleFieldChange}
                    disabled={checkingDuplicate}
                  />
                  {checkingDuplicate && (
                    <span className="input-group-text">
                      <div className="spinner-border spinner-border-sm" />
                    </span>
                  )}
                </div>
                {errors.mprNo && <div className="invalid-feedback d-block">{errors.mprNo}</div>}
                <small className="text-muted">Unique identifier for this purchase request</small>
              </div>

              {/* MPR Date */}
              <div className="col-md-4">
                <label className="form-label">
                  Request Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.mprDate ? "is-invalid" : ""}`}
                  name="mprDate"
                  value={mprData.mprDate}
                  onChange={handleFieldChange}
                />
                {errors.mprDate && <div className="invalid-feedback">{errors.mprDate}</div>}
                <small className="text-muted">Date when this request is created (Past dates allowed)</small>
              </div>

              {/* Department */}
              <div className="col-md-4">
                <label className="form-label">
                  Department <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.departmentId ? "is-invalid" : ""}`}
                  name="departmentId"
                  value={mprData.departmentId}
                  onChange={handleFieldChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>
                {errors.departmentId && <div className="invalid-feedback">{errors.departmentId}</div>}
              </div>

              {/* Project Name */}
              <div className="col-md-4">
                <label className="form-label">
                  Project / Cost Center <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control ${errors.projectName ? "is-invalid" : ""}`}
                  name="projectName"
                  placeholder="e.g., ERP Implementation"
                  value={mprData.projectName}
                  onChange={handleFieldChange}
                />
                {errors.projectName && <div className="invalid-feedback">{errors.projectName}</div>}
              </div>

              {/* MPR Type */}
              <div className="col-md-4">
                <label className="form-label">
                  Procurement Category <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.mprTypeId ? "is-invalid" : ""}`}
                  name="mprTypeId"
                  value={mprData.mprTypeId}
                  onChange={handleFieldChange}
                >
                  <option value="">Select Category</option>
                  {mprTypes.map((m) => (
                    <option key={m.typeId} value={m.typeId}>
                      {m.typeName}
                    </option>
                  ))}
                </select>
                {errors.mprTypeId && <div className="invalid-feedback">{errors.mprTypeId}</div>}
              </div>

              {/* Tender Type */}
              <div className="col-md-4">
                <label className="form-label">
                  Bidding Method <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.tenderTypeId ? "is-invalid" : ""}`}
                  name="tenderTypeId"
                  value={mprData.tenderTypeId}
                  onChange={handleFieldChange}
                >
                  <option value="">Select Method</option>
                  {tenderTypes.map((t) => (
                    <option key={t.tenderTypeId} value={t.tenderTypeId}>
                      {t.tenderName}
                    </option>
                  ))}
                </select>
                {errors.tenderTypeId && <div className="invalid-feedback">{errors.tenderTypeId}</div>}
              </div>

              {/* Priority */}
              <div className="col-md-4">
                <label className="form-label">
                  Urgency Level <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.priority ? "is-invalid" : ""}`}
                  name="priority"
                  value={mprData.priority}
                  onChange={handleFieldChange}
                >
                  <option value="">Select Priority</option>
                  <option value="LOW">🟢 Low</option>
                  <option value="MEDIUM">🟡 Medium</option>
                  <option value="HIGH">🔴 High - Urgent</option>
                </select>
                {errors.priority && <div className="invalid-feedback">{errors.priority}</div>}
              </div>

              {/* Required By Date */}
              <div className="col-md-4">
                <label className="form-label">
                  Required By Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.requiredByDate ? "is-invalid" : ""}`}
                  name="requiredByDate"
                  value={mprData.requiredByDate}
                  onChange={handleFieldChange}
                />
                {errors.requiredByDate && <div className="invalid-feedback">{errors.requiredByDate}</div>}
                <small className="text-muted">Date when material is needed (Cannot be in past)</small>
              </div>

              {/* Delivery Schedule */}
              <div className="col-md-4">
                <label className="form-label">Delivery Terms</label>
                <input
                  className="form-control"
                  name="deliverySchedule"
                  placeholder="e.g., FOB, CIF, Ex-Works"
                  value={mprData.deliverySchedule}
                  onChange={handleFieldChange}
                />
                <small className="text-muted">Incoterms - International shipping terms</small>
              </div>

              {/* Duration Days */}
              <div className="col-md-4">
                <label className="form-label">Expected Lead Time (Days)</label>
                <input
                  type="number"
                  className={`form-control ${errors.durationDays ? "is-invalid" : ""}`}
                  name="durationDays"
                  placeholder="Days from order to delivery"
                  value={mprData.durationDays}
                  onChange={handleFieldChange}
                />
                {errors.durationDays && <div className="invalid-feedback">{errors.durationDays}</div>}
              </div>

              {/* Special Notes */}
              <div className="col-md-6">
                <label className="form-label">Special Instructions</label>
                <textarea
                  className="form-control"
                  name="specialNotes"
                  rows="2"
                  placeholder="Any specific requirements, quality standards, or delivery instructions..."
                  value={mprData.specialNotes}
                  onChange={handleFieldChange}
                />
              </div>

              {/* Justification */}
              <div className="col-md-6">
                <label className="form-label">
                  Business Justification <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control ${errors.justification ? "is-invalid" : ""}`}
                  name="justification"
                  rows="2"
                  placeholder="Why is this purchase required? What is the business impact?"
                  value={mprData.justification}
                  onChange={handleFieldChange}
                />
                {errors.justification && <div className="invalid-feedback">{errors.justification}</div>}
              </div>

              {/* Documents */}
              <div className="col-md-12">
                <label className="form-label">Supporting Documents</label>
                <input
                  type="file"
                  multiple
                  className="form-control"
                  onChange={(e) => setMprData({ ...mprData, mprDocs: Array.from(e.target.files) })}
                />
                <small className="text-muted">Upload drawings, specifications, approvals (PDF, Excel, Word, Images)</small>

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
                <h6 className="section-title mb-0">
                  Line Items <span className="text-danger">*</span>
                </h6>
                <button type="button" className="btn btn-sm btn-outline-success" onClick={addRow}>
                  <i className="bi bi-plus-lg me-1" />Add Item
                </button>
              </div>
              {errors.items && <div className="alert alert-danger py-1">{errors.items}</div>}
              <div className="table-responsive">
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <table className="table table-bordered table-hover table-sm align-middle" style={{ minWidth: "1800px" }}>
                    <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                      <tr>
                        <th style={{ width: columnWidths.sr }}>#</th>
                        <th style={{ width: columnWidths.itemCode }}>Item Code <span className="text-danger">*</span></th>
                        <th style={{ width: columnWidths.itemName }}>Item Name <span className="text-danger">*</span></th>
                        <th style={{ width: columnWidths.uom }}>UOM</th>
                        <th style={{ width: columnWidths.specification }}>Specification</th>
                        <th style={{ width: columnWidths.qty }}>Qty <span className="text-danger">*</span></th>
                        <th style={{ width: columnWidths.rate }}>Est. Rate <span className="text-danger">*</span></th>
                        <th style={{ width: columnWidths.value }}>Est. Value</th>
                        <th style={{ width: columnWidths.stock }}>Stock</th>
                        <th style={{ width: columnWidths.amc }}>AMC</th>
                        <th style={{ width: columnWidths.lastPurchase }}>Last Purchase</th>
                        <th style={{ width: columnWidths.vendors }}>Suggested Vendors <span className="text-danger">*</span></th>
                        <th style={{ width: columnWidths.action }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mprData.tableRows.map((row, index) => (
                        <tr key={index}>
                          <td className="text-center">{index + 1}</td>
                          <td>
                            <input
                              className={`form-control form-control-sm ${errors[`itemCode_${index}`] ? "is-invalid" : ""}`}
                              name="itemCode"
                              value={row.itemCode}
                              onChange={(e) => handleRowChange(index, e)}
                            />
                            {errors[`itemCode_${index}`] && <div className="invalid-feedback">{errors[`itemCode_${index}`]}</div>}
                          </td>
                          <td>
                            <input
                              className={`form-control form-control-sm ${errors[`itemName_${index}`] ? "is-invalid" : ""}`}
                              name="itemName"
                              value={row.itemName}
                              onChange={(e) => handleRowChange(index, e)}
                            />
                            {errors[`itemName_${index}`] && <div className="invalid-feedback">{errors[`itemName_${index}`]}</div>}
                          </td>
                          <td>
                            <input className="form-control form-control-sm" name="uom" value={row.uom} onChange={(e) => handleRowChange(index, e)} />
                          </td>
                          <td>
                            <input className="form-control form-control-sm" name="specification" value={row.specification} onChange={(e) => handleRowChange(index, e)} />
                          </td>
                          <td>
                            <input
                              type="number"
                              className={`form-control form-control-sm ${errors[`qty_${index}`] ? "is-invalid" : ""}`}
                              name="qty"
                              value={row.qty}
                              onChange={(e) => handleRowChange(index, e)}
                            />
                            {errors[`qty_${index}`] && <div className="invalid-feedback">{errors[`qty_${index}`]}</div>}
                          </td>
                          <td>
                            <input
                              type="number"
                              className={`form-control form-control-sm ${errors[`rate_${index}`] ? "is-invalid" : ""}`}
                              name="rate"
                              value={row.rate}
                              onChange={(e) => handleRowChange(index, e)}
                            />
                            {errors[`rate_${index}`] && <div className="invalid-feedback">{errors[`rate_${index}`]}</div>}
                          </td>
                          <td>
                            <input className="form-control form-control-sm bg-light" name="value" value={row.value} readOnly />
                          </td>
                          <td>
                            <input type="number" className="form-control form-control-sm" name="stock" value={row.stock} onChange={(e) => handleRowChange(index, e)} />
                          </td>
                          <td>
                            <select className="form-select form-select-sm" name="amc" value={row.amc} onChange={(e) => handleRowChange(index, e)}>
                              <option value="">No</option>
                              <option value="Yes">Yes</option>
                            </select>
                          </td>
                          <td>
                            <input type="date" className="form-control form-control-sm" name="lastPurchase" value={row.lastPurchase} onChange={(e) => handleRowChange(index, e)} />
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <input
                                className={`form-control form-control-sm ${errors[`vendors_${index}`] ? "is-invalid" : ""}`}
                                readOnly
                                value={row.vendorNames || ""}
                                placeholder="Select Vendors"
                              />
                              <button type="button" className="btn btn-sm btn-primary" onClick={() => setVendorPopupIndex(index)}>
                                <i className="bi bi-people" />
                              </button>
                            </div>
                            {errors[`vendors_${index}`] && <div className="invalid-feedback d-block">{errors[`vendors_${index}`]}</div>}
                          </td>
                          <td className="text-center">
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
                <h5 className="text-primary">Total Estimated Value: ₹ {mprData.totalValue.toLocaleString()}</h5>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              {mprData.mprId && (
                <button type="button" className="btn btn-outline-secondary px-4" onClick={cancelEdit}>
                  <i className="bi bi-x-circle me-2" />Cancel
                </button>
              )}
              <button type="submit" className="btn btn-primary px-4" disabled={checkingDuplicate}>
                {checkingDuplicate ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-send me-2" />
                )}
                {mprData.mprId ? "Update MPR" : "Submit MPR"}
              </button>
            </div>
          </form>

          {showSubmitApproval && !mprData.isSubmittedForApproval && (
            <div className="alert alert-info mt-3">
              <p className="mb-2">
                <strong>MPR {mprData.mprId ? "updated" : "created"} successfully!</strong>
              </p>
              <button className="btn btn-primary" onClick={handleSubmitForApproval}>
                <i className="bi bi-send me-2" />Submit for Approval
              </button>
              <small className="d-block mt-2 text-muted">
                This will start the multi-level approval workflow (Manager → Finance → Director)
              </small>
            </div>
          )}

          {mprData.mprId && mprData.isSubmittedForApproval && (
            <div className="alert alert-secondary mt-3">
              <strong>Approval Status:</strong>{" "}
              {mprData.approvalStatus === "PENDING"
                ? "⏳ Pending Approval"
                : mprData.approvalStatus === "APPROVED"
                ? "✅ Fully Approved"
                : "❌ Rejected"}
            </div>
          )}
        </div>
      </div>

      {/* MPR List */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <h6 className="mb-0 fw-semibold">Saved MPRs (Pending Approval)</h6>
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
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((mpr, i) => {
                  const departmentName = departments.find((d) => Number(d.departmentId) === Number(mpr.departmentId))?.departmentName || "";
                  return (
                    <tr key={i}>
                      <td className="fw-semibold text-primary">{mpr.mprNo}</td>
                      <td>{departmentName}</td>
                      <td>{mpr.projectName}</td>
                      <td>
                        <span
                          className={`badge rounded-pill ${
                            mpr.priority === "HIGH"
                              ? "bg-danger"
                              : mpr.priority === "MEDIUM"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {mpr.priority}
                        </span>
                      </td>
                      <td>₹ {mpr.totalValue?.toLocaleString() || 0}</td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-warning" onClick={() => handleEdit(mpr)}>
                          <i className="bi bi-pencil me-1" />Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted-soft">
                      <i className="bi bi-inbox fs-3 d-block mb-2" />
                      No MPRs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between align-items-center">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <i className="bi bi-chevron-left" /> Prev
          </button>
          <span className="text-muted-soft small">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next <i className="bi bi-chevron-right ms-1" />
          </button>
        </div>
      </div>

      {/* Vendor Popup */}
      {vendorPopupIndex !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "420px", width: "100%", margin: 0 }}>
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-semibold">Select Vendors</h6>
                <button type="button" className="btn-close" onClick={() => setVendorPopupIndex(null)} />
              </div>
              <div className="modal-body">
                <div className="input-group mb-3">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted" />
                  </span>
                  <input
                    className="form-control border-start-0"
                    placeholder="Search vendor…"
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                  />
                </div>
                <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                  {vendors
                    .filter((v) => v.vendorName.toLowerCase().includes(vendorSearch.toLowerCase()))
                    .map((v) => (
                      <div key={v.vendorId} className="form-check py-1 border-bottom">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`vendor-${v.vendorId}`}
                          checked={mprData.tableRows[vendorPopupIndex]?.vendorIds?.includes(v.vendorId) || false}
                          onChange={() => toggleVendorSelection(vendorPopupIndex, v.vendorId)}
                        />
                        <label className="form-check-label" htmlFor={`vendor-${v.vendorId}`}>
                          <span className="badge bg-light text-dark me-2">{v.vendorCode}</span>
                          {v.vendorName}
                        </label>
                      </div>
                    ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary btn-sm" onClick={() => setVendorPopupIndex(null)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer */}
      {viewerDoc && <DocumentViewer filePath={viewerDoc.filePath} fileName={viewerDoc.fileName} onClose={() => setViewerDoc(null)} />}
    </div>
  );
};

export default CreateMPR;