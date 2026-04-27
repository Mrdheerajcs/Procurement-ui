import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";
import { useNavigate } from "react-router-dom";
import DocumentViewer from "../../../Components/DocumentViewer";

const TenderResults = () => {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewerDoc, setViewerDoc] = useState(null);

  useEffect(() => {
    fetchParticipatedTenders();
  }, []);

  const fetchParticipatedTenders = async () => {
    setLoading(true);
    try {
      // Get all tenders where vendor participated
      const res = await apiClient.get("/api/bids/my-bids");
      if (res.status === "SUCCESS") {
        // Get unique tenders
        const uniqueTenders = [];
        const tenderMap = new Map();
        for (const bid of res.data) {
          if (!tenderMap.has(bid.tenderId)) {
            tenderMap.set(bid.tenderId, {
              tenderId: bid.tenderId,
              tenderNo: bid.tenderNo,
              tenderTitle: bid.tenderTitle,
              status: bid.evaluationStatus
            });
            uniqueTenders.push({
              tenderId: bid.tenderId,
              tenderNo: bid.tenderNo,
              tenderTitle: bid.tenderTitle,
              status: bid.evaluationStatus
            });
          }
        }
        setTenders(uniqueTenders);
      }
    } catch (err) {
      console.error("Error fetching tenders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenderResults = async (tenderId) => {
    setLoading(true);
    try {
      // Get L1/L2 ranking
      const l1Res = await apiClient.get(`/api/bids/l1/${tenderId}`);
      // Get vendor's own bid
      const myBidRes = await apiClient.get(`/api/bids/my-bids`);
      const myBid = myBidRes.data?.find(b => b.tenderId === tenderId);
      // Get all bids for comparison
      const allBidsRes = await apiClient.get(`/api/bids/financial/tender/${tenderId}`);
      
      setResults({
        l1Vendors: l1Res.data || [],
        myBid: myBid || null,
        allBids: allBidsRes.data || [],
        isCompleted: l1Res.data?.length > 0
      });
    } catch (err) {
      console.error("Error fetching results:", err);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = async (tender) => {
    setSelectedTender(tender);
    await fetchTenderResults(tender.tenderId);
  };

  const handleBack = () => {
    setSelectedTender(null);
    setResults(null);
  };

  const viewBidDocument = (filePath, fileName) => {
    setViewerDoc({ filePath, fileName });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹ 0";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const getRankBadge = (index) => {
    if (index === 0) return <span className="badge bg-success">🏆 L1 Winner</span>;
    if (index === 1) return <span className="badge bg-info">L2</span>;
    if (index === 2) return <span className="badge bg-secondary">L3</span>;
    return <span className="badge bg-secondary">L{index + 1}</span>;
  };

  const filteredTenders = tenders.filter(t =>
    t.tenderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tenderTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Tender Results</h1>
        <p className="text-muted-soft">View complete tender results, ranks, and your bid history</p>
      </div>

      {!selectedTender ? (
        // Tenders List
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">Tenders You Participated In</h6>
            <div className="input-group" style={{ maxWidth: "300px" }}>
              <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
              <input type="search" className="form-control" placeholder="Search tenders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr><th>Tender No</th><th>Title</th><th>Status</th><th className="text-center">Action</th></tr>
                  </thead>
                  <tbody>
                    {filteredTenders.length === 0 ? (
                      <td><td colSpan={4} className="text-center py-5">No tenders found</td></td>
                    ) : (
                      filteredTenders.map((tender) => (
                        <tr key={tender.tenderId}>
                          <td className="fw-semibold text-primary">{tender.tenderNo}</td>
                          <td>{tender.tenderTitle}</td>
                          <td>{tender.status === "QUALIFIED" ? <span className="badge bg-success">Qualified</span> : 
                               tender.status === "DISQUALIFIED" ? <span className="badge bg-danger">Disqualified</span> :
                               <span className="badge bg-secondary">{tender.status}</span>}</td>
                          <td className="text-center">
                            <button className="btn btn-sm btn-primary" onClick={() => handleViewResults(tender)}>
                              <i className="bi bi-trophy me-1" />View Results
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Results View
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-4" onClick={handleBack}>
            <i className="bi bi-arrow-left me-2" />Back to Tenders
          </button>

          {/* Tender Info */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">{selectedTender.tenderNo} - {selectedTender.tenderTitle}</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted">Your Status</small>
                  <div className="fw-bold">
                    {results?.myBid?.evaluationStatus === "QUALIFIED" ? 
                      <span className="text-success">✓ Qualified for Financial Round</span> :
                      results?.myBid?.evaluationStatus === "DISQUALIFIED" ?
                      <span className="text-danger">✗ Disqualified</span> :
                      <span className="text-warning">{results?.myBid?.evaluationStatus || "Submitted"}</span>
                    }
                  </div>
                </div>
                <div className="col-md-6">
                  <small className="text-muted">Tender Status</small>
                  <div>{results?.isCompleted ? "Completed - Awarded" : "Evaluation in Progress"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* L1/L2/L3 Ranking */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold"><i className="bi bi-trophy-fill me-2 text-warning" />Final Rankings</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Rank</th>
                      <th>Vendor Name</th>
                      <th>Total Bid Amount</th>
                      <th>Total Cost (incl. GST)</th>
                      <th>Winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!results?.l1Vendors || results.l1Vendors.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-5">Results not yet published. Please check later.</td></tr>
                    ) : (
                      results.l1Vendors.map((vendor, idx) => (
                        <tr key={idx} className={idx === 0 ? "table-success" : ""}>
                          <td>{getRankBadge(idx)}</td>
                          <td><strong>{vendor.vendorName}</strong> {vendor.vendorId === results.myBid?.vendorId && <span className="badge bg-info ms-2">You</span>}</td>
                          <td>{formatCurrency(vendor.totalBidAmount)}</td>
                          <td>{formatCurrency(vendor.totalCost)}</td>
                          <td>{idx === 0 ? <span className="badge bg-success">✓ Winner</span> : "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Your Bid Details */}
          {results?.myBid && (
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0 fw-semibold"><i className="bi bi-file-text-fill me-2" />Your Bid Details</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-primary">Technical Details</h6>
                    <table className="table table-sm table-borderless">
                      <tbody>
                        <tr><td className="text-muted">Company Name:</td><td className="fw-semibold">{results.myBid.companyName}</td></tr>
                        <tr><td className="text-muted">GST Number:</td><td>{results.myBid.gstNumber}</td></tr>
                        <tr><td className="text-muted">PAN Number:</td><td>{results.myBid.panNumber}</td></tr>
                        <tr><td className="text-muted">Make in India Class:</td><td>{results.myBid.makeIndiaClass}</td></tr>
                        <tr><td className="text-muted">Bidder Turnover:</td><td>{formatCurrency(results.myBid.bidderTurnover)}</td></tr>
                        <tr><td className="text-muted">OEM Name:</td><td>{results.myBid.oemName}</td></tr>
                        <tr><td className="text-muted">OEM Turnover:</td><td>{formatCurrency(results.myBid.oemTurnover)}</td></tr>
                        <tr><td className="text-muted">Evaluation Status:</td><td>{getStatusBadge(results.myBid.evaluationStatus)}</td></tr>
                        {results.myBid.evaluationScore && <tr><td className="text-muted">Technical Score:</td><td>{results.myBid.evaluationScore}/100</td></tr>}
                        {results.myBid.evaluationRemarks && <tr><td className="text-muted">Remarks:</td><td>{results.myBid.evaluationRemarks}</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-primary">Financial Details</h6>
                    <table className="table table-sm table-borderless">
                      <tbody>
                        <tr><td className="text-muted">Total Bid Amount:</td><td className="fw-semibold">{formatCurrency(results.myBid.totalBidAmount)}</td></tr>
                        <tr><td className="text-muted">GST %:</td><td>{results.myBid.gstPercent}%</td></tr>
                        <tr><td className="text-muted">Total Cost:</td><td>{formatCurrency(results.myBid.totalCost)}</td></tr>
                        <tr><td className="text-muted">Bank Name:</td><td>{results.myBid.bankName}</td></tr>
                        <tr><td className="text-muted">EMD Number:</td><td>{results.myBid.emdNumber || "-"}</td></tr>
                        <tr><td className="text-muted">EMD Value:</td><td>{formatCurrency(results.myBid.emdValue)}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Documents */}
          {results?.myBid && (
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0 fw-semibold"><i className="bi bi-paperclip me-2" />Your Uploaded Documents</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-primary">Technical Documents</h6>
                    {results.myBid.experienceCertPath && (
                      <div className="mb-2"><strong>Experience Certificate:</strong> <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => viewBidDocument(results.myBid.experienceCertPath, "Experience Certificate")}>View</button></div>
                    )}
                    {results.myBid.oemAuthPath && (
                      <div className="mb-2"><strong>OEM Authorization:</strong> <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => viewBidDocument(results.myBid.oemAuthPath, "OEM Authorization")}>View</button></div>
                    )}
                    {results.myBid.gstCertPath && (
                      <div className="mb-2"><strong>GST Certificate:</strong> <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => viewBidDocument(results.myBid.gstCertPath, "GST Certificate")}>View</button></div>
                    )}
                    {results.myBid.panCardPath && (
                      <div className="mb-2"><strong>PAN Card:</strong> <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => viewBidDocument(results.myBid.panCardPath, "PAN Card")}>View</button></div>
                    )}
                    {results.myBid.msmeCertPath && (
                      <div className="mb-2"><strong>MSME Certificate:</strong> <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => viewBidDocument(results.myBid.msmeCertPath, "MSME Certificate")}>View</button></div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-primary">Financial Documents</h6>
                    {results.myBid.boqFilePath && (
                      <div className="mb-2"><strong>BOQ File:</strong> <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => viewBidDocument(results.myBid.boqFilePath, "BOQ File")}>View</button></div>
                    )}
                    {results.myBid.priceBreakupPath && (
                      <div className="mb-2"><strong>Price Breakup:</strong> <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => viewBidDocument(results.myBid.priceBreakupPath, "Price Breakup")}>View</button></div>
                    )}
                    {results.myBid.emdReceiptPath && (
                      <div className="mb-2"><strong>EMD Receipt:</strong> <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => viewBidDocument(results.myBid.emdReceiptPath, "EMD Receipt")}>View</button></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Viewer Modal */}
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

const getStatusBadge = (status) => {
  switch(status) {
    case "QUALIFIED": return <span className="badge bg-success">✓ Qualified</span>;
    case "DISQUALIFIED": return <span className="badge bg-danger">✗ Disqualified</span>;
    default: return <span className="badge bg-secondary">{status}</span>;
  }
};

export default TenderResults;