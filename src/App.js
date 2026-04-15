import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";
import Chatbot from "./Components/ChatBot";

// Layout
const Layout = lazy(() => import("./Views/layout"));

// Auth Pages
const Login = lazy(() => import("./Views/Login"));
const ForceChangePassword = lazy(() => import("./Components/ForceChangePassword"));
const ProcurementLanding = lazy(() => import("./Components/ProcurementLanding"));

// Dashboard
const Dashboard = lazy(() => import("./Views/Dashboard"));

// MPR Modules
const MPRManagement = lazy(() => import("./Views/Models/MPRManagement"));
const CreateMPR = lazy(() => import("./Views/CreateMPR"));
const MPRApproval = lazy(() => import("./Views/MPRApproval"));
const MPRHistory = lazy(() => import("./Views/MPRHistory"));

// Tender Modules
const PublishTender = lazy(() => import("./Views/pages/PublishTender"));
const SearchTender = lazy(() => import("./Views/pages/SearchTender"));
const TenderApproval = lazy(() => import("./Views/pages/TenderApproval"));

// Evaluation Modules (NEW)
const TechnicalEvaluation = lazy(() => import("./Views/pages/TechnicalEvaluation"));
const CommercialEvaluation = lazy(() => import("./Views/pages/CommercialEvaluation"));

// Vendor Modules
const BidSubmission = lazy(() => import("./Views/pages/BidSubmission"));
const VendorContracts = lazy(() => import("./Views/VendorContracts"));

// Profile & Admin
const Profile = lazy(() => import("./Views/Profile"));
const AuditLogs = lazy(() => import("./Views/pages/AuditLogs"));
const MPRApprovalLevels = lazy(() => import("./Views/pages/MPRApprovalLevels"));



const Loader = () => (
  <div style={{ textAlign: "center", marginTop: "50px" }}>
    <div className="spinner-border text-primary" role="status" />
    <p className="mt-2">Loading...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/tenders" element={<ProcurementLanding />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/force-change-password" element={<ForceChangePassword />} />

              <Route element={<Layout />}>
                {/* Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* MPR Management */}
                <Route path="/mpr-list" element={<MPRManagement />} />
                <Route path="/creatempr" element={<CreateMPR />} />
                <Route path="/mpr-approval" element={<MPRApproval />} />
                <Route path="/mpr-history" element={<MPRHistory />} />
                <Route path="/mpr-approval-levels" element={<MPRApprovalLevels />} />

                {/* Tender Management */}
                <Route path="/publishtender" element={<PublishTender />} />
                <Route path="/tender-approval" element={<TenderApproval />} />
                <Route path="/searchtender" element={<SearchTender />} />

                {/* Evaluation (NEW) */}
                <Route path="/technical-evaluation" element={<TechnicalEvaluation />} />
                <Route path="/commercial-evaluation" element={<CommercialEvaluation />} />

                {/* Vendor Portal */}
                <Route path="/bid-submission/:tenderId?" element={<BidSubmission />} />
                <Route path="/vendor-contracts" element={<VendorContracts />} />

                {/* Profile & Admin */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
              </Route>
            </Route>
          </Routes>
          <Chatbot />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;