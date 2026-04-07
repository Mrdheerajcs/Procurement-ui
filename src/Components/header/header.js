import React, { useState,useEffect,useRef,useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import notificationImg from "../../assets/images/xs/avatar1.jpg";
import ProfileImg from "../../assets/images/profile_av.png";
import './header.css';


const Header = () => {


  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false); 
  const menuRef = useRef(null);
  
  useEffect(() => {
  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOpen(false); 
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

    return(
        <>
            <div className="header">
                <nav className="navbar py-3 shadow-sm bg-white">
                    <div className="container-xxl">
                        {/* header rightbar icon */}
                        <div className="h-right d-flex align-items-center ms-auto order-1">
                            <div className="d-flex gap-2">
                                <a
                                    className="nav-link text-secondary hover-primary transition-colors"
                                    href="help.html"
                                    title="Get Help"
                                >
                                    <i className="icofont-info-square fs-5" />
                                </a>
                            </div>
                            
                            {/* Notifications Dropdown */}
                            <div className="dropdown notifications zindex-popover ms-2">
                                <a
                                    className="nav-link dropdown-toggle pulse position-relative p-0"
                                    href="#"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                >
                                    <i className="icofont-alarm fs-5 text-secondary" />
                                        <span className="visually-hidden">new alerts</span>
                                </a>
                                <div
                                    id="NotificationsDiv"
                                    className="dropdown-menu rounded-3 shadow-lg border-0 dropdown-animation dropdown-menu-sm-end p-0 m-0 mt-2"
                                    style={{ minWidth: '380px' }}
                                >
                                    <div className="card border-0">
                                        <div className="card-header border-0 bg-transparent p-3 pb-0">
                                            <h5 className="mb-0 fw-semibold d-flex justify-content-between align-items-center">
                                                <span>Notifications</span>
                                                <span className="badge bg-primary rounded-pill px-3 py-2">04</span>
                                            </h5>
                                        </div>
                                        <div className="tab-content card-body p-3">
                                            <div className="tab-pane fade show active">
                                                <ul className="list-unstyled list mb-0">
                                                    <li className="py-3 mb-1 border-bottom hover-bg-light rounded transition-colors">
                                                        <a href="javascript:void(0);" className="d-flex text-decoration-none text-dark">
                                                            <img
                                                                className="avatar rounded-circle"
                                                                src={notificationImg}
                                                                alt=""
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                            />
                                                            <div className="flex-fill ms-3">
                                                                <p className="d-flex justify-content-between mb-1">
                                                                    <span className="fw-semibold">
                                                                        Tender Published
                                                                    </span>
                                                                    <small className="text-muted">5MIN</small>
                                                                </p>
                                                                <span className="text-muted small">
                                                                    TND/2025/001 has been published
                                                                    <span className="badge bg-success ms-2">New</span>
                                                                </span>
                                                            </div>
                                                        </a>
                                                    </li>
                                                    <li className="py-3 mb-1 border-bottom hover-bg-light rounded transition-colors">
                                                        <a href="javascript:void(0);" className="d-flex text-decoration-none text-dark">
                                                            <div className="avatar rounded-circle no-thumbnail bg-primary text-white d-flex align-items-center justify-content-center fw-bold" 
                                                                 style={{ width: '40px', height: '40px' }}>
                                                                BT
                                                            </div>
                                                            <div className="flex-fill ms-3">
                                                                <p className="d-flex justify-content-between mb-1">
                                                                    <span className="fw-semibold">
                                                                        Bid Submitted
                                                                    </span>
                                                                    <small className="text-muted">15MIN</small>
                                                                </p>
                                                                <span className="text-muted small">New bid received for TND/2025/001</span>
                                                            </div>
                                                        </a>
                                                    </li>
                                                    <li className="py-3 mb-1 border-bottom hover-bg-light rounded transition-colors">
                                                        <a href="javascript:void(0);" className="d-flex text-decoration-none text-dark">
                                                            <img
                                                                className="avatar rounded-circle"
                                                                src="assets/images/xs/avatar3.jpg"
                                                                alt=""
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                            />
                                                            <div className="flex-fill ms-3">
                                                                <p className="d-flex justify-content-between mb-1">
                                                                    <span className="fw-semibold">
                                                                        MPR Approved
                                                                    </span>
                                                                    <small className="text-muted">1HR</small>
                                                                </p>
                                                                <span className="text-muted small">
                                                                    MPR/2025/002 approved by Finance Dept
                                                                </span>
                                                            </div>
                                                        </a>
                                                    </li>
                                                    <li className="py-3 mb-1 border-bottom hover-bg-light rounded transition-colors">
                                                        <a href="javascript:void(0);" className="d-flex text-decoration-none text-dark">
                                                            <img
                                                                className="avatar rounded-circle"
                                                                src="assets/images/xs/avatar5.jpg"
                                                                alt=""
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                            />
                                                            <div className="flex-fill ms-3">
                                                                <p className="d-flex justify-content-between mb-1">
                                                                    <span className="fw-semibold">
                                                                        PO Generated
                                                                    </span>
                                                                    <small className="text-muted">2HR</small>
                                                                </p>
                                                                <span className="text-muted small">
                                                                    Purchase Order PO/2025/001 issued
                                                                </span>
                                                            </div>
                                                        </a>
                                                    </li>
                                                    <li className="py-3 hover-bg-light rounded transition-colors">
                                                        <a href="javascript:void(0);" className="d-flex text-decoration-none text-dark">
                                                            <img
                                                                className="avatar rounded-circle"
                                                                src="assets/images/xs/avatar7.jpg"
                                                                alt=""
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                            />
                                                            <div className="flex-fill ms-3">
                                                                <p className="d-flex justify-content-between mb-1">
                                                                    <span className="fw-semibold">
                                                                        GRN Created
                                                                    </span>
                                                                    <small className="text-muted">1DAY</small>
                                                                </p>
                                                                <span className="text-muted small">
                                                                    Goods receipt created for PO/2025/001
                                                                </span>
                                                            </div>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <a className="card-footer text-center border-0 bg-transparent py-3 text-primary text-decoration-none fw-semibold hover-underline" href="#">
                                            View all notifications
                                        </a>
                                    </div>
                                </div>
                            </div>
                            
                            {/* User Profile Dropdown */}
                            <div className="dropdown user-profile ms-3 d-flex align-items-center zindex-popover">
                                <div className="u-info me-3 text-end">
                                    <p className="mb-0 line-height-sm fw-semibold text-dark">
                                        Procurement Admin
                                    </p>
                                    <small className="text-muted">Admin Profile</small>
                                </div>
                                <a
                                    className="nav-link dropdown-toggle pulse p-0"
                                    href="#"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    data-bs-display="static"
                                >
                                    <img
                                        className="avatar lg rounded-circle img-thumbnail border-2 border-primary"
                                        src={ProfileImg}
                                        alt="profile"
                                    />
                                </a>
                                <div className="dropdown-menu rounded-3 shadow-lg border-0 dropdown-animation dropdown-menu-end p-0 m-0 mt-2">
                                    <div className="card border-0" style={{ minWidth: '280px' }}>
                                        <div className="card-body pb-0 p-3">
                                            <div className="d-flex py-2 align-items-center">
                                                <img
                                                    className="avatar rounded-circle"
                                                    src={ProfileImg}
                                                    alt="profile"
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                />
                                                <div className="flex-fill ms-3">
                                                    <p className="mb-0 fw-semibold text-dark">
                                                        Procurement Admin
                                                    </p>
                                                    <small className="text-muted">procurement@arigen.com</small>
                                                </div>
                                            </div>
                                            <div>
                                                <hr className="dropdown-divider my-2" />
                                            </div>
                                        </div>
                                        <div className="list-group m-2 gap-1">
                                            <a
                                                href="dashboard"
                                                className="list-group-item list-group-item-action border-0 rounded-3 hover-bg-light"
                                            >
                                                <i className="icofont-dashboard fs-5 me-3 text-primary"></i>
                                                Procurement Dashboard
                                            </a>
                                            <a
                                                href="tender-list"
                                                className="list-group-item list-group-item-action border-0 rounded-3 hover-bg-light"
                                            >
                                                <i className="icofont-file-alt fs-5 me-3 text-primary"></i>
                                                Tender Management
                                            </a>
                                            <a
                                                href="purchase-orders"
                                                className="list-group-item list-group-item-action border-0 rounded-3 hover-bg-light"
                                            >
                                                <i className="icofont-file-invoice fs-5 me-3 text-primary"></i>
                                                Purchase Orders
                                            </a>
                                            <a
                                                href="inventory"
                                                className="list-group-item list-group-item-action border-0 rounded-3 hover-bg-light"
                                            >
                                                <i className="icofont-warehouse fs-5 me-3 text-primary"></i>
                                                Inventory Status
                                            </a>
                                            <div>
                                                <hr className="dropdown-divider my-2" />
                                            </div>
                                            <a
                                                href="ui-elements/auth-signin.html"
                                                className="list-group-item list-group-item-action border-0 rounded-3 hover-bg-light text-danger"
                                            >
                                                <i className="icofont-logout fs-6 me-3"></i>
                                                Signout
                                            </a>
                                            <a
                                                href="ui-elements/auth-signup.html"
                                                className="list-group-item list-group-item-action border-0 rounded-3 hover-bg-light"
                                            >
                                                <i className="icofont-contact-add fs-5 me-3 text-success"></i>
                                                Add procurement account
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                           {/* setting */}
   <div className="setting ms-2 position-relative" ref={menuRef}>
  <a
    href=""
    className="text-secondary hover-primary"
    onClick={(e) => {
      e.preventDefault();
      setOpen(!open); 
    }}
  >
    <i className="icofont-gear-alt fs-5" />
  </a>

  {/* 🔽 Dropdown */}
  {open && (
    <div
      className="bg-white shadow rounded position-absolute"
      style={{
        right: 0,
        top: "30px",
        minWidth: "140px",
        zIndex: 9999,
      }}
    >
      {/* 🔵 Profile */}
      <div
        style={{
          padding: "8px 12px",
          cursor: "pointer",
          color: "#0d6efd",
        }}
        onClick={() => {
          setOpen(false);
          navigate("/profile");
        }}
      >
        Profile
      </div>

      {/* 🔴 Logout */}
     <div
  style={{
    padding: "8px 12px",
    cursor: "pointer",
    color: "red",
    borderTop: "1px solid #eee",
  }}
  onClick={() => setShowLogout(true)}
>
  Logout
</div>
 </div>
  )}
</div>
 </div>
 {showLogout && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        width: "380px",   // 👈 bada size
        textAlign: "center",
        boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
      }}
    >
      <h5 style={{ marginBottom: "10px" }}>Confirm Logout</h5>

      <p style={{ fontSize: "15px", color: "#555" }}>
        Are you sure you want to logout?
      </p>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <button
          className="btn btn-outline-secondary px-3"
          onClick={() => setShowLogout(false)}
        >
         Yes
        </button>

        <button
          className="btn btn-danger px-3"
          onClick={() => {
            localStorage.clear();
            
          }}
        >
          No
        </button>
      </div>
    </div>
  </div>
)}

              {/* menu toggler */}
                        <button
                            className="navbar-toggler p-2 border-0 menu-toggle order-3"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#mainHeader"
                        >
                            <span className="fa fa-bars fs-4" />
                        </button>
                        
                        {/* main menu Search*/}
                        <div className="order-0 col-lg-4 col-md-4 col-sm-12 col-12 mb-3 mb-md-0">
                            
                        </div>
                    </div>
                </nav>
            </div>
            
            <style jsx>{`
                .transition-colors {
                    transition: all 0.2s ease-in-out;
                }
                .hover-bg-light:hover {
                    background-color: rgba(0, 0, 0, 0.03);
                }
                .hover-primary:hover {
                    color: #0d6efd !important;
                }
                .hover-underline:hover {
                    text-decoration: underline !important;
                }
                .line-height-sm {
                    line-height: 1.2;
                }
                .gap-2 {
                    gap: 0.5rem;
                }
            `}</style>
        </>
    );
}

export default Header;