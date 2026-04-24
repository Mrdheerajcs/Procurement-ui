import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";
import DocumentViewer from "../../../Components/DocumentViewer";


const CommercialEvaluation = () => {
  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [financialBids, setFinancialBids] = useState([]);
  const [l1Vendor, setL1Vendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [awardedVendor, setAwardedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allEvaluated, setAllEvaluated] = useState(false);
  const [financialRevealed, setFinancialRevealed] = useState(false);
  const [hasActiveBids, setHasActiveBids] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [viewerDoc, setViewerDoc] = useState(null);


  useEffect(() => {
    fetchTenders();
  }, []);


  const getFileNameFromPath = (path) => {
    if (!path) return "";
    return path.split(/[/\\]/).pop();
  };

  const getSafeFilePath = (doc) => {
    if (!doc) return "";
    if (typeof doc === "string") return doc;
    return doc.filePath || "";
  };

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/tenders/all");
      if (res.status === "SUCCESS") {
        setTenders(res.data);
      }
    } catch (err) {
      console.error("Error fetching tenders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialBids = async (tenderId) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/bids/financial/tender/${tenderId}`);
      if (res.status === "SUCCESS") {
        setFinancialBids(res.data);
        const revealed = res.data.some(bid => bid.totalCost > 0);
        setFinancialRevealed(revealed);
        setHasActiveBids(res.data.length > 0);
        if (revealed) {
          calculateL1(res.data);
        }
      }
    } catch (err) {
      console.error("Error fetching financial bids:", err);
      setFinancialBids([]);
      setHasActiveBids(false);
    } finally {
      setLoading(false);
    }
  };



  const checkEvaluationStatus = async (tenderId) => {
    try {
      const res = await apiClient.get(`/api/bids/technical/all-evaluated/${tenderId}`);
      if (res.status === "SUCCESS") {
        setAllEvaluated(res.data);
        return res.data;
      }
    } catch (err) {
      console.error("Error checking evaluation status:", err);
    }
    return false;
  };

  const calculateL1 = (bids) => {
    if (!bids.length) return;
    const sorted = [...bids].sort((a, b) => (a.totalCost || 0) - (b.totalCost || 0));
    setL1Vendor(sorted[0]);
  };

  const handleSelectTender = async (tender) => {
    setSelectedTender(tender);
    setAwardedVendor(null);
    setFinancialRevealed(false);

    // First check if all vendors are evaluated
    const evaluated = await checkEvaluationStatus(tender.tenderId);
    if (!evaluated) {
      alert("Technical evaluation not complete yet. Please evaluate all vendors in Technical Evaluation page first.");
      return;
    }

    // ✅ Also check if financial bids exist
    await fetchFinancialBids(tender.tenderId);

    // If no financial bids found, show message
    if (financialBids.length === 0) {
      alert("No financial bids found. Please reveal financial bids first.");
    }
  };

  const handleRevealFinancial = async () => {
    if (!window.confirm("Are you sure you want to reveal all financial bids? This action cannot be undone.")) return;

    setLoading(true);
    try {
      const res = await apiClient.post(`/api/bids/financial/reveal/${selectedTender.tenderId}`);
      if (res.status === "SUCCESS") {
        setFinancialRevealed(true);
        await fetchFinancialBids(selectedTender.tenderId);
        alert("Financial bids revealed successfully! L1 vendor calculated.");
      }
    } catch (err) {
      console.error("Error revealing financial bids:", err);
      alert("Failed to reveal financial bids");
    } finally {
      setLoading(false);
    }
  };

  const handleAwardContract = async (vendorId) => {
    if (!window.confirm(`Are you sure you want to award the contract to this vendor?`)) return;

    setLoading(true);
    try {
      const res = await apiClient.post(`/api/tenders/${selectedTender.tenderId}/award`, null, {
        params: { vendorId }
      });
      if (res.status === "SUCCESS") {
        setAwardedVendor(financialBids.find(b => b.vendorId === vendorId));
        alert("Contract awarded successfully!");
      }
    } catch (err) {
      console.error("Error awarding contract:", err);
      alert("Failed to award contract");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "₹ 0";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const filteredTenders = tenders.filter(t =>
    t.tenderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tenderTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="page-title">Commercial Evaluation</h1>
        <p className="text-muted-soft">Compare vendor prices, calculate L1, and award contracts</p>
      </div>

      {!selectedTender ? (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">Tenders Ready for Commercial Evaluation</h6>
            <div className="input-group" style={{ maxWidth: "300px" }}>
              <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
              <input type="search" className="form-control" placeholder="Search tenders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Tender No</th><th>Title</th><th>Department</th><th className="text-center">Action</th></tr>
                </thead>
                <tbody>
                  {filteredTenders.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-5 text-muted-soft">No tenders found</td></tr>
                  ) : (
                    filteredTenders.map(t => (
                      <tr key={t.tenderId}>
                        <td className="fw-semibold text-primary">{t.tenderNo}</td>
                        <td>{t.tenderTitle}</td>
                        <td>{t.department || "-"}</td>
                        <td className="text-center">
                          <button className="btn btn-sm btn-primary" onClick={() => handleSelectTender(t)}>
                            <i className="bi bi-calculator me-1" />Evaluate
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => setSelectedTender(null)}>
            <i className="bi bi-arrow-left me-2" />Back to Tenders
          </button>

          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">{selectedTender.tenderNo} - {selectedTender.tenderTitle}</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <small className="text-muted">Department</small>
                  <div>{selectedTender.department || "-"}</div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted">Total Bids</small>
                  <div>{financialBids.length}</div>
                </div>
                {l1Vendor && financialRevealed && (
                  <div className="col-md-6">
                    <small className="text-muted">L1 Vendor</small>
                    <div><span className="fw-bold text-success">{l1Vendor.vendorName}</span> @ {formatCurrency(l1Vendor.totalCost)}</div>
                  </div>
                )}
              </div>
              {!financialRevealed && allEvaluated && (
                <div className="mt-3">
                  <button className="btn btn-warning" onClick={handleRevealFinancial} disabled={loading}>
                    <i className="bi bi-eye me-1" />Reveal Financial Bids
                  </button>
                  <small className="text-muted ms-2">Click to reveal all vendor prices</small>
                </div>
              )}
              {!allEvaluated && (
                <div className="alert alert-info mt-3 mb-0">
                  <i className="bi bi-info-circle me-2" />
                  Technical evaluation not complete yet. Please evaluate all vendors in Technical Evaluation page first.
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">Financial Bids Comparison</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Vendor Name</th>
                      <th>Total Bid Amount</th>
                      <th>GST %</th>
                      <th>Total Cost (incl. GST)</th>
                      <th>EMD Value</th>
                      <th>Rank</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialBids.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-5 text-muted-soft">
                        {allEvaluated ? "Click 'Reveal Financial Bids' to see prices" : "Complete technical evaluation first"}
                      </td></tr>
                    ) : (
                      [...financialBids].sort((a, b) => (a.totalCost || 0) - (b.totalCost || 0)).map((bid, idx) => {
                        const isL1 = idx === 0 && financialRevealed;
                        const isAwarded = awardedVendor?.vendorId === bid.vendorId;
                        return (
                          <tr key={bid.bidFinancialId} className={isL1 ? "table-success" : ""}>
                            <td className="fw-semibold">{bid.vendorName}</td>
                            <td>{formatCurrency(bid.totalBidAmount)}</td>
                            <td>{bid.gstPercent}%</td>
                            <td className="fw-bold">{formatCurrency(bid.totalCost)}</td>
                            <td>{formatCurrency(bid.emdValue)}</td>
                            <td>{isL1 ? <span className="badge bg-success">🏆 L1</span> : `L${idx + 1}`}</td>
                            <td className="text-center">
                              <div className="d-flex gap-2 justify-content-center">

                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => {
                                    setSelectedBid(bid);
                                    setShowModal(true);
                                  }}
                                >
                                  <i className="bi bi-eye" /> View
                                </button>
                                {isL1 && !isAwarded && !awardedVendor && financialRevealed && (
                                  <button className="btn btn-sm btn-success" onClick={() => handleAwardContract(bid.vendorId)} disabled={loading}>
                                    <i className="bi bi-trophy me-1" />Award Contract
                                  </button>
                                )}
                                {isAwarded && <span className="badge bg-primary">✓ Awarded</span>}
                                {!financialRevealed && <span className="text-muted">Hidden</span>}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {financialBids.length === 0 && allEvaluated && !hasActiveBids && (
        <div className="alert alert-warning mt-3 mb-0">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          <strong>No qualified vendors available.</strong> All vendors have withdrawn or been disqualified.
        </div>
      )}

{showModal && selectedBid && (
  <div className="modal-overlay" style={{
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  }}>
    <div className="modal-container" style={{
      backgroundColor: "#fff",
      borderRadius: "12px",
      width: "850px",
      maxWidth: "95%",
      maxHeight: "90%",
      overflow: "auto"
    }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <h5 className="mb-0">
          Financial Bid - {selectedBid.vendorName}
        </h5>
        <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
      </div>

      {/* BODY */}
      <div className="p-3">

        {/* FINANCIAL DETAILS */}
        <h6 className="text-primary mb-2">Financial Details</h6>
        <table className="table table-sm table-bordered">
          <tbody>
            <tr><td width="40%"><strong>Total Bid</strong></td><td>{formatCurrency(selectedBid.totalBidAmount)}</td></tr>
            <tr><td><strong>GST %</strong></td><td>{selectedBid.gstPercent}%</td></tr>
            <tr><td><strong>Total Cost</strong></td><td>{formatCurrency(selectedBid.totalCost)}</td></tr>
            <tr><td><strong>Bank</strong></td><td>{selectedBid.bankName}</td></tr>
            <tr><td><strong>Account No</strong></td><td>{selectedBid.accountNumber}</td></tr>
            <tr><td><strong>IFSC</strong></td><td>{selectedBid.ifscCode}</td></tr>
            <tr><td><strong>EMD Value</strong></td><td>{formatCurrency(selectedBid.emdValue)}</td></tr>
          </tbody>
        </table>

        {/* DOCUMENTS */}
        <h6 className="text-primary mt-4 mb-2">Documents</h6>

        {/* BOQ */}
        <div className="mb-2">
          <strong>📄 BOQ File:</strong>
          {selectedBid.boqFilePath ? (
            <>
              <span className="ms-2">
                {getFileNameFromPath(selectedBid.boqFilePath)}
              </span>
              <button
                className="btn btn-sm btn-outline-primary ms-2"
                onClick={() =>
                  setViewerDoc({
                    filePath: selectedBid.boqFilePath,
                    fileName: getFileNameFromPath(selectedBid.boqFilePath)
                  })
                }
              >
                View
              </button>
            </>
          ) : <span className="text-muted ms-2">Not uploaded</span>}
        </div>

        {/* PRICE BREAKUP */}
        <div className="mb-2">
          <strong>📊 Price Breakup:</strong>
          {selectedBid.priceBreakupPath ? (
            <>
              <span className="ms-2">
                {getFileNameFromPath(selectedBid.priceBreakupPath)}
              </span>
              <button
                className="btn btn-sm btn-outline-primary ms-2"
                onClick={() =>
                  setViewerDoc({
                    filePath: selectedBid.priceBreakupPath,
                    fileName: getFileNameFromPath(selectedBid.priceBreakupPath)
                  })
                }
              >
                View
              </button>
            </>
          ) : <span className="text-muted ms-2">Not uploaded</span>}
        </div>

        {/* EMD */}
        <div className="mb-2">
          <strong>💰 EMD Receipt:</strong>
          {selectedBid.emdReceiptPath ? (
            <>
              <span className="ms-2">
                {getFileNameFromPath(selectedBid.emdReceiptPath)}
              </span>
              <button
                className="btn btn-sm btn-outline-primary ms-2"
                onClick={() =>
                  setViewerDoc({
                    filePath: selectedBid.emdReceiptPath,
                    fileName: getFileNameFromPath(selectedBid.emdReceiptPath)
                  })
                }
              >
                View
              </button>
            </>
          ) : <span className="text-muted ms-2">Not uploaded</span>}
        </div>

        {/* OTHER DOCS */}
        <div className="mb-2">
          <strong>📎 Other Documents:</strong>
          {selectedBid.otherFinancialDocsPath ? (
            selectedBid.otherFinancialDocsPath.split(",").map((doc, idx) => (
              <div key={idx}>
                <span>{getFileNameFromPath(doc)}</span>
                <button
                  className="btn btn-sm btn-outline-primary ms-2"
                  onClick={() =>
                    setViewerDoc({
                      filePath: doc,
                      fileName: getFileNameFromPath(doc)
                    })
                  }
                >
                  View
                </button>
              </div>
            ))
          ) : <span className="text-muted ms-2">None</span>}
        </div>

      </div>

      {/* FOOTER */}
      <div className="p-3 border-top text-end">
        <button
          className="btn btn-secondary"
          onClick={() => setShowModal(false)}
        >
          Close
        </button>
      </div>

    </div>

    {/* DOCUMENT VIEWER */}
    {viewerDoc && (
      <DocumentViewer
        filePath={viewerDoc.filePath}
        fileName={viewerDoc.fileName}
        onClose={() => setViewerDoc(null)}
      />
    )}
  </div>
)}

    </div>
  );
};

export default CommercialEvaluation;