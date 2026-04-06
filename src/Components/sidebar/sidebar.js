import React, { useState, useEffect } from "react";
import "./sidebar.css";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState("");

  useEffect(() => {
    if (location.pathname.startsWith("/dashboard")) setOpenMenu("dashboard");
    else if (location.pathname.startsWith("/creatempr")) setOpenMenu("mpr");
    else if (location.pathname.startsWith("/tender")) setOpenMenu("tender");
    else if (location.pathname.startsWith("/publishtender"))setOpenMenu("publishtender");
    else if (
      location.pathname.startsWith("/purchase-orders") ||
      location.pathname.startsWith("/grn") ||
      location.pathname.startsWith("/inventory")
    ) {
      setOpenMenu("procurement");
    } else if (
      location.pathname.startsWith("/vendor-dashboard") ||
      location.pathname.startsWith("/contracts")
    ) {
      setOpenMenu("vendor");
    } else {
      setOpenMenu("");
    }
  }, [location.pathname]);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? "" : menu));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar px-4 py-4 py-md-5 me-0">
      <div className="d-flex flex-column h-100">

        {/* Logo */}
        <Link to="/dashboard" className="mb-0 brand-icon">
          <span className="logo-icon">
            <i className="icofont-file-document fs-2" />
          </span>
          <span className="logo-text">E-procurement</span>
        </Link>

        <ul className="menu-list flex-grow-1 mt-3">

          <li className={`collapsed ${openMenu === "dashboard" ? "active" : ""}`}>
            <div className={`m-link ${isActive("/dashboard") ? "active" : ""}`} onClick={() => toggleMenu("dashboard")}>
              <i className="icofont-ui-home fs-5" />
              <span>Dashboard</span>
              <span className="arrow icofont-rounded-down ms-auto fs-5" />
            </div>

            <ul className={`sub-menu ${openMenu === "dashboard" ? "show" : ""}`}>
              <li>
                <Link className={`ms-link ${isActive("/dashboard") ? "active" : ""}`} to="/dashboard">
                  Procurement Dashboard
                </Link>
              </li>
            </ul>
          </li>

          <li className={`collapsed ${openMenu === "mpr" ? "active" : ""}`}>
            <div className="m-link" onClick={() => toggleMenu("mpr")}>
              <i className="icofont-file-alt fs-5" />
              <span>MPR Management</span>
              <span className="arrow icofont-rounded-down ms-auto fs-5" />
            </div>

            <ul className={`sub-menu ${openMenu === "mpr" ? "show" : ""}`}>
              <li>
                <Link className={`ms-link ${isActive("/creatempr") ? "active" : ""}`} to="/creatempr">
                  Create MPR
                </Link>
              </li>
            </ul>
          </li>

          <li className={`collapsed ${openMenu === "tender" ? "active" : ""}`}>
            <div className="m-link" onClick={() => toggleMenu("tender")}>
              <i className="icofont-file-alt fs-5" />
              <span>Tender Management</span>
              <span className="arrow icofont-rounded-down ms-auto fs-5" />

            </div>

            <ul className={`sub-menu ${openMenu === "tender" ? "show" : ""}`}>
              <li><Link className={`ms-link ${isActive("/tender-list") ? "active" : ""}`} to="/tender-list">All Tenders</Link></li>
              <li><Link className={`ms-link ${isActive("/create-tender") ? "active" : ""}`} to="/create-tender">Create Tender</Link></li>
              <li><Link className={`ms-link ${isActive("/prebid-queries") ? "active" : ""}`} to="/prebid-queries">Pre-Bid Queries</Link></li>
              <li><Link className={`ms-link ${isActive("/bid-list") ? "active" : ""}`} to="/bid-list">Bid Management</Link></li>
              <li><Link className={`ms-link ${isActive("/evaluation") ? "active" : ""}`} to="/evaluation">Evaluation & Award</Link></li>
               <li><Link className={`ms-link ${isActive("/publishtender") ? "active" : ""}`} to="/publishtender">Publish Tender</Link></li>
            </ul>
          </li>

          <li className={`collapsed ${openMenu === "procurement" ? "active" : ""}`}>
            <div className="m-link" onClick={() => toggleMenu("procurement")}>
              <i className="icofont-shopping-cart fs-5" />
              <span>Procurement Ops</span>
              <span className="arrow icofont-rounded-down ms-auto fs-5" />
            </div>

            <ul className={`sub-menu ${openMenu === "procurement" ? "show" : ""}`}>
              <li><Link className={`ms-link ${isActive("/purchase-orders") ? "active" : ""}`} to="/purchase-orders">Purchase Orders</Link></li>
              <li><Link className={`ms-link ${isActive("/grn") ? "active" : ""}`} to="/grn">Goods Receipt (GRN)</Link></li>
              <li><Link className={`ms-link ${isActive("/inventory") ? "active" : ""}`} to="/inventory">Inventory Management</Link></li>
            </ul>
          </li>

          <li className={`collapsed ${openMenu === "vendor" ? "active" : ""}`}>
            <div className="m-link" onClick={() => toggleMenu("vendor")}>
              <i className="icofont-store fs-5" />
              <span>Vendor Relations</span>
              <span className="arrow icofont-rounded-down ms-auto fs-5" />
            </div>

            <ul className={`sub-menu ${openMenu === "vendor" ? "show" : ""}`}>
              <li><Link className={`ms-link ${isActive("/vendor-dashboard") ? "active" : ""}`} to="/vendor-dashboard">Vendor Portal</Link></li>
              <li><Link className={`ms-link ${isActive("/contracts") ? "active" : ""}`} to="/contracts">Contracts & Payments</Link></li>
            </ul>
          </li>

          <li>
            <Link className={`m-link ${isActive("/activity-logs") ? "active" : ""}`} to="/activity-logs">
              <i className="icofont-history fs-5" />
              <span>Audit Logs</span>
            </Link>
          </li>

        </ul>

        <button type="button" className="btn btn-link sidebar-mini-btn text-light">
          <span className="ms-2">
            <i className="icofont-bubble-right" />
          </span>
        </button>

      </div>
    </div>
  );
};

export default Sidebar;