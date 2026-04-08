import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import ProfileImg from "../../assets/images/profile_av.png";
import "./header.css";

const routeLabels = {
    "/dashboard": "Dashboard",
    "/mpr-list": "MPR List",
    "/creatempr": "Create MPR",
    "/mpr-approval": "MPR Approval",
    "/mpr-history": "MPR History",
    "/publishtender": "Publish Tender",
    "/searchtender": "Search Tender",
    "/profile": "My Profile",
};

const Header = ({ onToggleMobileSidebar, onToggleCollapse, isSidebarCollapsed }) => {
    const location = useLocation();
    const { auth, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const pageName = useMemo(() => {
        const direct = routeLabels[location.pathname];
        if (direct) return direct;
        return "Procurement Portal";
    }, [location.pathname]);

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
                            <p className="text-muted-soft small mb-1">Welcome back</p>
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
                            <span className="notification-dot" />
                        </button>

                        <div className="position-relative">
                            <button
                                type="button"
                                className="btn profile-button"
                                onClick={() => setShowProfileMenu((prev) => !prev)}
                            >
                                <img src={ProfileImg} alt="Profile" className="profile-thumb" />
                                <span className="d-none d-lg-inline text-start">
                                    <small className="d-block text-muted-soft">{auth?.username || "User"}</small>
                                    <strong className="small">Procurement</strong>
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