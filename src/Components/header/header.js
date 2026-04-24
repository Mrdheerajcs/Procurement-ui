import React, { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import apiClient from "../../auth/apiClient";
import ProfileImg from "../../assets/images/profile_av.png";
import "./header.css";

const routeLabels = {
  "/dashboard": "Dashboard",
  "/creatempr": "Create MPR",
  "/mpr-list": "MPR List",
  "/mpr-approval": "MPR Approval",
  "/mpr-history": "MPR History",
  "/mpr-approval-levels": "MPR Approval Levels",
  "/publishtender": "Publish Tender",
  "/tender-approval": "Tender Approval",
  "/searchtender": "Search Tender",
  "/technical-evaluation": "Technical Evaluation",
  "/commercial-evaluation": "Commercial Evaluation",
  "/bid-submission": "Bid Participation",
  "/vendor-contracts": "My Contracts",
  "/my-bids": "My Bids",
  "/pending-clarifications": "Pending Clarifications",
  "/profile": "My Profile",
  "/audit-logs": "Audit Logs",
};

const Header = ({ onToggleMobileSidebar, onToggleCollapse, isSidebarCollapsed }) => {
  const location = useLocation();
  const { auth, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const userRoles = auth?.roles || [];
  const isVendor = userRoles.some(role => role === "VENDER_USER");
  const isAdmin = userRoles.some(role => role === "PROCUREMENT_ADMIN");
  const username = auth?.username || "User";
  
  // Get profile pic URL from auth (login response)
  const profilePicUrl = auth?.profilePicUrl || null;

  useEffect(() => {
    if (isVendor) {
      fetchVendorProfile();
    }
    fetchNotificationCount();
  }, [isVendor]);

  const fetchVendorProfile = async () => {
    try {
      const res = await apiClient.get("/api/vendors/profile");
      if (res.status === "SUCCESS") {
        setVendorProfile(res.data);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Vendor profile fetch failed:", err.message);
      }
    }
  };

  const fetchNotificationCount = async () => {
    try {
      if (isVendor) {
        const res = await apiClient.get("/api/bids/vendor/pending-clarifications");
        if (res.status === "SUCCESS") {
          setNotificationCount(res.data?.length || 0);
        }
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const pageName = useMemo(() => {
    const direct = routeLabels[location.pathname];
    if (direct) return direct;
    if (location.pathname.startsWith("/bid-submission/")) return "Bid Submission";
    if (location.pathname.startsWith("/clarification-response/")) return "Clarification Response";
    return "Procurement Portal";
  }, [location.pathname]);

  let displayName = username;
  let displayRole = "User";
  
  if (isVendor && vendorProfile?.vendorName) {
    displayName = vendorProfile.vendorName;
    displayRole = "Vendor";
  } else if (isAdmin) {
    displayRole = "Admin";
  } else if (userRoles[0]) {
    displayRole = userRoles[0].replace("PROCUREMENT_", "");
  }

  return (
    <header className="app-header border-bottom">
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex align-items-center justify-content-between gap-2 py-3">
          <div className="d-flex align-items-center gap-2 gap-lg-3 min-w-0">
            <button
              type="button"
              className="btn btn-light d-lg-none"
              onClick={onToggleMobileSidebar}
              aria-label="Open sidebar"
            >
              <i className="bi bi-list fs-5" />
            </button>

            <button
              type="button"
              className="btn btn-light d-none d-lg-inline-flex"
              onClick={onToggleCollapse}
              aria-label="Toggle sidebar"
            >
              <i className={`bi ${isSidebarCollapsed ? "bi-layout-sidebar-inset" : "bi-layout-sidebar"}`} />
            </button>

            <div>
              <p className="text-muted-soft small mb-1">Welcome back, {displayName}</p>
              <h1 className="page-title text-truncate">{pageName}</h1>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="d-none d-md-flex header-search">
              <i className="bi bi-search" />
              <input type="text" className="form-control border-0" placeholder="Search..." />
            </div>

            <button type="button" className="btn btn-light position-relative" aria-label="Notifications">
              <i className="bi bi-bell" />
              {notificationCount > 0 && (
                <span className="notification-dot">{notificationCount > 9 ? "9+" : notificationCount}</span>
              )}
            </button>

            <div className="position-relative">
              <button
                type="button"
                className="btn profile-button"
                onClick={() => setShowProfileMenu((prev) => !prev)}
              >
                <img 
                  src={profilePicUrl || ProfileImg} 
                  alt="Profile" 
                  className="profile-thumb"
                  onError={(e) => { e.target.src = ProfileImg; }}
                />
                <span className="d-none d-lg-inline text-start">
                  <small className="d-block text-muted-soft">{displayName}</small>
                  <strong className="small">{displayRole}</strong>
                </span>
                <i className="bi bi-chevron-down small" />
              </button>

              {showProfileMenu && (
                <div className="profile-menu card p-2">
                  <Link
                    to="/profile"
                    className="dropdown-item rounded"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <i className="bi bi-person me-2" /> Profile
                  </Link>
                  {isVendor && (
                    <Link
                      to="/my-bids"
                      className="dropdown-item rounded"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <i className="bi bi-send me-2" /> My Bids
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button
                    type="button"
                    className="dropdown-item rounded text-danger"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowLogoutConfirm(true);
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="logout-modal-backdrop">
          <div className="card logout-modal-card p-4">
            <h5 className="mb-2">Confirm logout</h5>
            <p className="mb-4 text-muted-soft">Do you want to end your current session?</p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;