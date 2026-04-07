
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
   <div className="container-fluid mt-2 px-2">
      {selectedTender ? (
        <div className="border border-secondary rounded p-4">
          {/* Back + Heading */}
          <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
            <h4 className="mb-0">Tender Details</h4>
            <button className="btn btn-secondary" onClick={handleBack}>← Back</button>
          </div>

          <div className="mt-3 d-flex flex-wrap gap-4">
            <strong>MPR No:</strong> {selectedTender.mprNo}
            <strong>Project:</strong> {selectedTender.project}
            <strong>Department:</strong> {selectedTender.department}
        <strong>Priority:</strong> {selectedTender.priority}
            <strong>Justification:</strong> {selectedTender.justification}
          </div>

          <div className="mt-4">
            <h5>Tender Items</h5>
            <table className="table table-bordered table-striped">
              <thead className="table-light">
                <tr>
                  <th>Sr</th>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>UOM</th>
                  <th>Specification</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Value</th>
                 
                </tr>
              </thead>
              <tbody>
                {selectedTender.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{item.itemCode}</td>
                    <td>{item.itemName}</td>
                    <td>{item.uom}</td>
                    <td>{item.specification}</td>
                    <td>{item.qty}</td>
                    <td>{item.rate}</td>
                    <td>{item.value}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <h5>Downloads</h5>
            <ul>
              <li>
                <a href={selectedTender.boqPDF} download className="text-primary" style={{ textDecoration: "underline", cursor: "pointer" }}>
                  BOQ.pdf 
                </a>
              </li>
              <li>
                <a href={selectedTender.specPDF} download className="text-primary" style={{ textDecoration: "underline", cursor: "pointer" }}>
                  Specification.pdf 
                </a>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <>
        
          <div className="border border-secondary rounded p-4 mb-4">
            <h4 className="mb-3">Search Tender</h4>
            <div className="row mb-4">
              <div className="col-md-3">
                <label>Date</label>
                <input type="date" name="date" min={today} className="form-control" onChange={handleChange}/>
              </div>
              <div className="col-md-3">
                <label>Tender No</label>
                <input type="text" name="tenderNo" placeholder="Enter Tender No" className="form-control" onChange={handleChange}/>
              </div>
              <div className="col-md-3">
                <label>Department</label>
                <select name="department" className="form-select" onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button className="btn btn-primary w-100">Search</button>
              </div>
            </div>

            {/* Search Table */}
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Sr</th>
                  <th>Date</th>
                  <th>Tender No</th>
                  <th>Department</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {result.length > 0 ? (
                  result.map((item, index) => (
                    <tr key={item.id} style={{ cursor: "pointer" }} onClick={() => handleView(item)}>
                      <td>{index + 1}</td>
                      <td>{item.date}</td>
                      <td>{item.tenderNo}</td>
                      <td>{item.department}</td>
                      <td>
                        <button className="btn btn-sm btn-success" onClick={(e) => { e.stopPropagation(); handleView(item); }}>View Tender</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No Data Found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchTender;