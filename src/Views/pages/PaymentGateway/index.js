import React, { useState, useEffect } from "react";
import apiClient from "../../../auth/apiClient";

const PaymentGateway = ({ tenderId, amount, paymentType, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      const scriptElement = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (scriptElement) scriptElement.remove();
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      alert("Payment system is loading. Please try again.");
      return;
    }

    setLoading(true);
    try {
      // Create order on backend
      const orderRes = await apiClient.post("/api/payments/create-order", {
        tenderId: tenderId,
        amount: amount,
        paymentType: paymentType || "TENDER_FEE",
        email: JSON.parse(localStorage.getItem("auth"))?.email || "",
        mobile: "",
        name: ""
      });

      if (orderRes.status !== "SUCCESS") {
        throw new Error(orderRes.message || "Failed to create order");
      }

      const order = orderRes.data;
      const auth = JSON.parse(localStorage.getItem("auth"));

      const options = {
        key: order.razorpayKeyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: "E-Procurement Portal",
        description: `${paymentType} Payment`,
        order_id: order.razorpayOrderId,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyRes = await apiClient.post("/api/payments/verify", null, {
              params: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              }
            });

            if (verifyRes.status === "SUCCESS") {
              alert("Payment successful!");
              if (onSuccess) onSuccess(response);
              if (onClose) onClose();
            } else {
              alert("Payment verification failed");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: auth?.username || "",
          email: auth?.email || "",
          contact: ""
        },
        theme: {
          color: "#0d6efd"
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error("Payment error:", err);
      alert(err.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div className="modal-container" style={{ backgroundColor: "white", borderRadius: "12px", width: "400px", maxWidth: "90%", padding: "24px", textAlign: "center" }}>
        <i className="bi bi-credit-card" style={{ fontSize: "48px", color: "#0d6efd" }} />
        <h4 className="mt-3">Payment Details</h4>
        <p className="text-muted">Amount: <strong>₹ {amount?.toLocaleString()}</strong></p>
        <p className="text-muted">Type: {paymentType?.replace("_", " ")}</p>
        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-secondary flex-grow-1" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary flex-grow-1" onClick={handlePayment} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;