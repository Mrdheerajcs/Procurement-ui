import React, { useState } from "react";

const initialBidsList = [
  { id: 1, name: "Road Construction" },
  { id: 2, name: "Bridge Project" },
  { id: 3, name: "Building Renovation" },
];

export default function BidSubmissionFlow() {
  const [bidsList, setBidsList] = useState(initialBidsList);
  const [selectedBid, setSelectedBid] = useState(null);
  const [tab, setTab] = useState("technical");
  const [msme, setMsme] = useState(false);
  const [emdExemption, setEmdExemption] = useState(false);
  const [formData, setFormData] = useState({});
  const [previewStep, setPreviewStep] = useState(null); 

  const handleParticipate = (bid) => {
    setSelectedBid(bid);
    setTab("technical");
  };

  const handleBackToList = () => {
    setSelectedBid(null);
    setFormData({});
    setTab("technical");
    setMsme(false);
    setEmdExemption(false);
    setPreviewStep(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const isTechnicalValid = () => {
    const required = [
      "companyName", "gstNumber", "panNumber",
      "makeIndiaClass", "bidderTurnover", "oemTurnover",
      "oemName", "authorizationDetails"
    ];
    if (msme) required.push("msmeNumber");
    return required.every(f => formData[f] && formData[f].trim() !== "");
  };

  const isCommercialValid = () => {
    const required = ["totalBidAmount", "gstPercent", "totalCost", "bankName", "accountNumber", "ifscCode"];
    if (!emdExemption) required.push("emdNumber", "emdValue");
    else required.push("emdExemptionDetails");
    return required.every(f => formData[f] && formData[f].trim() !== "");
  };

  const handlePreview = (step) => setPreviewStep(step);

  const handleSubmit = () => {
    alert("Bid submitted successfully!");
    setBidsList(bidsList.filter(b => b.id !== selectedBid.id));
    handleBackToList();
  };

  return (
    <div className="container mt-3">
      {!selectedBid && (
        <>
          <h4>Available Bids</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Bid Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bidsList.map(bid => (
                <tr key={bid.id}>
                  <td>{bid.name}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleParticipate(bid)}>
                      Participate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {selectedBid && !previewStep && (
        <>
          <h4>{selectedBid.name} - Bid Submission</h4>
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button className={`nav-link ${tab === "technical" && "active"}`} onClick={() => setTab("technical")}>
                Technical
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${tab === "commercial" && "active"}`}
                disabled={!isTechnicalValid()}
                onClick={() => setTab("commercial")}
              >
                Commercial
              </button>
            </li>
          </ul>

          {/* Technical Form */}
          {tab === "technical" && (
            <div className="card p-3 shadow-sm mb-3">
              <h6>Company Credentials</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-4"><input name="companyName" value={formData.companyName || ""} onChange={handleChange} className="form-control" placeholder="Company Name" /></div>
                <div className="col-md-4"><input name="gstNumber" value={formData.gstNumber || ""} onChange={handleChange} className="form-control" placeholder="GST Number" /></div>
                <div className="col-md-4"><input name="panNumber" value={formData.panNumber || ""} onChange={handleChange} className="form-control" placeholder="PAN Number" /></div>
              </div>

              <h6>MSME</h6>
              <div className="form-check mb-2">
                <input type="checkbox" className="form-check-input" checked={msme} onChange={() => { setMsme(!msme); if(!msme) setFormData({...formData, msmeNumber:""}) }} />
                <label className="form-check-label">MSME Exempted</label>
              </div>
              {msme && <input name="msmeNumber" value={formData.msmeNumber || ""} onChange={handleChange} className="form-control mb-3" placeholder="MSME Number" />}

              <h6>Make in India</h6>
              <input name="makeIndiaClass" value={formData.makeIndiaClass || ""} onChange={handleChange} className="form-control mb-3" placeholder="Class (Class 1 / Class 2)" />

              <h6>Turnover</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-6"><input name="bidderTurnover" value={formData.bidderTurnover || ""} onChange={handleChange} className="form-control" placeholder="Bidder Turnover" /></div>
                <div className="col-md-6"><input name="oemTurnover" value={formData.oemTurnover || ""} onChange={handleChange} className="form-control" placeholder="OEM Turnover" /></div>
              </div>

              <h6>OEM Details</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-6"><input name="oemName" value={formData.oemName || ""} onChange={handleChange} className="form-control" placeholder="OEM Name" /></div>
                <div className="col-md-6"><input name="authorizationDetails" value={formData.authorizationDetails || ""} onChange={handleChange} className="form-control" placeholder="Authorization Details" /></div>
              </div>

              <div className="text-end">
                <button className="btn btn-info me-2" disabled={!isTechnicalValid()} onClick={() => handlePreview("technical")}>
                  Preview Technical
                </button>
                <button className="btn btn-success" disabled={!isTechnicalValid()} onClick={() => setTab("commercial")}>
                  Next → Commercial
                </button>
              </div>
            </div>
          )}

          {/* Commercial Form */}
          {tab === "commercial" && (
            <div className="card p-3 shadow-sm mb-3">
              <h6>Bid Amount</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-4"><input name="totalBidAmount" value={formData.totalBidAmount || ""} onChange={handleChange} className="form-control" placeholder="Total Bid Amount" /></div>
                <div className="col-md-4"><input name="gstPercent" value={formData.gstPercent || ""} onChange={handleChange} className="form-control" placeholder="GST %" /></div>
                <div className="col-md-4"><input name="totalCost" value={formData.totalCost || ""} onChange={handleChange} className="form-control" placeholder="Total Cost Including GST" /></div>
              </div>

              <h6>EMD</h6>
              <div className="form-check mb-2">
                <input type="checkbox" className="form-check-input" checked={emdExemption} onChange={() => setEmdExemption(!emdExemption)} />
                <label>EMD Exemption</label>
              </div>
              {!emdExemption ? (
                <div className="row g-3 mb-3">
                  <div className="col-md-6"><input name="emdNumber" value={formData.emdNumber || ""} onChange={handleChange} className="form-control" placeholder="EMD Number" /></div>
                  <div className="col-md-6"><input name="emdValue" value={formData.emdValue || ""} onChange={handleChange} className="form-control" placeholder="EMD Value" /></div>
                </div>
              ) : (
                <input name="emdExemptionDetails" value={formData.emdExemptionDetails || ""} onChange={handleChange} className="form-control mb-3" placeholder="Exemption Details" />
              )}

              <h6>Bank Details</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-4"><input name="bankName" value={formData.bankName || ""} onChange={handleChange} className="form-control" placeholder="Bank Name" /></div>
                <div className="col-md-4"><input name="accountNumber" value={formData.accountNumber || ""} onChange={handleChange} className="form-control" placeholder="Account Number" /></div>
                <div className="col-md-4"><input name="ifscCode" value={formData.ifscCode || ""} onChange={handleChange} className="form-control" placeholder="IFSC Code" /></div>
              </div>

              <div className="d-flex justify-content-between">
                <button className="btn btn-secondary" onClick={() => setTab("technical")}>← Back</button>
                <button className="btn btn-primary" disabled={!isCommercialValid()} onClick={() => handlePreview("commercial")}>Preview Commercial</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* PREVIEW */}
      {previewStep && (
        <div className="card p-3 shadow-sm">
          <h4>{previewStep === "technical" ? "Technical Preview" : "Final Preview"}</h4>
          {previewStep === "technical" && (
            <pre>{JSON.stringify({
              companyName: formData.companyName,
              gstNumber: formData.gstNumber,
              panNumber: formData.panNumber,
              msme: msme ? formData.msmeNumber : "N/A",
              makeIndiaClass: formData.makeIndiaClass,
              bidderTurnover: formData.bidderTurnover,
              oemTurnover: formData.oemTurnover,
              oemName: formData.oemName,
              authorizationDetails: formData.authorizationDetails
            }, null, 2)}</pre>
          )}
          {previewStep === "commercial" && (
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          )}
          <div className="d-flex justify-content-between mt-3">
            <button className="btn btn-secondary" onClick={() => setPreviewStep(null)}>← Back</button>
            {previewStep === "technical" && <button className="btn btn-success" onClick={() => setTab("commercial")}>Next → Commercial</button>}
            {previewStep === "commercial" && <button className="btn btn-success" onClick={handleSubmit}>Submit Bid</button>}
          </div>
        </div>
      )}
    </div>
  );
}