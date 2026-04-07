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
        status: "",
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
          status: "",
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

  // ======= Submit Handler with fixed payload =======
  const handleSubmit = (e) => {
    e.preventDefault();

    // Map tableRows into mprDetailRequests
    const mprDetailRequests = mprData.tableRows.map((row) => ({
      id: row.id || null, // If editing existing row, carry ID
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
      status: "pending", // Default status
    }));

    // Build final payload
    const payload = {
      mprId: mprData.mprId || null, // null for new, existing for edit
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
      removedDetails: mprData.removedDetails || [], // track deleted detail rows
      mprDetailRequests,
    };

    console.log("Final Payload:", payload);

    // Add/update MPR in list (simulate API response)
    if (!mprData.mprId) {
      setMprList([...mprList, payload]);
    } else {
      setMprList(
        mprList.map((m) => (m.mprId === payload.mprId ? payload : m))
      );
    }

    // Reset form for new entry
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
          amc: 1,
          lastPurchase: "",
          vendorIds: [],
          vendorNames: "",
          status: "pending",
        },
      ],
      removedDetails: [],
    });
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
        vendorIds: d.vendorIds || [],
        vendorNames: "", // will bind if needed
        status: d.status || "pending",
      })),
      removedDetails: [],
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ===== Pagination =====
  const filteredList = mprList.filter((mpr) =>
    mpr.mprNo.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedData = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container-fluid mt-2 px-2">
      <div className="card shadow-sm p-2">
        <div className="bg-light border-bottom">
          <h4 className="mb-3 text-black">Create MPR</h4>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Fields */}
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

          {/* Other Fields */}
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

          {/* Table */}
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
                  <col style={{ width: "100px" }} />
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
                    <th>Status</th>
                    <th>Vendor name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mprData.tableRows.map((row, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      {["itemCode", "itemName", "uom", "specification", "qty", "rate", "value", "stock", "amc", "lastPurchase", "status"].map((key) => (
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
              Submit MPR
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

      {/* Vendor Modal */}
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