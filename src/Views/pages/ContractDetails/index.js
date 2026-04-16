
import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

const ContractDetails = () => {
  const sigRef = useRef(null);

  const [data, setData] = useState([
    {
      id: 1,
      contractNo: "CNT-5001",
      tenderNo: "TN001",
      vendor: "ABC Constructions",
      awardDate: "01 Apr 2026",
      startDate: "05 Apr 2026",
      endDate: "05 Jul 2026",
      amount: 50000,
      status: "PENDING"
    },
    {
      id: 2,
      contractNo: "CNT-5002",
      tenderNo: "TN002",
      vendor: "XYZ Infra",
      awardDate: "03 Apr 2026",
      startDate: "07 Apr 2026",
      endDate: "10 Jul 2026",
      amount: 80000,
      status: "PENDING"
    },
    {
      id: 3,
      contractNo: "CNT-5003",
      tenderNo: "TN003",
      vendor: "BuildCorp",
      awardDate: "05 Apr 2026",
      startDate: "10 Apr 2026",
      endDate: "15 Jul 2026",
      amount: 120000,
      status: "PENDING"
    }
  ]);

  const [showPad, setShowPad] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleSign = (id) => {
    setSelectedId(id);
    setShowPad(true);
  };

  const saveSignature = () => {
    const image = sigRef.current.toDataURL();

    const updated = data.map((item) =>
      item.id === selectedId
        ? { ...item, signed: true, status: "SIGNED", signature: image }
        : item
    );

    setData(updated);
    setShowPad(false);
  };

  const clearSignature = () => {
    sigRef.current.clear();
  };

  const handleUpload = (e, id) => {
    const file = e.target.files[0];

    const updated = data.map((item) =>
      item.id === id ? { ...item, file: file } : item
    );

    setData(updated);
  };

  
  const handleDateChange = (id, field, value) => {
    const updated = data.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setData(updated);
  };

  const downloadPDF = (item) => {
    const content = `
      CONTRACT DETAILS

      Contract No: ${item.contractNo}
      Tender No: ${item.tenderNo}
      Vendor: ${item.vendor}

      Award Date: ${item.awardDate}
      Start Date: ${item.startDate}
      End Date: ${item.endDate}

      Amount: ₹ ${item.amount}
      Status: ${item.status}
    `;

    const blob = new Blob([content], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.contractNo}.pdf`;
    a.click();
  };

  return (
    <div className="container mt-5">
      <div className="card p-3">
        <h6 className="mb-3 fw-semibold">Contract Management</h6>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-nowrap">
            <thead className="table-light">
              <tr>
                <th>Contract No</th>
                <th>Tender No</th>
                <th>Vendor Name</th>
                <th>Award Date</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Sign</th>
                <th>Upload PBG</th>
                <th>Download</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.contractNo}</td>
                  <td>{item.tenderNo}</td>
                  <td>{item.vendor}</td>
                  <td>{item.awardDate}</td>

                  {/* 🔥 EDITABLE START DATE */}
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item.startDate}
                      onChange={(e) =>
                        handleDateChange(item.id, "startDate", e.target.value)
                      }
                    />
                  </td>

                  {/* 🔥 EDITABLE END DATE */}
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item.endDate}
                      onChange={(e) =>
                        handleDateChange(item.id, "endDate", e.target.value)
                      }
                    />
                  </td>

                  <td className="fw-bold text-primary">
                    ₹ {item.amount.toLocaleString()}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        item.status === "SIGNED"
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td>
                    {!item.signed ? (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleSign(item.id)}
                      >
                        Sign
                      </button>
                    ) : (
                      <img
                        src={item.signature}
                        alt="sign"
                        style={{ width: "100px" }}
                      />
                    )}
                  </td>

                  <td>
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      onChange={(e) => handleUpload(e, item.id)}
                    />
                  </td>

                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => downloadPDF(item)}
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data[0].file && (
          <div className="mt-3 alert alert-info">
            Uploaded File: {data[0].file.name}
          </div>
        )}
      </div>

      {showPad && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="bg-white p-3 rounded shadow text-center">
            <h6>Digital Signature</h6>

            <SignatureCanvas
              ref={sigRef}
              penColor="black"
              canvasProps={{
                width: 300,
                height: 150,
                className: "border"
              }}
            />

            <div className="mt-2">
              <button
                className="btn btn-danger btn-sm me-2"
                onClick={clearSignature}
              >
                Clear
              </button>

              <button
                className="btn btn-success btn-sm"
                onClick={saveSignature}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetails;