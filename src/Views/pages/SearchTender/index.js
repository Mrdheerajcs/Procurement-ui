import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";
import { useNavigate } from "react-router-dom";
import DocumentViewer from "../../../Components/DocumentViewer";

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
  const [viewerDoc, setViewerDoc] = useState(null);
  const [selectedTender, setSelectedTender] = useState(null);
  const [loading, setLoading] = useState(false);
  const [participatedTenders, setParticipatedTenders] = useState({});

  // ✅ NEW: For documents in details modal
  const [tenderDocuments, setTenderDocuments] = useState([]);
  const [fetchingDocs, setFetchingDocs] = useState(false);

  useEffect(() => {
    fetchPublishedTenders();
  }, []);

  const checkParticipation = async (tenderId) => {
    try {
      const res = await apiClient.get(`/api/bids/check-participation/${tenderId}`);
      if (res.status === "SUCCESS") {
        setParticipatedTenders(prev => ({
          ...prev,
          [tenderId]: res.data
        }));
      }
    } catch (err) {
      console.error("Error checking participation:", err);
    }
  };

  useEffect(() => {
    if (filteredTenders.length > 0) {
      filteredTenders.forEach(tender => {
        checkParticipation(tender.tenderId);
      });
    }
  }, [filteredTenders]);

  const handleView = (doc) => {
  setViewerDoc({
    filePath: doc.filePath,
    fileName: doc.fileName,
  });
};

const handleDownload = async (filePath, fileName) => {
  try {
    const blob = await apiClient.get("/api/files/download", {
      params: { path: filePath },
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "file";
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("Download failed:", err);
    alert(err.message || "Download failed");
  }
};

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

  // ✅ NEW: Fetch tender documents
  const fetchTenderDocuments = async (tenderId) => {
    setFetchingDocs(true);
    try {
      const res = await apiClient.get(`/api/tenders/${tenderId}/documents`);
      if (res.status === "SUCCESS") {
        setTenderDocuments(res.data || []);
      } else {
        setTenderDocuments([]);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setTenderDocuments([]);
    } finally {
      setFetchingDocs(false);
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

  const handleViewDetails = async (tender) => {
    setSelectedTender(tender);
    await fetchTenderDocuments(tender.tenderId);
  };

  const handleParticipate = (tenderId) => {
    navigate(`/bid-submission/${tenderId}`);
  };

  const handleBack = () => {
    setSelectedTender(null);
    setTenderDocuments([]);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹ 0";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
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

  // ✅ Helper to get document icon
  const getFileIcon = (fileName) => {
    if (fileName?.toLowerCase().includes('.pdf')) return <i className="bi bi-file-pdf-fill text-danger" />;
    if (fileName?.toLowerCase().includes('.xlsx') || fileName?.toLowerCase().includes('.xls')) return <i className="bi bi-file-excel-fill text-success" />;
    if (fileName?.toLowerCase().includes('.doc') || fileName?.toLowerCase().includes('.docx')) return <i className="bi bi-file-word-fill text-primary" />;
    if (fileName?.toLowerCase().includes('.jpg') || fileName?.toLowerCase().includes('.png') || fileName?.toLowerCase().includes('.jpeg')) return <i className="bi bi-file-image-fill text-info" />;
    return <i className="bi bi-file-earmark-fill" />;
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Search Tender</h1>
        <p className="text-muted-soft">Find and participate in published tenders</p>
      </div>

      {selectedTender ? (
        // TENDER DETAILS VIEW - ENHANCED
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-4" onClick={handleBack}>
            <i className="bi bi-arrow-left me-2" />Back to Results
          </button>

          {/* Basic Info Card */}
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
                {/* <div className="col-md-4">
                  <div className="text-muted-soft small mb-1">NIT Number</div>
                  <div className="fw-semibold">{selectedTender.nitNumber || "-"}</div>
                </div> */}
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
            </div>
          </div>

          {/* Financial Details Card */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h6 className="mb-0">Financial Details</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="text-muted-soft small mb-1">Estimated Value</div>
                  <div className="fw-semibold">{formatCurrency(selectedTender.estimatedValue)}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted-soft small mb-1">EMD Amount</div>
                  <div>{formatCurrency(selectedTender.emdAmount)}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted-soft small mb-1">Tender Fee</div>
                  <div>{formatCurrency(selectedTender.tenderFee)}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted-soft small mb-1">Bid Validity</div>
                  <div>{selectedTender.bidValidity || "30"} days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h6 className="mb-0">Tender Timeline</h6>
            </div>
            <div className="card-body">
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
                  <div className="text-muted-soft small mb-1">Bid Time</div>
                  <div>{selectedTender.bidSubmissionEndTime || "17:00"}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted-soft small mb-1">Pre-bid Meeting</div>
                  <div>{formatDate(selectedTender.preBidMeetingDate)}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted-soft small mb-1">Technical Opening</div>
                  <div>{formatDate(selectedTender.techBidOpenDate)}</div>
                </div>
                <div className="col-md-3">
                  <div className="text-muted-soft small mb-1">Financial Opening</div>
                  <div>{formatDate(selectedTender.finBidOpenDate)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bid Configuration Card */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h6 className="mb-0">Bid Configuration</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="text-muted-soft small mb-1">Bid Type</div>
                  <div>
                    <span className="badge bg-info">
                      {selectedTender.bidType || "Two Bid"}
                    </span>
                    <small className="text-muted ms-2">
                      {selectedTender.bidType === "Two Bid" ? "(Technical + Financial)" : "(Single Bid)"}
                    </small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted-soft small mb-1">BOQ Type</div>
                  <div>
                    <span className="badge bg-secondary">
                      {selectedTender.boqType || "Item Rate"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Card */}
          {selectedTender.tenderDescription && (
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h6 className="mb-0">Description</h6>
              </div>
              <div className="card-body">
                <p className="mb-0">{selectedTender.tenderDescription}</p>
              </div>
            </div>
          )}

          {/* Documents Card */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h6 className="mb-0">Tender Documents</h6>
            </div>

            <div className="card-body">
              {fetchingDocs ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" />
                  <span className="ms-2">Loading documents...</span>
                </div>
              ) : tenderDocuments.length === 0 ? (
                <p className="text-muted mb-0">No documents uploaded</p>
              ) : (
                <div className="list-group">
                  {tenderDocuments.map((doc) => {

                    // ✅ Use backend docCategory instead of filename
                    const categoryMap = {
                      NIT: "📄 NIT Document",
                      BOQ: "📊 BOQ Document",
                      TECH: "📐 Technical Document",
                      OTHER: "📎 Other Document"
                    };

                    const docType = categoryMap[doc.docCategory] || "📁 Document";

                    return (
                      <div
                        key={doc.documentId}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <strong>{docType}</strong>
                          <div className="text-muted small">{doc.fileName}</div>
                        </div>

<div className="d-flex gap-2">
  {/* VIEW */}
  <button
  className="btn btn-sm btn-outline-info"
  onClick={() =>
    setViewerDoc({
      filePath: doc.filePath,
      fileName: doc.fileName
    })
  }
>
  <i className="bi bi-eye" /> View
</button>

  {/* DOWNLOAD */}
  <button
  className="btn btn-sm btn-outline-primary"
  onClick={() => handleDownload(doc.filePath, doc.fileName)}
>
  <i className="bi bi-download" /> Download
</button>
</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="card">
            <div className="card-footer d-flex justify-content-between align-items-center">
              <span className={`badge ${getBiddingStatus(selectedTender).class} fs-6`}>
                {getBiddingStatus(selectedTender).text}
              </span>
              <button
                className="btn btn-primary"
                disabled={!isBiddingOpen(selectedTender) || participatedTenders[selectedTender.tenderId]}
                onClick={() => handleParticipate(selectedTender.tenderId)}
                title={participatedTenders[selectedTender.tenderId] ? "You have already submitted a bid for this tender" : ""}
              >
                <i className="bi bi-send me-2" />
                {participatedTenders[selectedTender.tenderId] ? "Already Participated" : "Participate in Bid"}
              </button>
            </div>
          </div>

          {viewerDoc && (
  <DocumentViewer
    filePath={viewerDoc.filePath}
    fileName={viewerDoc.fileName}
    onClose={() => setViewerDoc(null)}
  />
)}
        </div>
      ) : (
        // TENDER LIST VIEW
        <>
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
                                  <i className="bi bi-eye me-1" />View Details
                                </button>
                                <button
                                  className="btn btn-sm btn-primary"
                                  disabled={status.text !== "Open" || participatedTenders[tender.tenderId]}
                                  onClick={() => handleParticipate(tender.tenderId)}
                                  title={participatedTenders[tender.tenderId] ? "You have already submitted a bid for this tender" : ""}
                                >
                                  <i className="bi bi-send me-1" />
                                  {participatedTenders[tender.tenderId] ? "Already Participated" : "Bid"}
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