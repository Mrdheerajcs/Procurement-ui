import React, { useEffect, useState } from "react";
import apiClient from "../../auth/apiClient";

const DocumentViewer = ({ filePath, fileName, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState("unknown");

  useEffect(() => {
    if (!filePath) {
      setError("No file path provided");
      setLoading(false);
      return;
    }

    const detectFileType = (path, name) => {
      const lowerPath = (path + "").toLowerCase();
      const lowerName = (name + "").toLowerCase();
      
      if (lowerPath.includes(".pdf") || lowerName.includes(".pdf")) return "pdf";
      if (lowerPath.includes(".jpg") || lowerPath.includes(".jpeg") || lowerName.includes(".jpg")) return "image";
      if (lowerPath.includes(".png") || lowerName.includes(".png")) return "image";
      if (lowerPath.includes(".gif") || lowerName.includes(".gif")) return "image";
      if (lowerPath.includes(".doc") || lowerName.includes(".doc")) return "word";
      if (lowerPath.includes(".docx") || lowerName.includes(".docx")) return "word";
      if (lowerPath.includes(".xls") || lowerName.includes(".xls")) return "excel";
      if (lowerPath.includes(".xlsx") || lowerName.includes(".xlsx")) return "excel";
      return "pdf"; // default assume PDF
    };

    const loadFile = async () => {
      try {
        setLoading(true);
        setError(null);

        const detectedType = detectFileType(filePath, fileName);
        setFileType(detectedType);
        
        console.log("DocumentViewer - File:", fileName);
        console.log("DocumentViewer - Path:", filePath);
        console.log("DocumentViewer - Type:", detectedType);

        // Clean the file path (remove quotes if any)
        const cleanPath = filePath.replace(/^["']|["']$/g, '').trim();

        // For images, we can use direct URL
        if (detectedType === "image") {
          const auth = JSON.parse(localStorage.getItem("auth"));
          const token = auth?.token;
          const tokenType = auth?.tokenType || "Bearer";
          const imageUrl = `http://localhost:8080/api/files/view?path=${encodeURIComponent(cleanPath)}`;
          
          // Pre-fetch with auth to ensure it works
          const response = await fetch(imageUrl, {
            headers: { "Authorization": `${tokenType} ${token}` }
          });
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setLoading(false);
          return;
        }

        // For PDF, Word, Excel - use apiClient with blob response
        const response = await apiClient.get("/api/files/view", {
          params: { path: cleanPath },
          responseType: "blob"
        });

        // apiClient interceptor returns response.data directly
        const blob = response;
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        console.log("File loaded successfully");

      } catch (err) {
        console.error("DocumentViewer error:", err);
        setError(err.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    loadFile();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [filePath, fileName]);

  // For Word/Excel files, show download option
  const isOfficeFile = fileType === "word" || fileType === "excel";

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h5 style={{ margin: 0 }}>{fileName || "Document Viewer"}</h5>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={styles.body}>
          {loading && (
            <div style={styles.loading}>
              <div className="spinner-border text-primary" role="status" />
              <p>Loading document...</p>
            </div>
          )}

          {error && (
            <div style={styles.error}>
              <p style={{ color: "red" }}>Error: {error}</p>
              <button 
                className="btn btn-primary btn-sm mt-2"
                onClick={() => {
                  const cleanPath = filePath.replace(/^["']|["']$/g, '').trim();
                  window.open(`http://localhost:8080/api/files/view?path=${encodeURIComponent(cleanPath)}`, "_blank");
                }}
              >
                Open in New Tab
              </button>
            </div>
          )}

          {!loading && !error && blobUrl && fileType === "pdf" && (
            <iframe
              src={blobUrl}
              style={styles.frame}
              title="PDF Viewer"
            />
          )}

          {!loading && !error && blobUrl && fileType === "image" && (
            <img 
              src={blobUrl} 
              alt={fileName} 
              style={styles.image}
            />
          )}

          {!loading && !error && isOfficeFile && (
            <div style={styles.officeMessage}>
              <i className="bi bi-file-earmark-text" style={{ fontSize: "48px", color: "#0d6efd" }} />
              <h5 className="mt-3">{fileName}</h5>
              <p className="text-muted">Word/Excel files cannot be previewed directly.</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  const cleanPath = filePath.replace(/^["']|["']$/g, '').trim();
                  window.open(`http://localhost:8080/api/files/download?path=${encodeURIComponent(cleanPath)}`, "_blank");
                }}
              >
                <i className="bi bi-download me-2" />Download File
              </button>
            </div>
          )}

          {!loading && !error && !blobUrl && !isOfficeFile && (
            <div style={styles.error}>
              <p>No document content to display</p>
            </div>
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
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 20px 35px rgba(0,0,0,0.3)"
  },
  header: {
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e7eb",
    alignItems: "center",
    backgroundColor: "#f8f9fa"
  },
  closeBtn: {
    fontSize: "24px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: "0 10px",
    color: "#6c757d"
  },
  body: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: "20px"
  },
  frame: {
    width: "100%",
    height: "100%",
    border: "none",
    minHeight: "500px"
  },
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain"
  },
  loading: {
    textAlign: "center",
    padding: "40px"
  },
  error: {
    textAlign: "center",
    padding: "40px"
  },
  officeMessage: {
    textAlign: "center",
    padding: "40px"
  }
};

export default DocumentViewer;