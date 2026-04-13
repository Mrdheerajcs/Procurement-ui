import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./LandingPageProAutoScroll.css";
import eProcLogo from "../../src/assets/images/e-proc-logo.png";

const LandingPageProAutoScroll = () => {
 const latestTenders = [
  { id: "EP/2026/111", title: "Solar Panel Installation", dept: "Energy", deadline: "22-May-2026", status: "Open", location: "Jaipur" },
  { id: "EP/2026/112", title: "Biometric Attendance System", dept: "HR", deadline: "25-May-2026", status: "Open", location: "Delhi NCR" },
  { id: "EP/2026/113", title: "ERP Implementation Services", dept: "IT", deadline: "28-May-2026", status: "Closing", location: "Hyderabad" },
  { id: "EP/2026/114", title: "Warehouse Management Setup", dept: "Logistics", deadline: "30-May-2026", status: "Open", location: "Ahmedabad" },
  { id: "EP/2026/115", title: "Diesel Generator Supply", dept: "Facilities", deadline: "02-Jun-2026", status: "Open", location: "Pune" },
  { id: "EP/2026/116", title: "Mobile App Development", dept: "IT", deadline: "05-Jun-2026", status: "Closing", location: "Bangalore" },
  { id: "EP/2026/117", title: "Access Control System", dept: "Security", deadline: "08-Jun-2026", status: "Open", location: "Delhi NCR" },
  { id: "EP/2026/118", title: "Annual Housekeeping Contract", dept: "Admin", deadline: "10-Jun-2026", status: "Open", location: "Mumbai" },
  { id: "EP/2026/119", title: "E-Waste Disposal Services", dept: "Environment", deadline: "12-Jun-2026", status: "Open", location: "Chennai" },
  { id: "EP/2026/120", title: "Vehicle Fleet Management System", dept: "Transport", deadline: "15-Jun-2026", status: "Closing", location: "Delhi NCR" },
  { id: "EP/2026/121", title: "AI-Based Analytics Platform", dept: "IT", deadline: "18-Jun-2026", status: "Open", location: "Hyderabad" },
  { id: "EP/2026/122", title: "Water Purification Systems", dept: "Facilities", deadline: "20-Jun-2026", status: "Open", location: "Lucknow" },
  { id: "EP/2026/123", title: "Corporate Website Redesign", dept: "Marketing", deadline: "22-Jun-2026", status: "Closing", location: "Mumbai" },
  { id: "EP/2026/124", title: "Smart Lighting Solutions", dept: "Energy", deadline: "25-Jun-2026", status: "Open", location: "Delhi NCR" },
  { id: "EP/2026/125", title: "Training & Development Program", dept: "HR", deadline: "28-Jun-2026", status: "Open", location: "Bangalore" },
  { id: "EP/2026/126", title: "Firewall & Cybersecurity Upgrade", dept: "IT", deadline: "30-Jun-2026", status: "Closing", location: "Pune" },
  { id: "EP/2026/127", title: "Building Renovation Work", dept: "Civil", deadline: "03-Jul-2026", status: "Open", location: "Kolkata" },
  { id: "EP/2026/128", title: "Medical Equipment Supply", dept: "Healthcare", deadline: "06-Jul-2026", status: "Open", location: "Chandigarh" },
  { id: "EP/2026/129", title: "Call Center Setup", dept: "Operations", deadline: "10-Jul-2026", status: "Closing", location: "Noida" },
  { id: "EP/2026/130", title: "Document Management System", dept: "Admin", deadline: "12-Jul-2026", status: "Open", location: "Delhi NCR" }
];

  const submittedBids = [
  { month: "Jul 2025", submitted: 8,  approved: 5,  rejected: 3 },
  { month: "Aug 2025", submitted: 10, approved: 6,  rejected: 4 },
  { month: "Sep 2025", submitted: 11, approved: 7,  rejected: 4 },
  { month: "Oct 2025", submitted: 12, approved: 7,  rejected: 5 },
  { month: "Nov 2025", submitted: 15, approved: 10, rejected: 5 },
  { month: "Dec 2025", submitted: 18, approved: 12, rejected: 6 },
  { month: "Jan 2026", submitted: 20, approved: 15, rejected: 5 },
  { month: "Feb 2026", submitted: 22, approved: 16, rejected: 6 },
  { month: "Mar 2026", submitted: 25, approved: 18, rejected: 7 },
  { month: "Apr 2026", submitted: 10, approved: 7,  rejected: 3 },
  { month: "May 2026", submitted: 14, approved: 9,  rejected: 5 },
  { month: "Jun 2026", submitted: 19, approved: 13, rejected: 6 },
  { month: "Jul 2026", submitted: 23, approved: 17, rejected: 6 },
  { month: "Aug 2026", submitted: 26, approved: 19, rejected: 7 },
  { month: "Sep 2026", submitted: 28, approved: 21, rejected: 7 }
];

  const tendersAwarded = [
  "EP/2025/089 - HVAC Maintenance Contract",
  "EP/2025/090 - Electrical Panel Upgrade",
  "EP/2025/091 - Office Interior Renovation",
  "EP/2025/092 - Data Backup Solution",
  "EP/2025/093 - Firewall Implementation",
  "EP/2025/094 - Video Conferencing Setup",
  "EP/2025/095 - Printer & Copier Supply",
  "EP/2025/096 - Access Control System",
  "EP/2025/097 - IT Helpdesk Services",
  "EP/2025/098 - Network Cabling Work",
  "EP/2025/099 - Server Maintenance",
  "EP/2025/100 - LAN Setup",
  "EP/2026/101 - Data Center Equipment Supply",
  "EP/2026/102 - Security Surveillance System",
  "EP/2026/103 - Office Furniture Procurement",
  "EP/2026/104 - Network Upgrade",
  "EP/2026/105 - Software License Renewal",
  "EP/2026/106 - CCTV Installation",
  "EP/2026/107 - UPS Maintenance",
  "EP/2026/108 - Cloud Migration Services",
  "EP/2026/109 - Fire Safety Equipment",
  "EP/2026/110 - HR Management System",
  "EP/2026/111 - Solar Panel Installation",
  "EP/2026/112 - Biometric Attendance System",
  "EP/2026/113 - ERP Implementation",
  "EP/2026/114 - Warehouse Setup",
  "EP/2026/115 - Generator Supply",
  "EP/2026/116 - Mobile App Development",
  "EP/2026/117 - Access Control Upgrade",
  "EP/2026/118 - Housekeeping Services Contract"
];
  const newsEvents       = ["Portal upgraded to v2.5","New compliance guidelines released","Vendor KYC deadline extended","Digital payment integration","Quarterly review meeting scheduled","Security audit completed","Award ceremony on 25-Apr-2026"];
  const projectsOverview = ["Project A - Active","Project B - Completed","Project C - Active","Project D - Completed","Project E - Active","Project F - Completed","Project G - Active"];

  const ROW_H   = 38;
  const VISIBLE = 4;
  const SPEED   = 0.55;

  const t1Ref    = useRef(null);
  const t2Ref    = useRef(null);
  const t1Paused = useRef(false);
  const t2Paused = useRef(false);
  const t1Pos    = useRef(0);
  const t2Pos    = useRef(0);
  const t1Idx    = useRef(0);
  const t2Idx    = useRef(0);

  const [t1Start, setT1Start] = useState(0);
  const [t2Start, setT2Start] = useState(0);
  
  // Search filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Auto-scroll ref for search results
  const searchResultsRef = useRef(null);
  const searchPaused = useRef(false);
  const searchPos = useRef(0);
  const searchIdx = useRef(0);

  // Filtered tenders based on search, status, and location
  const filteredTenders = latestTenders.filter(tender => {
    const matchesSearch = searchTerm === "" || 
                          tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tender.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tender.dept.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || tender.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesLocation = selectedLocation === "all" || tender.location.toLowerCase() === selectedLocation.toLowerCase();
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Get rows for search results (showing 5 at a time)
  const getSearchRows = () => {
    if (filteredTenders.length === 0) return [];
    const start = searchIdx.current % filteredTenders.length;
    const rows = [];
    for (let i = 0; i < 5; i++) {
      rows.push(filteredTenders[(start + i) % filteredTenders.length]);
    }
    return rows;
  };

  const [searchRows, setSearchRows] = useState(getSearchRows());

  // Auto-scroll for search results
  useEffect(() => {
    let id;
    const tick = () => {
      if (!searchPaused.current && searchResultsRef.current && filteredTenders.length > 0) {
        searchPos.current += SPEED;
        searchResultsRef.current.scrollTop = searchPos.current;
        if (searchPos.current >= ROW_H) {
          searchPos.current = 0;
          searchResultsRef.current.scrollTop = 0;
          searchIdx.current = (searchIdx.current + 1) % filteredTenders.length;
          setSearchRows(getSearchRows());
        }
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [filteredTenders.length]);

  // Update search rows when filters change
  useEffect(() => {
    searchIdx.current = 0;
    searchPos.current = 0;
    if (searchResultsRef.current) {
      searchResultsRef.current.scrollTop = 0;
    }
    setSearchRows(getSearchRows());
  }, [filteredTenders]);

  const getRows = (arr, start) =>
    Array.from({ length: arr.length }, (_, i) => arr[(start + i) % arr.length]);

  useEffect(() => {
    let id;
    const tick = () => {
      if (!t1Paused.current && t1Ref.current) {
        t1Pos.current += SPEED;
        t1Ref.current.scrollTop = t1Pos.current;
        if (t1Pos.current >= ROW_H) {
          t1Pos.current = 0;
          t1Ref.current.scrollTop = 0;
          t1Idx.current = (t1Idx.current + 1) % latestTenders.length;
          setT1Start(t1Idx.current);
        }
      }
      if (!t2Paused.current && t2Ref.current) {
        t2Pos.current += SPEED;
        t2Ref.current.scrollTop = t2Pos.current;
        if (t2Pos.current >= ROW_H) {
          t2Pos.current = 0;
          t2Ref.current.scrollTop = 0;
          t2Idx.current = (t2Idx.current + 1) % submittedBids.length;
          setT2Start(t2Idx.current);
        }
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="ep-wrap">

      {/* ═══ HEADER (from Login component) ═══ */}
      <nav className="ep-nav">
        <div className="ep-nav-inner">
          <div className="ep-logo">
            <img src={eProcLogo} alt="E-Procurement" className="ep-logo-img" />
          </div>
          <div className="ep-nav-links">
            <a href="/">Home</a>
            {/* <a href="#tenders">Tenders</a>
            <a href="#help">Help</a>
            <a href="#contact">Contact</a> */}
          </div>
          <div className="ep-header-buttons">
            <Link to="/login-registration?mode=register" className="ep-nav-cta ep-nav-cta-outline">
              <i className="bi bi-person-plus me-1" />Vendor Registration
            </Link>
            <Link to="/login-registration?mode=login" className="ep-nav-cta">
              <i className="bi bi-box-arrow-in-right me-1" />Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ STATS BAR (styled like login component) ═══ */}
      <div className="ep-stats">
        {[
          { icon: "bi-file-earmark-text", label: "Total Tenders",     value: "128", cls: ""      },
          { icon: "bi-folder2-open",      label: "Open Tenders",       value: "42",  cls: "green" },
          { icon: "bi-people",            label: "Registered Vendors", value: "560", cls: "blue"  },
          { icon: "bi-award",             label: "Contracts Awarded",  value: "87",  cls: "amber" },
        ].map((s) => (
          <div className="ep-stat" key={s.label}>
            <div className={`ep-stat-icon-wrap ${s.cls}`}>
              <i className={`bi ${s.icon}`} />
            </div>
            <div>
              <div className="ep-stat-label">{s.label}</div>
              <div className={`ep-stat-value ${s.cls}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ MAIN — 20-60-20 LAYOUT ═══ */}
      <div className="ep-main">

        {/* ── Left Sidebar (20%) ── */}
        <div className="ep-left-sidebar">
          
          {/* Search & Filter Panel */}
          <div className="ep-filter-card">
            <div className="ep-filter-title">
              <i className="bi bi-funnel-fill me-1" /> Search & Filter
            </div>
            <div className="ep-filter-item">
              <i className="bi bi-search" />
              <input 
                type="text" 
                placeholder="Search tender..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="ep-filter-item">
              <i className="bi bi-tag" />
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closing">Closing</option>
              </select>
            </div>
            <div className="ep-filter-item">
              <i className="bi bi-geo-alt" />
              <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                <option value="all">All Locations</option>
                <option value="delhi ncr">Delhi NCR</option>
                <option value="mumbai">Mumbai</option>
                <option value="bangalore">Bangalore</option>
                <option value="chennai">Chennai</option>
                <option value="kolkata">Kolkata</option>
              </select>
            </div>
          </div>

          {/* Search Results Panel with Auto-Scroll */}
          <div className="ep-search-results-card">
            <div className="ep-filter-title">
              <i className="bi bi-file-earmark-text me-1" /> Search Results
              <span className="ep-result-count">{filteredTenders.length} found</span>
            </div>
            <div className="ep-search-results-inner">
              <div
                className="ep-search-scroll"
                style={{ height: ROW_H * 5 }}
                ref={searchResultsRef}
                onMouseEnter={() => { searchPaused.current = true; }}
                onMouseLeave={() => { searchPaused.current = false; }}
              >
                <table className="ep-search-table">
                  <tbody>
  {filteredTenders.length > 0 ? (
    filteredTenders.map((tender, idx) => (
      <tr className="ep-search-tr" key={idx}>
        <td className="ep-search-id">{tender.id}</td>
        <td className="ep-search-title">{tender.title}</td>
        <td className="ep-search-status">
          <span className={`ep-badge ${tender.status === "Open" ? "ep-open" : "ep-closing"}`}>
            {tender.status}
          </span>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="3" className="ep-no-results">
        No matching tenders found
      </td>
    </tr>
  )}
</tbody>
                </table>
              </div>
            </div>
          </div>

          {/* About Company Panel */}
          {/* <div className="ep-about-card">
            <div className="ep-filter-title">
              <i className="bi bi-building me-1" /> About Company
            </div>
            <div className="ep-about-content">
              <div className="ep-company-logo">
                <i className="bi bi-cpu" />
              </div>
              <h4>Aarigen Technology Pvt Ltd</h4>
              <p>Leading provider of innovative technology solutions, specializing in e-governance, IT infrastructure, and digital transformation services.</p>
              <div className="ep-company-stats">
                <div><i className="bi bi-star-fill" /> ISO 9001:2024 Certified</div>
                <div><i className="bi bi-people-fill" /> 500+ Employees</div>
                <div><i className="bi bi-check-circle-fill" /> 200+ Projects Completed</div>
              </div>
            </div>
          </div> */}

        </div>

        {/* ── Main Content (60%) ── */}
        <div className="ep-main-content">

          {/* Latest Tenders */}
          <div className="ep-table-card">
            <div className="ep-table-title">
              <i className="bi bi-table me-2" />Latest Tenders
            </div>
            <div className="ep-table-inner">
              <table className="ep-table ep-thead-tbl">
                <colgroup>
                  <col style={{ width: "20%" }} /><col style={{ width: "33%" }} />
                  <col style={{ width: "14%" }} /><col style={{ width: "19%" }} /><col style={{ width: "14%" }} />
                </colgroup>
                <thead>
                  <tr><th>ID</th><th>Title</th><th>Dept</th><th>Deadline</th><th>Status</th></tr>
                </thead>
              </table>
              <div
                className="ep-tbody-scroll"
                style={{ height: ROW_H * VISIBLE }}
                ref={t1Ref}
                onMouseEnter={() => { t1Paused.current = true;  }}
                onMouseLeave={() => { t1Paused.current = false; }}
              >
                <table className="ep-table">
                  <colgroup>
                    <col style={{ width: "20%" }} /><col style={{ width: "33%" }} />
                    <col style={{ width: "14%" }} /><col style={{ width: "19%" }} /><col style={{ width: "14%" }} />
                  </colgroup>
                  <tbody>
                    {getRows(latestTenders, t1Start).map((t, i) => (
                      <tr className="ep-tr" key={i}>
                        <td className="ep-id">{t.id}</td>
                        <td>{t.title}</td>
                        <td>{t.dept}</td>
                        <td>{t.deadline}</td>
                        <td>
                          <span className={`ep-badge ${t.status === "Open" ? "ep-open" : "ep-closing"}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Submitted Bids */}
          <div className="ep-table-card">
            <div className="ep-table-title">
              <i className="bi bi-bar-chart-line me-2" />Submitted Bids — Last 6 Months
            </div>
            <div className="ep-table-inner">
              <table className="ep-table ep-thead-tbl">
                <colgroup>
                  <col style={{ width: "30%" }} /><col style={{ width: "25%" }} />
                  <col style={{ width: "22%" }} /><col style={{ width: "23%" }} />
                </colgroup>
                <thead>
                  <tr><th>Month</th><th>Submitted</th><th>Approved</th><th>Rejected</th></tr>
                </thead>
              </table>
              <div
                className="ep-tbody-scroll"
                style={{ height: ROW_H * VISIBLE }}
                ref={t2Ref}
                onMouseEnter={() => { t2Paused.current = true;  }}
                onMouseLeave={() => { t2Paused.current = false; }}
              >
                <table className="ep-table">
                  <colgroup>
                    <col style={{ width: "30%" }} /><col style={{ width: "25%" }} />
                    <col style={{ width: "22%" }} /><col style={{ width: "23%" }} />
                  </colgroup>
                  <tbody>
                    {getRows(submittedBids, t2Start).map((b, i) => (
                      <tr className="ep-tr" key={i}>
                        <td>{b.month}</td>
                        <td>{b.submitted}</td>
                        <td className="ep-approved">{b.approved}</td>
                        <td className="ep-rejected">{b.rejected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Sidebar (20%) ── */}
        <div className="ep-right-sidebar">
          <div className="ep-panel">
            <div className="ep-panel-title"><i className="bi bi-trophy me-1" />Tenders Awarded</div>
            <div className="ep-ticker-outer">
              <ul className="ep-ticker">
                {[...tendersAwarded, ...tendersAwarded].map((item, i) => (
                  <li key={i}><span className="ep-dot amber" />{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* <div className="ep-panel">
            <div className="ep-panel-title"><i className="bi bi-megaphone me-1" />News / Events</div>
            <div className="ep-ticker-outer">
              <ul className="ep-ticker" style={{ animationDelay: "-4s" }}>
                {[...newsEvents, ...newsEvents].map((item, i) => (
                  <li key={i}><span className="ep-dot blue" />{item}</li>
                ))}
              </ul>
            </div>
          </div> */}

          {/* <div className="ep-panel">
            <div className="ep-panel-title"><i className="bi bi-kanban me-1" />Projects Overview</div>
            <div className="ep-ticker-outer">
              <ul className="ep-ticker" style={{ animationDelay: "-8s" }}>
                {[...projectsOverview, ...projectsOverview].map((item, i) => (
                  <li key={i}>
                    <span className={`ep-dot ${item.includes("Active") ? "green" : "slate"}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div> */}

          {/* <div className="ep-alert">
            <i className="bi bi-exclamation-triangle-fill me-1" />
            Update KYC &amp; compliance docs before <strong>15-Apr-2026</strong>.
          </div> */}
        </div>

      </div>

      {/* ═══ FOOTER (from Login component) ═══ */}
      <footer className="ep-footer">
        <div className="ep-footer-inner">
          <span>© 2026 E-Procurement Portal. All rights reserved.</span>
          <div className="ep-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Help Desk</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPageProAutoScroll;