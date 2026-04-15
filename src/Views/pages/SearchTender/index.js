import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";
import { useNavigate } from "react-router-dom";

const SearchTender = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [filters, setFilters] = useState({
    date: "",
    tenderNo: "",
    department: "",
    tenderCategory: "",
  });

  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all published tenders
  useEffect(() => {
    fetchPublishedTenders();
  }, []);

  const fetchPublishedTenders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/tenders/published");
      if (res.status === "SUCCESS") {
        setTenders(res.data);
        setFilteredTenders(res.data);
      }
    } catch (err) {
      console.error("Error fetching tenders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...tenders];
    if (filters.date) filtered = filtered.filter(t => t.publishDate >= filters.date);
    if (filters.tenderNo) filtered = filtered.filter(t => t.tenderNo?.toLowerCase().includes(filters.tenderNo.toLowerCase()));
    if (filters.department) filtered = filtered.filter(t => t.department === filters.department);
    if (filters.tenderCategory) filtered = filtered.filter(t => t.tenderCategory === filters.tenderCategory);
    setFilteredTenders(filtered);
  }, [filters, tenders]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleViewDetails = (tender) => {
    setSelectedTender(tender);
  };

  const handleParticipate = (tenderId) => {
    navigate(`/bid-submission/${tenderId}`);
  };

  const handleBack = () => {
    setSelectedTender(null);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const isBiddingOpen = (tender) => {
    const today = new Date().toISOString().split("T")[0];
    return tender.bidStartDate <= today && tender.bidEndDate >= today;
  };

  const getBiddingStatus = (tender) => {
    const today = new Date().toISOString().split("T")[0];
    if (tender.bidStartDate > today) return { text: "Upcoming", class: "bg-warning text-dark" };
    if (tender.bidEndDate < today) return { text: "Closed", class: "bg-secondary" };
    return { text: "Open", class: "bg-success" };
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Search Tender</h1>
        <p className="text-muted-soft">Find and participate in published tenders</p>
      </div>

      {selectedTender ? (
        // TENDER DETAILS VIEW
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-4" onClick={handleBack}>
            <i className="bi bi-arrow-left me-2" />Back to Results
          </button>

          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">Tender Details — {selectedTender.tenderNo}</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="text-muted-soft small mb-1">Tender Title</div>
                  <div className="fw-semibold">{selectedTender.tenderTitle}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted-soft small mb-1">NIT Number</div>
                  <div className="fw-semibold">{selectedTender.nitNumber || "-"}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted-soft small mb-1">Category</div>
                  <div className="fw-semibold">{selectedTender.tenderCategory || "Goods"}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted-soft small mb-1">Department</div>
                  <div className="fw-semibold">{selectedTender.department}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted-soft small mb-1">Project</div>
                  <div className="fw-semibold">{selectedTender.projectName}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted-soft small mb-1">Priority</div>
                  <span className={`badge rounded-pill ${selectedTender.priority === 'High' ? 'bg-danger' : selectedTender.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                    {selectedTender.priority}
                  </span>
                </div>
              </div>

              <hr />

              <div className="row g-3">
                <div className="col-md-3">
                  <div className="text-muted-soft small mb-1">Publish Date</div>
                  <div>{formatDate(selectedTender.publishDate)}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted-soft small mb-1">Bid Start Date</div>
                  <div>{formatDate(selectedTender.bidStartDate)}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted-soft small mb-1">Bid End Date</div>
                  <div>{formatDate(selectedTender.bidEndDate)}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted-soft small mb-1">Bid Opening Date</div>
                  <div>{formatDate(selectedTender.bidOpeningDate)}</div>
                </div>
              </div>

              <hr />

              <div className="row g-3">
                <div className="col-md-4">
                  <div className="text-muted-soft small mb-1">Tender Fee</div>
                  <div className="fw-semibold">
                    ₹ {selectedTender.tenderFeeAmount?.toLocaleString() || "0"}
                    {selectedTender.feeExemptionDetails && (
                      <small className="text-muted-soft ms-2">(Exemption: {selectedTender.feeExemptionDetails})</small>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted-soft small mb-1">EMD Amount</div>
                  <div className="fw-semibold">₹ {selectedTender.emdAmount?.toLocaleString() || "0"}</div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted-soft small mb-1">EMD Type</div>
                  <div>{selectedTender.emdType || "BG/DD"}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-muted-soft small mb-1">Description</div>
                <p className="mb-0">{selectedTender.tenderDescription || "No description provided"}</p>
              </div>
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center">
              <span className={`badge ${getBiddingStatus(selectedTender).class} fs-6`}>
                {getBiddingStatus(selectedTender).text}
              </span>
              <button
                className="btn btn-primary"
                disabled={!isBiddingOpen(selectedTender)}
                onClick={() => handleParticipate(selectedTender.tenderId)}
              >
                <i className="bi bi-send me-2" />Participate in Bid
              </button>
            </div>
          </div>
        </div>
      ) : (
        // TENDER LIST VIEW
        <>
          {/* Filter Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold"><i className="bi bi-funnel me-2 text-primary" />Filter Tenders</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="form-floating">
                    <input type="date" className="form-control" id="filterDate" name="date" min={today} onChange={handleFilterChange} />
                    <label htmlFor="filterDate">Publish Date From</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-floating">
                    <input type="text" className="form-control" id="filterTenderNo" name="tenderNo" placeholder="Tender No" onChange={handleFilterChange} />
                    <label htmlFor="filterTenderNo">Tender No</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-floating">
                    <select className="form-select" id="filterDept" name="department" onChange={handleFilterChange}>
                      <option value="">All Departments</option>
                      <option value="IT Department">IT</option>
                      <option value="HR Department">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="PWD">PWD</option>
                    </select>
                    <label htmlFor="filterDept">Department</label>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-floating">
                    <select className="form-select" id="filterCategory" name="tenderCategory" onChange={handleFilterChange}>
                      <option value="">All Categories</option>
                      <option value="Goods">Goods</option>
                      <option value="Works">Works</option>
                      <option value="Services">Services</option>
                    </select>
                    <label htmlFor="filterCategory">Category</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">Results <span className="badge bg-primary ms-2">{filteredTenders.length}</span></h6>
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
                        <th>Tender No</th>
                        <th>Title</th>
                        <th>Department</th>
                        <th>Publish Date</th>
                        <th>Bid End Date</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTenders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-5 text-muted-soft">
                            <i className="bi bi-inbox fs-3 d-block mb-2" />No tenders found
                          </td>
                        </tr>
                      ) : (
                        filteredTenders.map((tender) => {
                          const status = getBiddingStatus(tender);
                          return (
                            <tr key={tender.tenderId}>
                              <td className="fw-semibold text-primary">{tender.tenderNo}</td>
                              <td>{tender.tenderTitle}</td>
                              <td>{tender.department}</td>
                              <td>{formatDate(tender.publishDate)}</td>
                              <td>{formatDate(tender.bidEndDate)}</td>
                              <td>{tender.tenderCategory || "Goods"}</td>
                              <td><span className={`badge ${status.class}`}>{status.text}</span></td>
                              <td className="text-center">
                                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleViewDetails(tender)}>
                                  <i className="bi bi-eye me-1" />View
                                </button>
                                <button
                                  className="btn btn-sm btn-primary"
                                  disabled={status.text !== "Open"}
                                  onClick={() => handleParticipate(tender.tenderId)}
                                >
                                  <i className="bi bi-send me-1" />Bid
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchTender;