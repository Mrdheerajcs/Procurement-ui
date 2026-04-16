import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6 text-center">
          <div className="card">
            <div className="card-body py-5">
              <i className="bi bi-shield-exclamation fs-1 text-danger d-block mb-3" />
              <h2 className="text-danger">Access Denied</h2>
              <p className="text-muted">
                You don't have permission to access this page.
                Please contact your administrator if you believe this is an error.
              </p>
              <button className="btn btn-primary mt-3" onClick={() => navigate("/dashboard")}>
                <i className="bi bi-house me-2" />Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;