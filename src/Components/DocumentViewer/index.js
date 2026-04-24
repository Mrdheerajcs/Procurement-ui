import React, { useEffect, useState } from "react";
import apiClient from "../../auth/apiClient";

const DocumentViewer = ({ filePath, fileName, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!filePath) return;

    const loadFile = async () => {
      try {
        setLoading(true);

        const blob = await apiClient.get("/api/files/view", {
          params: { path: filePath },
          responseType: "blob"
        });

        const url = window.URL.createObjectURL(blob);
        setBlobUrl(url);

      } catch (err) {
        console.error("View error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFile();

    return () => {
      if (blobUrl) window.URL.revokeObjectURL(blobUrl);
    };
  }, [filePath]);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        <div style={styles.header}>
          <h5 style={{ margin: 0 }}>{fileName}</h5>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={styles.body}>

          {loading && <p>Loading...</p>}

          {!loading && blobUrl && (
            fileName?.toLowerCase().includes(".pdf") ? (
              <iframe
                src={blobUrl}
                style={styles.frame}
                title="viewer"
              />
            ) : (
              <img src={blobUrl} alt={fileName} style={styles.image} />
            )
          )}

        </div>

      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },

  modal: {
    width: "85%",
    height: "90%",
    background: "#fff",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },

  header: {
    padding: "10px 15px",
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #ddd",
    alignItems: "center"
  },

  closeBtn: {
    fontSize: "22px",
    border: "none",
    background: "transparent",
    cursor: "pointer"
  },

  body: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  frame: {
    width: "100%",
    height: "100%",
    border: "none"
  },

  image: {
    maxWidth: "100%",
    maxHeight: "100%"
  }
};

export default DocumentViewer;