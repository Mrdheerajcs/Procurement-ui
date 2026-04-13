import React, { useState, useEffect } from "react";
import "./sidebar.css";
import { Link, useLocation } from "react-router-dom";
import eProcLogo from "../../assets/images/e-proc-logo.png";

const menuConfig = [
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
      { label: "MPR Approval", to: "/mpr-approval" },
      { label: "MPR History", to: "/mpr-history" },
    ],
  },
  {
    key: "tender",
    title: "Tender",
    icon: "bi-megaphone",
    items: [
      { label: "Publish Tender", to: "/publishtender" },
      { label: "Search Tender", to: "/searchtender" },
      { label: "Technical Evaluation", to: "/tender-dashboard" },
      { label: "Commercial Evaluation", to: "/commercial-comparison" },
      { label: "Bid Participation", to: "/bid-submission" }, 
      { label: "My Contracts", to: "/vendor-contracts" },
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
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState("");

  useEffect(() => {
    const activeGroup = menuConfig.find((section) =>
      section.items.some((item) => location.pathname.startsWith(item.to))
    );

    setOpenMenu(activeGroup?.key || "");
  }, [location.pathname]);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? "" : menu));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`app-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}
      aria-label="Sidebar navigation"
    >
      <div className="app-sidebar-inner">
        <Link to="/dashboard" className="brand-icon" onClick={onCloseMobile}>
          <img src={eProcLogo} alt="E-Procurement" className="sidebar-logo-full" />
          {/* <span className="logo-icon sidebar-logo-mini">
            <i className="bi bi-grid-1x2-fill" />
          </span> */}
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