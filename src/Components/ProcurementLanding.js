import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./LandingPageProAutoScroll.css";

const LandingPageProAutoScroll = () => {
  const latestTenders = [
    { id: "EP/2026/101", title: "Data Center Equipment Supply",    dept: "IT",        deadline: "18-Apr-2026", status: "Open"    },
    { id: "EP/2026/102", title: "Security Surveillance System",    dept: "Security",  deadline: "22-Apr-2026", status: "Closing" },
    { id: "EP/2026/103", title: "Office Furniture Procurement",    dept: "Admin",     deadline: "25-Apr-2026", status: "Open"    },
    { id: "EP/2026/104", title: "Network Upgrade",                 dept: "IT",        deadline: "30-Apr-2026", status: "Open"    },
    { id: "EP/2026/105", title: "Software License Renewal",        dept: "IT",        deadline: "05-May-2026", status: "Closing" },
    { id: "EP/2026/106", title: "CCTV Installation",               dept: "Security",  deadline: "10-May-2026", status: "Open"    },
    { id: "EP/2026/107", title: "UPS Maintenance",                 dept: "Facilities",deadline: "12-May-2026", status: "Open"    },
  ];

  const submittedBids = [
    { month: "Oct 2025", submitted: 12, approved: 7,  rejected: 5 },
    { month: "Nov 2025", submitted: 15, approved: 10, rejected: 5 },
    { month: "Dec 2025", submitted: 18, approved: 12, rejected: 6 },
    { month: "Jan 2026", submitted: 20, approved: 15, rejected: 5 },
    { month: "Feb 2026", submitted: 22, approved: 16, rejected: 6 },
    { month: "Mar 2026", submitted: 25, approved: 18, rejected: 7 },
    { month: "Apr 2026", submitted: 10, approved: 7,  rejected: 3 },
  ];

  const tendersAwarded   = ["EP/2025/099 - Server Maintenance","EP/2025/100 - LAN Setup","EP/2026/101 - Data Center Supply","EP/2026/102 - Security Systems","EP/2026/103 - Office Equipment","EP/2026/104 - Network Upgrade","EP/2026/105 - Software Licenses"];
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
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

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

  // Filtered tenders based on search and status
  const filteredTenders = latestTenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tender.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tender.dept.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || tender.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="ep-wrap">

      {/* ═══ HEADER ═══ */}
      <header className="ep-header">
        <div className="ep-header-left">
          <div className="ep-logo-icon"><i className="bi bi-grid-1x2-fill" /></div>
          <div>
            <div className="ep-header-title">e-Procurement System</div>
            <div className="ep-header-sub">Ministry of Electronics &amp; IT</div>
          </div>
        </div>

        <div className="ep-header-right">
          <Link to="/login-registration?mode=register" className="ep-btn ep-btn-outline">
            <i className="bi bi-person-plus me-1" />Vendor Registration
          </Link>
          <Link to="/login-registration?mode=login" className="ep-btn ep-btn-primary">
            <i className="bi bi-box-arrow-in-right me-1" />Login
          </Link>
        </div>
      </header>

      {/* ═══ STATS ═══ */}
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

      {/* ═══ MAIN — Left & Right equal width ═══ */}
      <div className="ep-main">

        {/* ── Left: Filter Panel + Tables ── */}
        <div className="ep-left">
          
          {/* NEW: Filter/Search Panel */}
          <div className="ep-filter-panel">
            <div className="ep-filter-title">
              <i className="bi bi-funnel-fill me-1" /> Filter Tenders
            </div>
            <div className="ep-filter-controls">
              <div className="ep-filter-search">
                <i className="bi bi-search" />
                <input 
                  type="text" 
                  placeholder="Search by ID, title or department..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="ep-filter-selects">
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="closing">Closing</option>
                </select>
                <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                  <option value="all">All Locations</option>
                  <option value="delhi">Delhi NCR</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="chennai">Chennai</option>
                  <option value="kolkata">Kolkata</option>
                </select>
              </div>
            </div>
            <div className="ep-filter-stats">
              <span><i className="bi bi-file-text" /> {filteredTenders.length} tenders found</span>
              <button className="ep-filter-clear" onClick={() => { setSearchTerm(""); setSelectedStatus("all"); setSelectedLocation("all"); }}>
                <i className="bi bi-x-circle" /> Clear all
              </button>
            </div>
          </div>

          {/* Latest Tenders (Filtered) */}
          <div className="ep-table-card">
            <div className="ep-table-title">
              <i className="bi bi-table me-2" />Latest Tenders
              {searchTerm && <span className="ep-filter-badge">Filtered: {searchTerm}</span>}
            </div>
            <div className="ep-table-inner">
              <table className="ep-table ep-thead-tbl">
                <colgroup>
                  <col style={{ width: "18%" }} /><col style={{ width: "35%" }} />
                  <col style={{ width: "15%" }} /><col style={{ width: "18%" }} /><col style={{ width: "14%" }} />
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
                    <col style={{ width: "18%" }} /><col style={{ width: "35%" }} />
                    <col style={{ width: "15%" }} /><col style={{ width: "18%" }} /><col style={{ width: "14%" }} />
                  </colgroup>
                  <tbody>
                    {filteredTenders.length > 0 ? (
                      getRows(filteredTenders, t1Start % filteredTenders.length).map((t, i) => (
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
                      ))
                    ) : (
                      <tr className="ep-tr"><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No tenders found</td></tr>
                    )}
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

        {/* ── Right: Panels ── */}
        <div className="ep-right">
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

          <div className="ep-panel">
            <div className="ep-panel-title"><i className="bi bi-megaphone me-1" />News / Events</div>
            <div className="ep-ticker-outer">
              <ul className="ep-ticker" style={{ animationDelay: "-4s" }}>
                {[...newsEvents, ...newsEvents].map((item, i) => (
                  <li key={i}><span className="ep-dot blue" />{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ep-panel">
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
          </div>

          <div className="ep-alert">
            <i className="bi bi-exclamation-triangle-fill me-1" />
            Update KYC &amp; compliance docs before <strong>15-Apr-2026</strong>.
          </div>
        </div>

      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="ep-footer">
        © 2026 e-Procurement Portal &nbsp;|&nbsp; NIC &nbsp;|&nbsp; Government of India
      </footer>

    </div>
  );
};

export default LandingPageProAutoScroll;