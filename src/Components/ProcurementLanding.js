import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./LandingPageProAutoScroll.css";
import apiClient from "../auth/apiClient";
import eProcLogo from "../assets/images/e-proc-logo.png";

const LandingPageProAutoScroll = () => {
  const [landingData, setLandingData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Search filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const ROW_H = 38;
  const VISIBLE = 4;
  const SPEED = 0.55;

  const t1Ref = useRef(null);
  const t2Ref = useRef(null);
  const t1Paused = useRef(false);
  const t2Paused = useRef(false);
  const t1Pos = useRef(0);
  const t2Pos = useRef(0);
  const t1Idx = useRef(0);
  const t2Idx = useRef(0);

  const [t1Start, setT1Start] = useState(0);
  const [t2Start, setT2Start] = useState(0);
  
  // Auto-scroll ref for search results
  const searchResultsRef = useRef(null);
  const searchPaused = useRef(false);
  const searchPos = useRef(0);
  const searchIdx = useRef(0);

  // Fetch real data from backend
  useEffect(() => {
    fetchLandingData();
  }, []);

  const fetchLandingData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/landing/data");
      if (res.status === "SUCCESS") {
        setLandingData(res.data);
      }
    } catch (err) {
      console.error("Error fetching landing data:", err);
      // Fallback to empty data structure
      setLandingData({
        stats: { totalTenders: 0, openTenders: 0, registeredVendors: 0, contractsAwarded: 0, totalProcurementValue: 0 },
        latestTenders: [],
        submittedBids: [],
        tendersAwarded: [],
        newsEvents: [],
        projectsOverview: []
      });
    } finally {
      setLoading(false);
    }
  };

  const latestTenders = landingData?.latestTenders || [];
  const submittedBids = landingData?.submittedBids || [];
  const tendersAwarded = landingData?.tendersAwarded || [];
  const newsEvents = landingData?.newsEvents || [];
  const projectsOverview = landingData?.projectsOverview || [];
  const stats = landingData?.stats || {};

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0 Cr";
    const crores = amount / 10000000;
    if (crores >= 1) return `₹${crores.toFixed(1)} Cr`;
    return `₹${(amount / 100000).toFixed(0)} L`;
  };

  // Filtered tenders based on search, status, and location
  const filteredTenders = latestTenders.filter(tender => {
    const matchesSearch = searchTerm === "" || 
                          tender.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tender.tenderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tender.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || tender.status?.toLowerCase() === selectedStatus.toLowerCase();
    const matchesLocation = selectedLocation === "all" || tender.location?.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getRows = (arr, start) =>
    Array.from({ length: arr.length }, (_, i) => arr[(start + i) % arr.length]);

  // Auto-scroll for main tables
  useEffect(() => {
    let id;
    const tick = () => {
      if (!t1Paused.current && t1Ref.current && latestTenders.length > 0) {
        t1Pos.current += SPEED;
        t1Ref.current.scrollTop = t1Pos.current;
        if (t1Pos.current >= ROW_H) {
          t1Pos.current = 0;
          t1Ref.current.scrollTop = 0;
          t1Idx.current = (t1Idx.current + 1) % latestTenders.length;
          setT1Start(t1Idx.current);
        }
      }
      if (!t2Paused.current && t2Ref.current && submittedBids.length > 0) {
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
  }, [latestTenders.length, submittedBids.length]);

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
        }
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [filteredTenders.length]);

  if (loading) {
    return (
      <div className="ep-wrap">
        <nav className="ep-nav">
          <div className="ep-nav-inner">
            <div className="ep-logo">
              <img src={eProcLogo} alt="E-Procurement" className="ep-logo-img" />
            </div>
          </div>
        </nav>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Loading procurement portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-wrap">

      {/* HEADER */}
      <nav className="ep-nav">
        <div className="ep-nav-inner">
          <div className="ep-logo">
            <img src={eProcLogo} alt="E-Procurement" className="ep-logo-img" />
          </div>
          <div className="ep-nav-links">
            <a href="/">Home</a>
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

      {/* STATS BAR - REAL DATA */}
      <div className="ep-stats">
        <div className="ep-stat">
          <div className="ep-stat-icon-wrap"><i className="bi bi-file-earmark-text" /></div>
          <div><div className="ep-stat-label">Total Tenders</div><div className="ep-stat-value">{stats.totalTenders || 0}</div></div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-icon-wrap green"><i className="bi bi-folder2-open" /></div>
          <div><div className="ep-stat-label">Open Tenders</div><div className="ep-stat-value green">{stats.openTenders || 0}</div></div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-icon-wrap blue"><i className="bi bi-people" /></div>
          <div><div className="ep-stat-label">Registered Vendors</div><div className="ep-stat-value blue">{stats.registeredVendors || 0}</div></div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-icon-wrap amber"><i className="bi bi-award" /></div>
          <div><div className="ep-stat-label">Contracts Awarded</div><div className="ep-stat-value amber">{stats.contractsAwarded || 0}</div></div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="ep-main">

        {/* Left Sidebar */}
        <div className="ep-left-sidebar">
          
          {/* Search & Filter Panel */}
          <div className="ep-filter-card">
            <div className="ep-filter-title">
              <i className="bi bi-funnel-fill me-1" /> Search & Filter
            </div>
            <div className="ep-filter-item">
              <i className="bi bi-search" />
              <input type="text" placeholder="Search tender..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

          {/* Search Results Panel */}
          <div className="ep-search-results-card">
            <div className="ep-filter-title">
              <i className="bi bi-file-earmark-text me-1" /> Search Results
              <span className="ep-result-count">{filteredTenders.length} found</span>
            </div>
            <div className="ep-search-results-inner">
              <div className="ep-search-scroll" style={{ height: ROW_H * 5 }} ref={searchResultsRef}
                   onMouseEnter={() => { searchPaused.current = true; }}
                   onMouseLeave={() => { searchPaused.current = false; }}>
                <table className="ep-search-table">
                  <tbody>
                    {filteredTenders.length > 0 ? (
                      filteredTenders.map((tender, idx) => (
                        <tr className="ep-search-tr" key={idx}>
                          <td className="ep-search-id">{tender.tenderId}</td>
                          <td className="ep-search-title">{tender.title}</td>
                          <td className="ep-search-status">
                            <span className={`ep-badge ${tender.status === "Open" ? "ep-open" : "ep-closing"}`}>
                              {tender.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3" className="ep-no-results">No matching tenders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ep-main-content">

          {/* Latest Tenders - REAL DATA */}
          <div className="ep-table-card">
            <div className="ep-table-title">
              <i className="bi bi-table me-2" />Latest Tenders
            </div>
            <div className="ep-table-inner">
              <table className="ep-table ep-thead-tbl">
                <colgroup><col style={{ width: "20%" }} /><col style={{ width: "33%" }} /><col style={{ width: "14%" }} /><col style={{ width: "19%" }} /><col style={{ width: "14%" }} /></colgroup>
                <thead><tr><th>ID</th><th>Title</th><th>Dept</th><th>Deadline</th><th>Status</th></tr></thead>
              </table>
              <div className="ep-tbody-scroll" style={{ height: ROW_H * VISIBLE }} ref={t1Ref}
                   onMouseEnter={() => { t1Paused.current = true; }}
                   onMouseLeave={() => { t1Paused.current = false; }}>
                <table className="ep-table">
                  <colgroup><col style={{ width: "20%" }} /><col style={{ width: "33%" }} /><col style={{ width: "14%" }} /><col style={{ width: "19%" }} /><col style={{ width: "14%" }} /></colgroup>
                  <tbody>
                    {latestTenders.length > 0 ? getRows(latestTenders, t1Start).map((t, i) => (
                      <tr className="ep-tr" key={i}>
                        <td className="ep-id">{t.tenderId}</td>
                        <td>{t.title}</td>
                        <td>{t.department}</td>
                        <td>{t.deadline}</td>
                        <td><span className={`ep-badge ${t.status === "Open" ? "ep-open" : "ep-closing"}`}>{t.status}</span></td>
                      </tr>
                    )) : <tr><td colSpan="5" className="text-center">No tenders available</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Submitted Bids - REAL DATA */}
          <div className="ep-table-card">
            <div className="ep-table-title">
              <i className="bi bi-bar-chart-line me-2" />Submitted Bids — Last 12 Months
            </div>
            <div className="ep-table-inner">
              <table className="ep-table ep-thead-tbl">
                <colgroup><col style={{ width: "30%" }} /><col style={{ width: "25%" }} /><col style={{ width: "22%" }} /><col style={{ width: "23%" }} /></colgroup>
                <thead><tr><th>Month</th><th>Submitted</th><th>Approved</th><th>Rejected</th></tr></thead>
              </table>
              <div className="ep-tbody-scroll" style={{ height: ROW_H * VISIBLE }} ref={t2Ref}
                   onMouseEnter={() => { t2Paused.current = true; }}
                   onMouseLeave={() => { t2Paused.current = false; }}>
                <table className="ep-table">
                  <colgroup><col style={{ width: "30%" }} /><col style={{ width: "25%" }} /><col style={{ width: "22%" }} /><col style={{ width: "23%" }} /></colgroup>
                  <tbody>
                    {submittedBids.length > 0 ? getRows(submittedBids, t2Start).map((b, i) => (
                      <tr className="ep-tr" key={i}>
                        <td>{b.month}</td>
                        <td>{b.submitted}</td>
                        <td className="ep-approved">{b.approved}</td>
                        <td className="ep-rejected">{b.rejected}</td>
                      </tr>
                    )) : <tr><td colSpan="4" className="text-center">No bid data available</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="ep-right-sidebar">
          <div className="ep-panel">
            <div className="ep-panel-title"><i className="bi bi-trophy me-1" />Tenders Awarded</div>
            <div className="ep-ticker-outer">
              <ul className="ep-ticker">
                {tendersAwarded.length > 0 ? (
                  [...tendersAwarded, ...tendersAwarded].map((item, i) => (
                    <li key={i}><span className="ep-dot amber" />{item}</li>
                  ))
                ) : (
                  <li>No awards yet</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
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