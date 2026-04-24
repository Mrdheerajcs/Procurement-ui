import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router-dom";
import apiClient from "../../auth/apiClient";
import "./dashboard.css";

const Dashboard = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const userRoles = auth?.roles || [];
  const isAdmin = userRoles.some(role => role === "PROCUREMENT_ADMIN");
  const username = auth?.username || "User";

  useEffect(() => {
    fetchDashboardData();
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? "/api/dashboard/admin" : "/api/dashboard/vendor";
      const res = await apiClient.get(endpoint);
      if (res.status === "SUCCESS") {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Vendor Dashboard
  if (!isAdmin) {
    if (loading) {
      return (
        <div className="ds-page">
          <div className="container-fluid text-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        </div>
      );
    }

    const stats = dashboardData?.vendorStats || {};
    const quickActions = dashboardData?.quickActions || [];
    const activities = dashboardData?.recentActivities || [];

    return (
      <div className="ds-page">
        <div className="container-fluid px-4 py-4">
          <div className="ds-page-header mb-4">
            <div>
              <h4 className="ds-page-title mb-1">Welcome back, {username}!</h4>
              <p className="ds-page-sub mb-0">Vendor Dashboard - Track your bids and contracts</p>
            </div>
          </div>

          {/* Vendor KPI cards - REAL DATA */}
          <div className="row g-3 mb-4">
            <div className="col-md-3 col-sm-6">
              <div className="ds-kpi-card kpi-blue">
                <div className="ds-kpi-icon"><i className="bi bi-search" /></div>
                <div className="ds-kpi-value">{stats.openTenders || 0}</div>
                <div className="ds-kpi-label">Open Tenders</div>
                <div className="ds-kpi-sub">New tenders available</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="ds-kpi-card kpi-purple">
                <div className="ds-kpi-icon"><i className="bi bi-send" /></div>
                <div className="ds-kpi-value">{stats.myBids || 0}</div>
                <div className="ds-kpi-label">My Bids</div>
                <div className="ds-kpi-sub">{stats.pendingEvaluations || 0} under evaluation</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="ds-kpi-card kpi-green">
                <div className="ds-kpi-icon"><i className="bi bi-trophy" /></div>
                <div className="ds-kpi-value">{stats.wonContracts || 0}</div>
                <div className="ds-kpi-label">Won Contracts</div>
                <div className="ds-kpi-sub">Total value: ₹{stats.totalContractValue?.toLocaleString() || 0}</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="ds-kpi-card kpi-orange">
                <div className="ds-kpi-icon"><i className="bi bi-clock-history" /></div>
                <div className="ds-kpi-value">{stats.pendingClarifications || 0}</div>
                <div className="ds-kpi-label">Pending Clarifications</div>
                <div className="ds-kpi-sub">Response needed</div>
              </div>
            </div>
          </div>

          {/* Quick Actions - REAL DATA */}
          <div className="row g-3">
            {quickActions.map((action, idx) => (
              <div key={idx} className="col-md-4">
                <div className="ds-card text-center p-4">
                  <i className={`bi ${action.icon} fs-1 text-primary`} />
                  <h5 className="mt-3">{action.title}</h5>
                  <p className="text-muted">{action.description}</p>
                  <button className="btn ds-btn-primary mt-2" onClick={() => navigate(action.link)}>
                    {action.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity - REAL DATA */}
          <div className="ds-card mt-4">
            <div className="ds-card-head">
              <span className="ds-card-title"><i className="bi bi-activity me-2 text-success" />Recent Activity</span>
            </div>
            <div className="ds-card-body p-0">
              <div className="ds-feed">
                {activities.length === 0 ? (
                  <div className="text-center py-4 text-muted">No recent activity</div>
                ) : (
                  activities.map((f, i) => (
                    <div key={i} className="ds-feed-item">
                      <div className="ds-feed-icon" style={{ background: f.color + "18", color: f.color }}>
                        <i className={`bi ${f.icon}`} />
                      </div>
                      <div className="flex-grow-1">
                        <div className="ds-feed-text">{f.text}</div>
                        <div className="ds-feed-time">{f.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (loading) {
    return (
      <div className="ds-page">
        <div className="container-fluid text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </div>
    );
  }

  const stats = dashboardData?.adminStats || {};
  const pipeline = dashboardData?.pipeline || [];
  const deptData = dashboardData?.departmentWise || [];
  const tendersList = dashboardData?.recentTenders || [];
  const deadlines = dashboardData?.upcomingDeadlines || [];
  const feed = dashboardData?.recentActivities || [];

  const filtered = activeTab === "all" ? tendersList : tendersList.filter(t =>
    t.status?.toLowerCase().replace(" ", "-") === activeTab
  );

  return (
    <div className="ds-page">
      <div className="container-fluid px-4 py-4">
        <div className="ds-page-header mb-4">
          <div>
            <h4 className="ds-page-title mb-1">Procurement Dashboard</h4>
            <p className="ds-page-sub mb-0">Overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn ds-btn-outline"><i className="bi bi-download me-1" />Export</button>
            <button className="btn ds-btn-primary" onClick={() => navigate("/publishtender")}>
              <i className="bi bi-plus-lg me-1" />New Tender
            </button>
          </div>
        </div>

        {/* Admin KPI cards - FIXED */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-sm-4 col-xl-2">
            <div className="ds-kpi-card kpi-blue">
              <div className="ds-kpi-icon"><i className="bi bi-file-earmark-text-fill" /></div>
              <div className="ds-kpi-value">{stats.totalTenders || 0}</div>
              <div className="ds-kpi-label">Total Tenders</div>
              <div className="ds-kpi-sub text-success">+{stats.publishedThisMonth || 0} this month</div>
            </div>
          </div>
          <div className="col-6 col-sm-4 col-xl-2">
            <div className="ds-kpi-card kpi-purple">
              <div className="ds-kpi-icon"><i className="bi bi-clipboard2-check-fill" /></div>
              <div className="ds-kpi-value">{stats.activeMprs || 0}</div>
              <div className="ds-kpi-label">Active MPRs</div>
              <div className="ds-kpi-sub text-warning">{stats.pendingApprovals || 0} pending approval</div>
            </div>
          </div>
          <div className="col-6 col-sm-4 col-xl-2">
            <div className="ds-kpi-card kpi-teal">
              <div className="ds-kpi-icon"><i className="bi bi-send-fill" /></div>
              <div className="ds-kpi-value">{stats.totalBids || 0}</div>
              <div className="ds-kpi-label">Total Bids</div>
              <div className="ds-kpi-sub text-info">{stats.pendingEvaluations || 0} under evaluation</div>
            </div>
          </div>
          <div className="col-6 col-sm-4 col-xl-2">
            <div className="ds-kpi-card kpi-orange">
              <div className="ds-kpi-icon"><i className="bi bi-bag-check-fill" /></div>
              <div className="ds-kpi-value">{stats.purchaseOrders || 0}</div>
              <div className="ds-kpi-label">Purchase Orders</div>
              <div className="ds-kpi-sub text-success">₹{(stats.totalPurchaseValue || 0).toLocaleString()} total</div>
            </div>
          </div>
          <div className="col-6 col-sm-4 col-xl-2">
            <div className="ds-kpi-card kpi-red">
              <div className="ds-kpi-icon"><i className="bi bi-people-fill" /></div>
              <div className="ds-kpi-value">{stats.qualifiedVendors || 0}</div>
              <div className="ds-kpi-label">Qualified Vendors</div>
              <div className="ds-kpi-sub text-success">Technically qualified</div>
            </div>
          </div>
          <div className="col-6 col-sm-4 col-xl-2">
            <div className="ds-kpi-card kpi-green">
              <div className="ds-kpi-icon"><i className="bi bi-journal-check" /></div>
              <div className="ds-kpi-value">{stats.activeContracts || 0}</div>
              <div className="ds-kpi-label">Active Contracts</div>
              <div className="ds-kpi-sub text-info">{stats.contractsEndingSoon || 0} ending this quarter</div>
            </div>
          </div>
        </div>

        {/* Tender pipeline */}
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

        {/* Main content */}
        <div className="row g-3 mb-4">
          {/* Left column */}
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
                      <div className="ds-dept-bar-fill" style={{ width: `${d.percentage}%`, background: d.color }} />
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
                  {["all", "published", "evaluation", "bid-open", "awarded", "closed"].map(t => (
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
                      <tr><th>Tender ID</th><th>Title</th><th>Published</th><th>Deadline</th><th>Status</th><th className="text-center">Bids</th></tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-5 text-muted">No tenders found</td></tr>
                      ) : (
                        filtered.map((t, i) => (
                          <tr key={i}>
                            <td className="fw-semibold text-primary">{t.tenderNo}</td>
                            <td>{t.title}</td>
                            <td className="text-muted">{t.publishedDate}</td>
                            <td className="text-muted">{t.deadline}</td>
                            <td><span className={`ds-badge ${t.statusClass}`}>{t.status}</span></td>
                            <td className="text-center fw-semibold">{t.bids}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="col-xl-4 col-12 d-flex flex-column gap-3">
            {/* Upcoming Deadlines */}
            <div className="ds-card">
              <div className="ds-card-head">
                <span className="ds-card-title"><i className="bi bi-alarm-fill me-2 text-danger" />Upcoming Deadlines</span>
                <a href="#" className="ds-link">View all</a>
              </div>
              <div className="ds-card-body p-0">
                {deadlines.length === 0 ? (
                  <div className="text-center py-4 text-muted">No upcoming deadlines</div>
                ) : (
                  deadlines.map((d, i) => (
                    <div key={i} className={`ds-deadline-item ds-dl-${d.urgency}`}>
                      <div className="ds-dl-dot" />
                      <div className="flex-grow-1">
                        <div className="ds-dl-title">{d.id} — {d.event}</div>
                        <div className="ds-dl-date">{d.date}</div>
                      </div>
                      <div className={`ds-dl-badge ds-dl-${d.urgency}`}>{d.left}d</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activity feed */}
            <div className="ds-card flex-grow-1">
              <div className="ds-card-head">
                <span className="ds-card-title"><i className="bi bi-activity me-2 text-success" />Activity Feed</span>
              </div>
              <div className="ds-card-body p-0">
                <div className="ds-feed">
                  {feed.length === 0 ? (
                    <div className="text-center py-4 text-muted">No recent activity</div>
                  ) : (
                    feed.map((f, i) => (
                      <div key={i} className="ds-feed-item">
                        <div className="ds-feed-icon" style={{ background: f.color + "18", color: f.color }}>
                          <i className={`bi ${f.icon}`} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="ds-feed-text">{f.text}</div>
                          <div className="ds-feed-time">{f.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;