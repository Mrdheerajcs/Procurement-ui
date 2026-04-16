
import React, { useState } from "react";

const TenderPayment = () => {
  const [data, setData] = useState([
    { id: 1, no: "TN001", title: "Road Work", amount: 5000, status: "PENDING" },
    { id: 2, no: "TN002", title: "Bridge Project", amount: 8000, status: "PENDING" },
    { id: 3, no: "TN003", title: "Building Work", amount: 12000, status: "PENDING" },
    { id: 4, no: "TN004", title: "Highway Repair", amount: 7000, status: "PENDING" },
    { id: 5, no: "TN005", title: "Metro Work", amount: 15000, status: "PENDING" },
    { id: 6, no: "TN006", title: "Pipeline Setup", amount: 6000, status: "PENDING" },
    { id: 7, no: "TN007", title: "Electric Grid", amount: 9000, status: "PENDING" },
    { id: 8, no: "TN008", title: "Water Supply", amount: 4000, status: "PENDING" },
    { id: 9, no: "TN009", title: "School Building", amount: 11000, status: "PENDING" },
    { id: 10, no: "TN010", title: "Hospital Project", amount: 20000, status: "PENDING" }
  ]);

  const [selected, setSelected] = useState(null);

  const handlePayment = (item) => {
    setSelected(item);
  };

  const confirmPayment = () => {
    const updated = data.map((item) =>
      item.id === selected.id ? { ...item, status: "SUCCESS" } : item
    );
    setData(updated);
    setSelected(null);
  };

  return (
    <div className="container mt-5">
      <div className="card p-3">
        <h6 className="text-left mb-3 fw-semibold">Tender Payment List</h6>

       <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Tender No</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Pay</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.no}</td>
                <td>{item.title}</td>
                <td>₹ {item.amount}</td>

                <td>
                  <span
                    className={`badge ${
                      item.status === "SUCCESS"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handlePayment(item)}
                    disabled={item.status === "SUCCESS"}
                  >
                    Pay Now
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      {selected && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="bg-white p-4 rounded shadow text-center" style={{ width: "300px" }}>
            <h5 className="mb-3">UPI Payment</h5>

            <p><strong>{selected.title}</strong></p>
            <p>Amount: ₹ {selected.amount}</p>

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Enter UPI ID"
            />

            <button className="btn btn-success w-100 mb-2" onClick={confirmPayment}>
              Pay ₹ {selected.amount}
            </button>

            <button className="btn btn-secondary w-100" onClick={() => setSelected(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderPayment;