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
        date: formattedDate
      });
    }

    setData(dummy);
    setResult(dummy); 
  }, []);

  // ✅ Filter logic
  useEffect(() => {
    let filtered = [...data];

    
    if (filters.date) {
      filtered = filtered.filter(d => d.date >= filters.date);
    }

    if (filters.tenderNo) {
      filtered = filtered.filter(d =>
        d.tenderNo.toLowerCase().includes(filters.tenderNo.toLowerCase())
      );
    }

    if (filters.department) {
      filtered = filtered.filter(d => d.department === filters.department);
    }

    setResult(filtered);
  }, [filters, data]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
<div className="border shadow-sm rounded p-2 mb-4">
      <h4 className="mb-3">Search Tender</h4>

      <div className="row mb-4">
        {/* Date */}
        <div className="col-md-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            name="date"
            min={today}
            className="form-control"
            onChange={handleChange}
          />
        </div>

        {/* Tender No */}
        <div className="col-md-3">
          <label className="form-label">Tender No</label>
          <input
            type="text"
            name="tenderNo"
            className="form-control"
            placeholder="Enter Tender No"
            onChange={handleChange}
          />
        </div>

        {/* Department */}
        <div className="col-md-3">
          <label className="form-label">Department</label>
          <select
            name="department"
            className="form-control"
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        {/* Button */}
        <div className="col-md-3 d-flex align-items-end">
          <button className="btn btn-primary w-100">
            Search
          </button>
        </div>
      </div>

      
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Sr</th>
            <th>Date</th>
            <th>Tender No</th>
            <th>Department</th>
          </tr>
        </thead>

        <tbody>
          {result.length > 0 ? (
            result.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.date}</td>
                 <td>{item.tenderNo}</td>
                <td>{item.department}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  );
};

export default SearchTender;