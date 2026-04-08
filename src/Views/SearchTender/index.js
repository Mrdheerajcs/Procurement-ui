
import React, { useState, useEffect } from "react";

const SearchTender = () => {
  const today = new Date().toISOString().split("T")[0];

  const [filters, setFilters] = useState({
    date: "",
    tenderNo: "",
    department: ""
  });

  const [data, setData] = useState([]);
  const [result, setResult] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);

  useEffect(() => {
    const departments = ["IT", "HR", "Finance"];
    let dummy = [];

    for (let i = -5; i < 5; i++) {
      let date = new Date();
      date.setDate(date.getDate() + i);
      let formattedDate = date.toISOString().split("T")[0];

      dummy.push({
        id: i + 6,
        tenderNo: `T00${i + 6}`,
        department: departments[(i + 6) % 3],
        date: formattedDate,
        mprNo: `MPR-${i + 101}`,
        project: `${(i + 6) % 3 === 0 ? "School" : (i + 6) % 3 === 1 ? "House" : "Road"}`,
        priority: ["High", "Medium", "Low"][(i + 6) % 3],
        justification: "Urgent",
        boqPDF: "/BOQ.pdf", 
        specPDF: "/Specification.pdf",
        items: [
          {
            itemCode: `CEM${i+1}`,
            itemName: "Cement",
            uom: "Bags",
            specification: "Grade 53",
            qty: 100 + i * 5,
            rate: 350,
            value: (100 + i*5) * 350,
            stockAMC: 50,
            lastPurchase: "2026-03-15",
            tenderName: `Company A`
          },
          {
            itemCode: `STL${i+1}`,
            itemName: "Steel Rod",
            uom: "Ton",
            specification: "TMT 500",
            qty: 20 + i,
            rate: 50000,
            value: (20 + i) * 50000,
            stockAMC: 5,
            lastPurchase: "2026-03-20",
            tenderName: `Company B`
          }
        ]
      });
    }

    setData(dummy);
    setResult(dummy);
  }, []);

  useEffect(() => {
    let filtered = [...data];
    if (filters.date) filtered = filtered.filter(d => d.date >= filters.date);
    if (filters.tenderNo)
      filtered = filtered.filter(d =>
        d.tenderNo.toLowerCase().includes(filters.tenderNo.toLowerCase())
      );
    if (filters.department) filtered = filtered.filter(d => d.department === filters.department);
    setResult(filtered);
  }, [filters, data]);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleView = (item) => setSelectedTender(item);
  const handleBack = () => setSelectedTender(null);

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Search Tender</h1>
        <p className="text-muted-soft">Find and view published tenders</p>
      </div>

      {selectedTender ? (
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-4" onClick={handleBack}>
            <i className="bi bi-arrow-left me-2" />Back to Results
          </button>

          {/* Tender Header Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">Tender Details — {selectedTender.tenderNo}</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted-soft small mb-1">MPR No</div>
                  <div className="fw-semibold">{selectedTender.mprNo}</div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted-soft small mb-1">Project</div>
                  <div className="fw-semibold">{selectedTender.project}</div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted-soft small mb-1">Department</div>
                  <div className="fw-semibold">{selectedTender.department}</div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted-soft small mb-1">Priority</div>
                  <span className={`badge rounded-pill ${selectedTender.priority === 'High' ? 'bg-danger' : selectedTender.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                    {selectedTender.priority}
                  </span>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="text-muted-soft small mb-1">Justification</div>
                  <div className="fw-semibold">{selectedTender.justification}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">Tender Items</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Sr</th>
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>UOM</th>
                      <th>Specification</th>
                      <th className="text-end">Qty</th>
                      <th className="text-end">Rate</th>
                      <th className="text-end">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTender.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td><code>{item.itemCode}</code></td>
                        <td className="fw-semibold">{item.itemName}</td>
                        <td>{item.uom}</td>
                        <td>{item.specification}</td>
                        <td className="text-end">{item.qty}</td>
                        <td className="text-end">{item.rate}</td>
                        <td className="text-end">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Downloads */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold"><i className="bi bi-download me-2 text-primary" />Downloads</h6>
            </div>
            <div className="card-body">
              <div className="d-flex gap-3 flex-wrap">
                <a href={selectedTender.boqPDF} download className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-file-earmark-pdf me-2" />BOQ.pdf
                </a>
                <a href={selectedTender.specPDF} download className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-file-earmark-pdf me-2" />Specification.pdf
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold"><i className="bi bi-funnel me-2 text-primary" />Filter Tenders</h6>
            </div>
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <div className="form-floating">
                    <input type="date" className="form-control" id="filterDate" name="date" min={today} placeholder="Date" onChange={handleChange} />
                    <label htmlFor="filterDate">Date From</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-floating">
                    <input type="text" className="form-control" id="filterTenderNo" name="tenderNo" placeholder="Tender No" onChange={handleChange} />
                    <label htmlFor="filterTenderNo">Tender No</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-floating">
                    <select className="form-select" id="filterDept" name="department" onChange={handleChange}>
                      <option value="">All Departments</option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                    </select>
                    <label htmlFor="filterDept">Department</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <button className="btn btn-primary w-100">
                    <i className="bi bi-search me-2" />Search
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">Results <span className="badge bg-primary ms-2">{result.length}</span></h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Sr</th>
                      <th>Date</th>
                      <th>Tender No</th>
                      <th>Department</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.length > 0 ? (
                      result.map((item, index) => (
                        <tr key={item.id} style={{ cursor: "pointer" }} onClick={() => handleView(item)}>
                          <td>{index + 1}</td>
                          <td>{item.date}</td>
                          <td><span className="fw-semibold text-primary">{item.tenderNo}</span></td>
                          <td>{item.department}</td>
                          <td className="text-center">
                            <button className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); handleView(item); }}>
                              <i className="bi bi-eye me-1" />View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-5 text-muted-soft">
                          <i className="bi bi-inbox fs-3 d-block mb-2" />No tenders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchTender;
