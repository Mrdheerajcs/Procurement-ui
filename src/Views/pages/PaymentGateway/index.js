
import React, { useState, useEffect } from "react";

const PaymentGateway = () => {
  const [data, setData] = useState([
    { id: 1, orderId: "ORD-1001", amount: 5000, status: "PENDING" },
    { id: 2, orderId: "ORD-1002", amount: 8000, status: "PENDING" },
    { id: 3, orderId: "ORD-1003", amount: 15000, status: "PENDING" },
    { id: 4, orderId: "ORD-1004", amount: 10000, status: "PENDING" }
  ]);

  const [loadingId, setLoadingId] = useState(null);
  const [rzpLoaded, setRzpLoaded] = useState(false);

  // ✅ Razorpay Script Load
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      setRzpLoaded(true);
    };

    script.onerror = () => {
      alert("❌ Razorpay SDK load failed");
    };

    document.body.appendChild(script);
  }, []);

  // ✅ Payment Function
  const handlePayment = (item) => {
    if (!rzpLoaded) {
      alert("⏳ Payment system loading, try again...");
      return;
    }

    setLoadingId(item.id);

    try {
      const options = {
        key: "rzp_test_xxxxxxxx", 
        amount: item.amount * 100,
        currency: "INR",
        name: "E-Procurement Portal",
        description: `Order - ${item.orderId}`,

        handler: function () {
          const updated = data.map((d) =>
            d.id === item.id ? { ...d, status: "SUCCESS" } : d
          );
          setData(updated);

          alert("✅ Payment Successful!");
          setLoadingId(null);
        },

        modal: {
          ondismiss: function () {
            setLoadingId(null);
          }
        },

        prefill: {
          name: "Vendor Name",
          email: "vendor@email.com",
          contact: "9999999999"
        },

        theme: {
          color: "#0d6efd"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function () {
        alert("❌ Payment Failed!");
        setLoadingId(null);
      });

    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
      setLoadingId(null);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4">
        <h6 className="mb-3 text-left fw-semibold">Payment Gateway</h6>

        <table className="table table-hover text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>Order ID</th>
              <th>Amount</th>
              <th>Payment Status</th>
              <th>Pay Now</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.orderId}</td>

                <td className="fw-bold text-primary">
                  ₹ {item.amount.toLocaleString()}
                </td>

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
                    disabled={loadingId === item.id || item.status === "SUCCESS"}
                  >
                    {loadingId === item.id ? "Processing..." : "Pay Now"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentGateway;