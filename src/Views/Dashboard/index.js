import React, { useState } from "react";
import "./dashboard.css";

const kpis = [
  { icon: "bi-file-earmark-text-fill", label: "Total Tenders",    value: "12", sub: "+3 this month",      subColor: "text-success",  gradient: "kpi-blue"   },
  { icon: "bi-clipboard2-check-fill",  label: "Active MPRs",      value: "8",  sub: "5 pending approval", subColor: "text-warning",  gradient: "kpi-purple" },
  { icon: "bi-send-fill",              label: "Total Bids",       value: "24", sub: "12 under evaluation",subColor: "text-info",     gradient: "kpi-teal"   },
  { icon: "bi-bag-check-fill",         label: "Purchase Orders",  value: "9",  sub: "â‚¹2.8 Cr total",     subColor: "text-success",  gradient: "kpi-orange" },
  { icon: "bi-boxes",                  label: "Inventory Items",  value: "156",sub: "12 low-stock alerts",subColor: "text-danger",   gradient: "kpi-red"    },
  { icon: "bi-journal-check",          label: "Active Contracts", value: "5",  sub: "2 ending this Qtr", subColor: "text-info",     gradient: "kpi-green"  },
];

const pipeline = [
  { label: "Draft",      count: 2,  color: "#94a3b8" },
  { label: "Published",  count: 4,  color: "#3b82f6" },
  { label: "Bid Open",   count: 2,  color: "#f59e0b" },
  { label: "Evaluation", count: 3,  color: "#8b5cf6" },
  { label: "Awarded",    count: 2,  color: "#10b981" },
  { label: "Closed",     count: 1,  color: "#6b7280" },
];

const deptData = [
  { dept: "PWD",     pct: 35, tenders: 4, color: "#3b82f6" },
  { dept: "Health",  pct: 25, tenders: 3, color: "#10b981" },
  { dept: "IT",      pct: 20, tenders: 2, color: "#06b6d4" },
  { dept: "Admin",   pct: 12, tenders: 2, color: "#f59e0b" },
  { dept: "Finance", pct: 8,  tenders: 1, color: "#8b5cf6" },
];

const tenders = [
  { id: "TND/2025/001", title: "Construction Material Supply", published: "Feb 10", deadline: "Mar 20", status: "Published",  bids: 8,  statusClass: "ds-badge-success" },
  { id: "TND/2025/002", title: "Medical Equipment Supply",     published: "Mar 01", deadline: "Mar 25", status: "Evaluation", bids: 5,  statusClass: "ds-badge-info"    },
  { id: "TND/2025/003", title: "IT Hardware Procurement",      published: "Mar 05", deadline: "Mar 30", status: "Published",  bids: 12, statusClass: "ds-badge-success" },
  { id: "TND/2025/004", title: "Office Furniture Supply",      published: "Mar 10", deadline: "Apr 05", status: "Draft",      bids: 0,  statusClass: "ds-badge-muted"   },
  { id: "TND/2025/005", title: "Laboratory Equipment",         published: "Feb 25", deadline: "Mar 28", status: "Awarded",    bids: 6,  statusClass: "ds-badge-purple"  },
  { id: "TND/2025/006", title: "Vehicle Fleet Management",     published: "Mar 12", deadline: "Apr 10", status: "Bid Open",   bids: 4,  statusClass: "ds-badge-warning" },
  { id: "TND/2025/007", title: "Cleaning Services Contract",   published: "Feb 28", deadline: "Mar 22", status: "Closed",     bids: 10, statusClass: "ds-badge-muted"   },
  { id: "TND/2025/008", title: "Security Services",            published: "Mar 15", deadline: "Apr 12", status: "Published",  bids: 3,  statusClass: "ds-badge-success" },
];

const feed = [
  { icon: "bi-file-earmark-plus",  color: "#3b82f6", text: "New tender published: TND/2025/008",  time: "2 h ago"    },
  { icon: "bi-send",               color: "#06b6d4", text: "Bid submitted for TND/2025/003",       time: "5 h ago"    },
  { icon: "bi-check2-circle",      color: "#f59e0b", text: "MPR/2025/002 approved by Finance",     time: "Yesterday"  },
  { icon: "bi-receipt",            color: "#8b5cf6", text: "PO/2025/001 issued to UltraTech",      time: "Yesterday"  },
  { icon: "bi-alarm",              color: "#ef4444", text: "Deadline alert: TND/2025/002 in 3 days",time: "1 day ago"  },
  { icon: "bi-box-seam",           color: "#10b981", text: "Inventory restocked: Medical supplies",time: "2 days ago" },
];

const deadlines = [
  { id: "TND/2025/002", event: "Bid Deadline",          date: "Mar 25, 2025", left: 3,  urgency: "high"   },
  { id: "TND/2025/001", event: "Technical Evaluation",  date: "Mar 28, 2025", left: 6,  urgency: "medium" },
  { id: "PO/2025/001",  event: "Delivery Due",          date: "Apr 30, 2025", left: 39, urgency: "low"    },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all" ? tenders : tenders.filter(t => t.status.toLowerCase().replace(" ","-") === activeTab);

  return (
    <>


            <div className="ds-page">
              <div className="container-fluid px-4 py-4">
                {/* â”€â”€ Page header â”€â”€ */}
                <div className="ds-page-header mb-4">
                  <div>
                    <h4 className="ds-page-title mb-1">Procurement Dashboard</h4>
                    <p className="ds-page-sub mb-0">Overview for April 2026</p>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn ds-btn-outline"><i className="bi bi-download me-1" />Export</button>
                    <button className="btn ds-btn-primary"><i className="bi bi-plus-lg me-1" />New Tender</button>
                  </div>
                </div>

                {/* â”€â”€ KPI strip â”€â”€ */}
                <div className="row g-3 mb-4">
                  {kpis.map((k, i) => (
                    <div key={i} className="col-6 col-sm-4 col-xl-2">
                      <div className={`ds-kpi-card ${k.gradient}`}>
                        <div className="ds-kpi-icon">
                          <i className={`bi ${k.icon}`} />
                        </div>
                        <div className="ds-kpi-value">{k.value}</div>
                        <div className="ds-kpi-label">{k.label}</div>
                        <div className={`ds-kpi-sub ${k.subColor}`}>{k.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* â”€â”€ Tender pipeline â”€â”€ */}
                <div className="row g-3 mb-4">
                  <div className="col-12">
                    <div className="ds-card">
                      <div className="ds-card-head">
                        <span className="ds-card-title"><i className="bi bi-diagram-3-fill me-2 text-primary" />Tender Pipeline</span>
                      </div>
                      <div className="ds-card-body">
                        <div className="ds-pipeline">
                          {pipeline.map((p, i) => (
                            <React.Fragment key={i}>
                              <div className="ds-pipe-step">
                                <div className="ds-pipe-bubble" style={{ background: p.color }}>{p.count}</div>
                                <div className="ds-pipe-label">{p.label}</div>
                              </div>
                              {i < pipeline.length - 1 && <div className="ds-pipe-arrow"><i className="bi bi-chevron-right" /></div>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* â”€â”€ Main 3-col grid â”€â”€ */}
                {/* â”€â”€ Tenders table + side panel â”€â”€ */}
                <div className="row g-3 mb-4">
                  {/* LEFT: Department chart + Tender table */}
                  <div className="col-xl-8 col-12 d-flex flex-column gap-3">

                    {/* Department breakdown */}
                    <div className="ds-card">
                      <div className="ds-card-head">
                        <span className="ds-card-title"><i className="bi bi-bar-chart-fill me-2 text-primary" />Tenders by Department</span>
                      </div>
                      <div className="ds-card-body">
                        {deptData.map((d, i) => (
                          <div key={i} className="ds-dept-row">
                            <span className="ds-dept-name">{d.dept}</span>
                            <div className="ds-dept-bar-track">
                              <div className="ds-dept-bar-fill" style={{ width: `${d.pct}%`, background: d.color }} />
                            </div>
                            <span className="ds-dept-count">{d.tenders} tenders</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tenders table */}
                    <div className="ds-card">
                      <div className="ds-card-head">
                        <span className="ds-card-title"><i className="bi bi-table me-2 text-primary" />Recent Tenders</span>
                        <div className="ds-tab-group">
                          {["all","published","evaluation","bid-open","awarded","closed"].map(t => (
                            <button key={t} className={`ds-tab ${activeTab === t ? "active" : ""}`}
                              onClick={() => setActiveTab(t)}>
                              {t === "all" ? "All" : t.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="ds-card-body p-0">
                        <div className="table-responsive">
                          <table className="table ds-table mb-0">
                            <thead>
                              <tr>
                                <th>Tender ID</th>
                                <th>Title</th>
                                <th>Published</th>
                                <th>Deadline</th>
                                <th>Status</th>
                                <th className="text-center">Bids</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filtered.map((t, i) => (
                                <tr key={i}>
                                  <td className="fw-semibold text-primary">{t.id}</td>
                                  <td>{t.title}</td>
                                  <td className="text-muted">{t.published}</td>
                                  <td className="text-muted">{t.deadline}</td>
                                  <td><span className={`ds-badge ${t.statusClass}`}>{t.status}</span></td>
                                  <td className="text-center fw-semibold">{t.bids}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Deadlines + Activity feed */}
                  <div className="col-xl-4 col-12 d-flex flex-column gap-3">

                    {/* Upcoming Deadlines */}
                    <div className="ds-card">
                      <div className="ds-card-head">
                        <span className="ds-card-title"><i className="bi bi-alarm-fill me-2 text-danger" />Upcoming Deadlines</span>
                        <a href="#" className="ds-link">View all</a>
                      </div>
                      <div className="ds-card-body p-0">
                        {deadlines.map((d, i) => (
                          <div key={i} className={`ds-deadline-item ds-dl-${d.urgency}`}>
                            <div className="ds-dl-dot" />
                            <div className="flex-grow-1">
                              <div className="ds-dl-title">{d.id} â€” {d.event}</div>
                              <div className="ds-dl-date">{d.date}</div>
                            </div>
                            <div className={`ds-dl-badge ds-dl-${d.urgency}`}>{d.left}d</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Activity feed */}
                    <div className="ds-card flex-grow-1">
                      <div className="ds-card-head">
                        <span className="ds-card-title"><i className="bi bi-activity me-2 text-success" />Activity Feed</span>
                      </div>
                      <div className="ds-card-body p-0">
                        <div className="ds-feed">
                          {feed.map((f, i) => (
                            <div key={i} className="ds-feed-item">
                              <div className="ds-feed-icon" style={{ background: f.color + "18", color: f.color }}>
                                <i className={`bi ${f.icon}`} />
                              </div>
                              <div className="flex-grow-1">
                                <div className="ds-feed-text">{f.text}</div>
                                <div className="ds-feed-time">{f.time}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="ds-card">
                      <div className="ds-card-head">
                        <span className="ds-card-title"><i className="bi bi-lightning-fill me-2 text-warning" />Quick Actions</span>
                      </div>
                      <div className="ds-card-body d-flex flex-column gap-2">
                        <button className="btn ds-btn-primary w-100"><i className="bi bi-plus-circle me-2" />New Tender</button>
                        <button className="btn ds-btn-outline w-100"><i className="bi bi-file-earmark-pdf me-2" />Generate Report</button>
                        <button className="btn ds-btn-outline w-100"><i className="bi bi-graph-up me-2" />View Analytics</button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* â”€â”€ end â”€â”€ */}
              </div>
            </div>
    </>
  );
};

export default Dashboard;
