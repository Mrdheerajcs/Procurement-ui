import React, { useEffect, useState } from "react";

const MessagePopup = ({ type = "info", message, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose && onClose(), 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const config = {
    success: {
      bg: "#28a745",
      icon: "✔",
    },
    error: {
      bg: "#dc3545",
      icon: "✖",
    },
    warning: {
      bg: "#ffc107",
      icon: "⚠",
    },
    info: {
      bg: "#17a2b8",
      icon: "ℹ",
    },
  };

  const { bg, icon } = config[type] || config.info;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        transform: show ? "translateX(0)" : "translateX(120%)",
        transition: "all 0.4s ease",
      }}
    >
      <div
        style={{
          background: bg,
          color: "#fff",
          padding: "12px 18px",
          borderRadius: "8px",
          minWidth: "280px",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <span style={{ fontSize: "18px", marginRight: "10px" }}>
          {icon}
        </span>
        <span style={{ flex: 1 }}>{message}</span>

        <span
          style={{
            cursor: "pointer",
            marginLeft: "10px",
            fontWeight: "bold",
          }}
          onClick={() => {
            setShow(false);
            setTimeout(() => onClose && onClose(), 300);
          }}
        >
          ×
        </span>
      </div>
    </div>
  );
};

export default MessagePopup;