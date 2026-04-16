import React, { useState } from "react";

const RateVendor = () => {
  const [data, setData] = useState([
    {
      id: 1,
      vendor: "ABC Constructions",
      tenderNo: "TN001",
      rating: 0,
      review: ""
    },
    {
      id: 2,
      vendor: "XYZ Infra",
      tenderNo: "TN002",
      rating: 0,
      review: ""
    },
    {
      id: 3,
      vendor: "BuildCorp",
      tenderNo: "TN003",
      rating: 0,
      review: ""
    }
  ]);

  
  const handleRating = (id, value) => {
    const updated = data.map((item) =>
      item.id === id ? { ...item, rating: value } : item
    );
    setData(updated);
  };

  
  const handleReview = (id, value) => {
    const updated = data.map((item) =>
      item.id === id ? { ...item, review: value } : item
    );
    setData(updated);
  };

  
  const handleSubmit = (id) => {
    const item = data.find((x) => x.id === id);
    alert(
      `Submitted!\nVendor: ${item.vendor}\nRating: ${item.rating}\nReview: ${item.review}`
    );
  };

  return (
    <div className="container mt-5">
      <div className="card p-3 shadow-sm">
        <h6 className="mb-3 fw-semibold">Rate Vendor</h6>

        <div className="table-responsive">
          <table className="table table-hover align-middle text-nowrap">
            <thead className="table-light">
              <tr>
                <th>Vendor Name</th>
                <th>Tender No</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.vendor}</td>
                  <td>{item.tenderNo}</td>

                  {/* ⭐ STAR RATING */}
                  <td>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        style={{
                          cursor: "pointer",
                          fontSize: "20px",
                          color: star <= item.rating ? "gold" : "#ccc"
                        }}
                        onClick={() => handleRating(item.id, star)}
                      >
                        ★
                      </span>
                    ))}
                  </td>

                  {/* 📝 REVIEW */}
                  <td>
                    <textarea
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Write feedback..."
                      value={item.review}
                      onChange={(e) =>
                        handleReview(item.id, e.target.value)
                      }
                    />
                  </td>

                  {/* SUBMIT */}
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSubmit(item.id)}
                    >
                      Submit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RateVendor;