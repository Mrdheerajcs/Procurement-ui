import React, { useState } from "react";

const approvedVendors = [
  {
    id: 1,
    name: "ABC Pvt Ltd",
    price: 500000,
    gst: "22AAAAA0000A1Z5",
    docs: ["BOQ.pdf", "PriceBreakup.xlsx"],
  },
  {
    id: 2,
    name: "XYZ Ltd",
    price: 450000,
    gst: "33BBBBB1111B2Z6",
    docs: ["BOQ.pdf", "Quote.pdf"],
  },
  {
    id: 3,
    name: "BuildCorp",
    price: 470000,
    gst: "44CCCCC2222C3Z7",
    docs: ["Commercial.pdf"],
  },
];

export default function CommercialComparison() {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [l1Vendor, setL1Vendor] = useState(null);
  const [awardedVendor, setAwardedVendor] = useState(null);

  const calculateL1 = () => {
    const lowest = [...approvedVendors].sort((a, b) => a.price - b.price)[0];
    setL1Vendor(lowest);
  };

  return (
    <div className="container-fluid mt-3">

      {!selectedVendor ? (
        <>
          <div className="d-flex justify-content-between mb-3">
            <h5>Commercial Evaluation</h5>
            <div>
              <button className="btn btn-primary me-2" onClick={calculateL1}>
                Calculate L1
              </button>
              {awardedVendor && (
                <button className="btn btn-danger" onClick={() => setAwardedVendor(null)}>
                  Abort Contract
                </button>
              )}
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Vendor Name</th>
                    <th>GST No</th>
                    <th>Quoted Price</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {approvedVendors.map((vendor) => (
                    <tr key={vendor.id}>
                      <td>{vendor.name}</td>
                      <td>{vendor.gst}</td>
                      <td>₹ {vendor.price.toLocaleString()}</td>
                      <td>
                        {awardedVendor?.id === vendor.id ? (
                          <span className="badge bg-primary">Awarded</span>
                        ) : l1Vendor?.id === vendor.id ? (
                          <span className="badge bg-success">L1</span>
                        ) : (
                          <span className="badge bg-secondary">Qualified</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-info" onClick={() => setSelectedVendor(vendor)}>
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card shadow">
          <div className="card-header fw-semibold">Vendor Commercial Detail</div>
          <div className="card-body">

            <div className="row mb-3">
              <div className="col-md-4"><b>Name:</b> {selectedVendor.name}</div>
              <div className="col-md-4"><b>GST:</b> {selectedVendor.gst}</div>
              <div className="col-md-4"><b>Price:</b> ₹ {selectedVendor.price.toLocaleString()}</div>
            </div>

            <h6>Commercial Documents</h6>
            <ul>
              {selectedVendor.docs.map((doc, i) => (
                <li key={i} className="text-primary">{doc}</li>
              ))}
            </ul>

            {l1Vendor?.id === selectedVendor.id && (
              <button className="btn btn-success" onClick={() => setAwardedVendor(selectedVendor)}>
                Award Contract (L1)
              </button>
            )}

            <button className="btn btn-secondary ms-2" onClick={() => setSelectedVendor(null)}>
              Back
            </button>

          </div>
        </div>
      )}
    </div>
  );
}