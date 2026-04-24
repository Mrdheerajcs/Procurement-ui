import React, { useState, useEffect } from "react";
import "./sidebar.css";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import eProcLogo from "../../assets/images/e-proc-logo.png";

// Admin Menu (PROCUREMENT_ADMIN)
const adminMenuConfig = [
  {
    key: "dashboard",
    title: "Dashboard",
    icon: "bi-speedometer2",
    items: [{ label: "Overview", to: "/dashboard" }],
  },
  {
    key: "mpr",
    title: "MPR Management",
    icon: "bi-clipboard2-check",
    items: [
      { label: "Create MPR", to: "/creatempr" },
      // { label: "MPR List", to: "/mpr-list" },
      { label: "MPR Approval", to: "/mpr-approval" },
      { label: "MPR History", to: "/mpr-history" },
      // { label: "MPR Approval Levels", to: "/mpr-approval-levels" },
    ],
  },
  {
    key: "tender",
    title: "Tender",
    icon: "bi-megaphone",
    items: [
      { label: "Create Tender", to: "/publishtender" },
      { label: "Tender Approval & Publish", to: "/tender-approval" },
      { label: "Search Tender", to: "/searchtender" },
    ],
  },
  {
    key: "evaluation",
    title: "Evaluation",
    icon: "bi-clipboard-data",
    items: [
      { label: "Technical Evaluation", to: "/technical-evaluation" },
      { label: "Commercial Evaluation", to: "/commercial-evaluation" },
    ],
  },
  // {
  //   key: "vendor",
  //   title: "Vendor Management",
  //   icon: "bi-people",
  //   items: [
  //     { label: "Rate Vendor", to: "/ratevendor" },
  //   ],
  // },
  {
    key: "profile",
    title: "Profile",
    icon: "bi-person-circle",
    items: [{ label: "My Profile", to: "/profile" }],
  },
  {
    key: "audit",
    title: "Admin",
    icon: "bi-shield-lock",
    items: [{ label: "Audit Logs", to: "/audit-logs" }],
  },
  // {
  //   key: "newpage",
  //   title: "Utilities",
  //   icon: "bi-tools",
  //   items: [
  //     { label: "Work Order", to: "/workorderview" },
  //     { label: "Payment Gateway", to: "/paymentgateway" },
  //     { label: "Contract Details", to: "/contractdetails" },
  //     { label: "Tender Fee", to: "/tenderfeepayment" },
  //   ],
  // },
];

// User Menu (PROCUREMENT_USER)
const userMenuConfig = [
  {
    key: "dashboard",
    title: "Dashboard",
    icon: "bi-speedometer2",
    items: [{ label: "Overview", to: "/dashboard" }],
  },
  {
    key: "mpr",
    title: "MPR Management",
    icon: "bi-clipboard2-check",
    items: [
      { label: "Create MPR", to: "/creatempr" },
      { label: "MPR List", to: "/mpr-list" },
      { label: "MPR History", to: "/mpr-history" },
    ],
  },
  {
    key: "tender",
    title: "Tender",
    icon: "bi-megaphone",
    items: [
      { label: "Search Tender", to: "/searchtender" },
    ],
  },
  {
    key: "profile",
    title: "Profile",
    icon: "bi-person-circle",
    items: [{ label: "My Profile", to: "/profile" }],
  },
];

// Vendor Menu (VENDER_USER)
const vendorMenuConfig = [
  {
    key: "dashboard",
    title: "Dashboard",
    icon: "bi-speedometer2",
    items: [{ label: "Overview", to: "/dashboard" }],
  },
  {
    key: "tender",
    title: "Tender",
    icon: "bi-megaphone",
    items: [
      { label: "Search Tender", to: "/searchtender" },
      { label: "My Bids", to: "/my-bids" },
    ],
  },
  {
    key: "vendor",
    title: "Vendor Portal",
    icon: "bi-building",
    items: [
      { label: "Bid Participation", to: "/bid-submission" },
      { label: "My Contracts", to: "/vendor-contracts" },
      { label: "Pending Clarifications", to: "/pending-clarifications" },
      { label: "Tender Fee Payment", to: "/tenderfeepayment" },
    ],
  },
  {
    key: "profile",
    title: "Profile",
    icon: "bi-person-circle",
    items: [{ label: "My Profile", to: "/profile" }],
  },
];

const Sidebar = ({ collapsed, mobileOpen, onCloseMobile }) => {
  const { auth } = useAuth();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState("");

  const userRoles = auth?.roles || [];
  
  const isAdmin = userRoles.some(role => role === "PROCUREMENT_ADMIN");
  const isUser = userRoles.some(role => role === "PROCUREMENT_USER");
  const isVendor = userRoles.some(role => role === "VENDER_USER");

  console.log("📱 Sidebar - Roles:", userRoles);
  console.log("📱 Sidebar - isAdmin:", isAdmin, "isUser:", isUser, "isVendor:", isVendor);

  let menuConfig = [];
  if (isAdmin) {
    menuConfig = adminMenuConfig;
  } else if (isUser) {
    menuConfig = userMenuConfig;
  } else if (isVendor) {
    menuConfig = vendorMenuConfig;
  }

  useEffect(() => {
    const activeGroup = menuConfig.find((section) =>
      section.items.some((item) => location.pathname.startsWith(item.to))
    );
    setOpenMenu(activeGroup?.key || "");
  }, [location.pathname, menuConfig]);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? "" : menu));
  };

  const isActive = (path) => location.pathname === path;

  if (menuConfig.length === 0) {
    return null;
  }

  return (
    <aside
      className={`app-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}
      aria-label="Sidebar navigation"
    >
      <div className="app-sidebar-inner">
        <Link to="/dashboard" className="brand-icon" onClick={onCloseMobile}>
          <img src={eProcLogo} alt="E-Procurement" className="sidebar-logo-full" />
        </Link>

        <ul className="menu-list">
          {menuConfig.map((section) => (
            <li
              key={section.key}
              className={`collapsed ${openMenu === section.key ? "active" : ""}`}
            >
              <button
                type="button"
                className="m-link"
                onClick={() => toggleMenu(section.key)}
              >
                <i className={`bi ${section.icon}`} />
                <span>{section.title}</span>
                <i className="bi bi-chevron-down arrow" />
              </button>

              <ul className={`sub-menu ${openMenu === section.key ? "show" : ""}`}>
                {section.items.map((item) => (
                  <li key={item.to}>
                    <Link
                      className={`ms-link ${isActive(item.to) ? "active" : ""}`}
                      to={item.to}
                      onClick={onCloseMobile}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;