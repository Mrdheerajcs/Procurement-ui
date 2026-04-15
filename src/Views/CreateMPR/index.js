import React, { useState, useEffect } from "react";
import apiClient from "../../auth/apiClient";

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
    tableRows: [
      {
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

      if (res.status === "SUCCESS") {
        setMprTypes(res.data);
      }
    } catch (err) {
      console.log(err);
      setLoginError(err.message || "Something went wrong");
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await apiClient.get("api/vendors");

      if (res.status === "SUCCESS") {
        setVendors(res.data);
      }
    } catch (err) {
      console.log(err);
      setLoginError(err.message || "Something went wrong");
    }
  };

  const fetchTenderTypes = async () => {
    try {
      const res = await apiClient.get("/api/master/getAllTenderType");

      if (res.status === "SUCCESS") {
        setTenderTypes(res.data);
      }
    } catch (err) {
      console.log(err);
      setLoginError(err.message || "Something went wrong");
    }
  };


  const fetchDepartments = async () => {
    try {
      const res = await apiClient.get("/api/master/getAllDepartment");
      if (res.status === "SUCCESS") {
        setDepartments(res.data);
      }
    } catch (err) {
      console.log(err);
      setLoginError(err.message || "Something went wrong");
    }
  };


  useEffect(() => {
    fetchMprList();
  }, []);

  const fetchMprList = async () => {
    try {
      const res = await apiClient.get(
        "/api/mpr/getallbyStatus",
        {
          params: { status: "n" }
        }
      );

      if (res.status === "SUCCESS") {
        setMprList(res.data);
      } else {
        console.error("Failed to fetch MPR List:", res.message);
      }
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
    const removedRow = rows.splice(index, 1)[0];

    const removedDetails = removedRow.id
      ? [...(mprData.removedDetails || []), removedRow.id]
      : mprData.removedDetails || [];

    setMprData({ ...mprData, tableRows: rows, removedDetails });
  };

  const handleRowChange = (index, e) => {
    const { name, value } = e.target;
    const rows = [...mprData.tableRows];
    rows[index][name] = value;
    setMprData({ ...mprData, tableRows: rows });
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
      tableRows: [
        {
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
    });
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
      let res;

 
      if (mprData.mprId) {
        const details = mprData.tableRows.map((row, index) => ({
          mprDetailId: row.id || null,
          mprId: mprData.mprId,
          slNo: index + 1,

          itemCode: row.itemCode || "",
          itemName: row.itemName || "",
          uom: row.uom || "",
          specificationn: row.specification || "", 
          requestedQty: Number(row.qty) || 0,
          estimatedRate: Number(row.rate) || 0,
          estimatedValue: Number(row.value) || 0,
          stockAvailable: Number(row.stock) || 0,
          avgMonthlyConsumption: Number(row.amc) || 0,
          lastPurchaseInfo: row.lastPurchase || "",
          remarks: "",
          status: "n",
          vendorIds: row.vendorIds || [],
        }));

        const updatePayload = {
          mprId: mprData.mprId,
          mprNo: mprData.mprNo,
          mprDate: mprData.mprDate,
          departmentId: mprData.departmentId,
          projectName: mprData.projectName,
          mprTypeId: mprData.mprTypeId,
          tenderTypeId: mprData.tenderTypeId,
          priority: mprData.priority,
          requiredByDate: mprData.requiredByDate,
          deliverySchedule: mprData.deliverySchedule,
          durationDays: mprData.durationDays,
          specialNotes: mprData.specialNotes,
          justification: mprData.justification,

          details: details,
          deleteDetailIds: mprData.removedDetails || [],
        };

        res = await apiClient.post("/api/mpr/update", updatePayload);
      }


      else {
        const mprDetailRequests = mprData.tableRows.map((row) => ({
          id: row.id || null,
          itemCode: row.itemCode || "",
          itemName: row.itemName || "",
          uom: row.uom || "",
          specification: row.specification || "",
          requestedQty: Number(row.qty) || 0,
          estimatedRate: Number(row.rate) || 0,
          estimatedValue: Number(row.value) || 0,
          stockAvailable: Number(row.stock) || 0,
          avgMonthlyConsumption: Number(row.amc) || 0,
          lastPurchaseInfo: row.lastPurchase || "",
          vendorIds: row.vendorIds || [],
        }));

        const createPayload = {
          mprId: null,
          mprNo: mprData.mprNo,
          mprDate: mprData.mprDate,
          departmentId: mprData.departmentId,
          projectName: mprData.projectName,
          mprTypeId: mprData.mprTypeId,
          tenderTypeId: mprData.tenderTypeId,
          priority: mprData.priority,
          requiredByDate: mprData.requiredByDate,
          deliverySchedule: mprData.deliverySchedule,
          durationDays: mprData.durationDays,
          specialNotes: mprData.specialNotes,
          justification: mprData.justification,
          removedDetails: mprData.removedDetails || [],
          mprDetailRequests,
        };

        res = await apiClient.post("/api/mpr/registration", createPayload);
      }

      console.log("API Response:", res.data);


      alert(`MPR ${mprData.mprId ? "updated" : "created"} successfully!`);


      fetchMprList();

      resetForm();

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit MPR");
    }
  };

  const handleEdit = (mpr) => {
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
      tableRows: mpr.mprDetailResponnces.map((d) => ({
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

        vendorNames: d.vendors
          ? d.vendors.map(v => v.vendorName).join(", ")
          : "",
      })),
      removedDetails: [],
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredList = mprList.filter((mpr) =>
    mpr.mprNo.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedData = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Create MPR</h1>
        <p className="text-muted-soft">Submit a new Material Purchase Request</p>
      </div>

      {/* Header Form Card */}
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
                  <input className="form-control" id="priority" name="priority" placeholder="Priority" value={mprData.priority} onChange={handleFieldChange} />
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
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button type="submit" className="btn btn-primary px-4">
                <i className="bi bi-send me-2" />{mprData.mprId ? "Update MPR" : "Submit MPR"}
              </button>
            </div>
          </form>
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
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((mpr, i) => {
                  const departmentName = departments.find(d => d.departmentId === mpr.departmentId)?.departmentName || '';
                  return (
                    <tr key={i}>
                      <td className="fw-semibold text-primary">{mpr.mprNo}</td>
                      <td>{departmentName}</td>
                      <td>{mpr.projectName}</td>
                      <td>
                        <span className={`badge rounded-pill ${mpr.priority === 'High' ? 'bg-danger' : mpr.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {mpr.priority}
                        </span>
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
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted-soft">
                      <i className="bi bi-inbox fs-3 d-block mb-2" />No MPRs found
                    </td>
                  </tr>
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
    </div>
  );
};

export default CreateMPR;

/*

        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-4">
              <label>MPR No</label>
              <input
                className="form-control"
                name="mprNo"
                value={mprData.mprNo}
                onChange={handleFieldChange}
              />
            </div>
            <div className="col-md-4">
              <label>MPR Date</label>
              <input
                type="date"
                className="form-control"
                name="mprDate"
                value={mprData.mprDate}
                onChange={handleFieldChange}
              />
            </div>
            <div className="col-md-4">
              <label>Department</label>
              <select
                className="form-control"
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
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label>Project Name</label>
              <input
                className="form-control"
                name="projectName"
                value={mprData.projectName}
                onChange={handleFieldChange}
              />
            </div>
            <div className="col-md-4">
              <label>MPR Type</label>
              <select
                className="form-control"
                name="mprTypeId"
                value={mprData.mprTypeId}
                onChange={handleFieldChange}
              >
                <option value="">Select MPR Type</option>
                {mprTypes.map((m) => (
                  <option key={m.typeId} value={m.typeId}>
                    {m.typeName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label>Tender Type</label>
              <select
                className="form-control"
                name="tenderTypeId"
                value={mprData.tenderTypeId}
                onChange={handleFieldChange}
              >
                <option value="">Select Tender Type</option>
                {tenderTypes.map((t) => (
                  <option key={t.tenderTypeId} value={t.tenderTypeId}>
                    {t.tenderName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label>Priority</label>
              <input
                className="form-control"
                name="priority"
                value={mprData.priority}
                onChange={handleFieldChange}
              />
            </div>
            <div className="col-md-4">
              <label>Required By Date</label>
              <input
                type="date"
                className="form-control"
                name="requiredByDate"
                value={mprData.requiredByDate}
                onChange={handleFieldChange}
              />
            </div>
            <div className="col-md-4">
              <label>Delivery Schedule</label>
              <input
                className="form-control"
                name="deliverySchedule"
                value={mprData.deliverySchedule}
                onChange={handleFieldChange}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label>Duration Days</label>
              <input
                type="number"
                className="form-control"
                name="durationDays"
                value={mprData.durationDays}
                onChange={handleFieldChange}
              />
            </div>
            <div className="col-md-4">
              <label>Special Notes</label>
              <textarea
                className="form-control"
                rows={2}
                name="specialNotes"
                value={mprData.specialNotes}
                onChange={handleFieldChange}
              ></textarea>
            </div>
            <div className="col-md-4">
              <label>Justification</label>
              <textarea
                className="form-control"
                rows={2}
                name="justification"
                value={mprData.justification}
                onChange={handleFieldChange}
              ></textarea>
            </div>
          </div>

          <h5 className="mt-4 text-primary">Items</h5>
          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              <table
                className="table table-bordered table-striped table-sm text-center align-middle"
                style={{ minWidth: "1500px" }}
              >
                <colgroup>
                  <col style={{ width: "60px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "100px" }} />
                  <col style={{ width: "200px" }} />
                  <col style={{ width: "100px" }} />
                  <col style={{ width: "100px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "100px" }} />
                  <col style={{ width: "80px" }} />
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "400px" }} />
                  <col style={{ width: "80px" }} />
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
                    <th>Vendor name</th>
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
                        <div className="d-flex align-items-center">
                          <input
                            className="form-control form-control-sm"
                            readOnly
                            value={row.vendorNames || ""}
                            placeholder="Select Vendors"
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-primary ms-1"
                            onClick={() => setVendorPopupIndex(index)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeRow(index)}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-start mt-2">
            <button type="button" className="btn btn-success btn-sm" onClick={addRow}>
              + Add Row
            </button>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <button type="submit" className="btn btn-primary">
              {mprData.mprId ? "Update MPR" : "Submit MPR"}
            </button>
          </div>
        </form>
      </div>

      <div className="card mt-4 p-3 shadow-sm">
        <h5>MPR List</h5>
        <input
          className="form-control mb-2"
          placeholder="Search by MPR No"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="table-responsive">
          <table className="table table-bordered table-sm text-center">
            <thead className="table-dark">
              <tr>
                <th>MPR No</th>
                <th>Department</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((mpr, i) => {
                const departmentName = departments.find(d => d.departmentId === mpr.departmentId)?.departmentName || '';
                return (
                  <tr key={i}>
                    <td>{mpr.mprNo}</td>
                    <td>{departmentName}</td>
                    <td>{mpr.projectName}</td>
                    <td>{mpr.priority}</td>
                    <td>
                      <button className="btn btn-warning btn-sm" onClick={() => handleEdit(mpr)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between">
          <button
            className="btn btn-sm btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-sm btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {vendorPopupIndex !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div className="bg-white rounded p-3" style={{ width: "400px", maxHeight: "400px", overflowY: "auto" }}>
            <h5>Select Vendors</h5>
            <input
              className="form-control mb-2"
              placeholder="Search vendor"
              value={vendorSearch}
              onChange={(e) => setVendorSearch(e.target.value)}
            />
            <div style={{ maxHeight: "250px", overflowY: "auto" }}>
              {vendors
                .filter((v) => v.vendorName.toLowerCase().includes(vendorSearch.toLowerCase()))
                .map((v) => (
                  <div key={v.vendorId} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`vendor-${v.vendorId}`}
                      checked={mprData.tableRows[vendorPopupIndex].vendorIds.includes(v.vendorId) || false}
                      onChange={() => toggleVendorSelection(vendorPopupIndex, v.vendorId)}
                    />
                    <label className="form-check-label" htmlFor={`vendor-${v.vendorId}`}>
                      {v.vendorCode} - {v.vendorName}
                    </label>
                  </div>
                ))}
            </div>
            <div className="text-end mt-2">
              <button className="btn btn-sm btn-secondary" onClick={() => setVendorPopupIndex(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMPR;
*/