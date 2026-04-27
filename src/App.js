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
const Unauthorized = lazy(() => import("./Views/Unauthorized"));

// Dashboard
const Dashboard = lazy(() => import("./Views/Dashboard"));

// ==================== MPR MODULES ====================
const CreateMPR = lazy(() => import("./Views/CreateMPR"));
const MPRApproval = lazy(() => import("./Views/MPRApproval"));
const MPRHistory = lazy(() => import("./Views/MPRHistory"));
const MPRApprovalLevels = lazy(() => import("./Views/pages/MPRApprovalLevels"));
const MPRManagement = lazy(() => import("./Views/Models/MPRManagement")); // MPR List

// ==================== TENDER MODULES ====================
const PublishTender = lazy(() => import("./Views/pages/PublishTender"));
const SearchTender = lazy(() => import("./Views/pages/SearchTender"));
const TenderApproval = lazy(() => import("./Views/pages/TenderApproval"));
const AdminContractManagement = lazy(() => import("./Views/pages/AdminContractManagement"));

// ==================== EVALUATION MODULES ====================
const TechnicalEvaluation = lazy(() => import("./Views/pages/TechnicalEvaluation"));
const CommercialEvaluation = lazy(() => import("./Views/pages/CommercialEvaluation"));

// ==================== VENDOR MODULES ====================
const BidSubmission = lazy(() => import("./Views/pages/BidSubmission"));
const VendorContracts = lazy(() => import("./Views/VendorContracts"));
const ClarificationResponse = lazy(() => import("./Views/pages/ClarificationResponse"));
const PendingClarifications = lazy(() => import("./Views/pages/PendingClarifications"));
const MyBids = lazy(() => import("./Views/pages/MyBids"));
const TenderResults = lazy(() => import("./Views/pages/TenderResults"));

// ==================== PAYMENT MODULES ====================
const PaymentGateway = lazy(() => import("./Views/pages/PaymentGateway"));
const TenderFeePayment = lazy(() => import("./Views/pages/TenderFeePayment"));

// ==================== UTILITY PAGES ====================
const WorkOrderView = lazy(() => import("./Views/pages/WorkOrderView"));
const RateVendor = lazy(() => import("./Views/pages/RateVendor"));
const ContractDetails = lazy(() => import("./Views/pages/ContractDetails"));

// ==================== PROFILE & ADMIN ====================
const Profile = lazy(() => import("./Views/Profile"));
const AuditLogs = lazy(() => import("./Views/pages/AuditLogs"));

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
            {/* ==================== PUBLIC ROUTES ==================== */}
            <Route path="/" element={<Login />} />
            <Route path="/tenders" element={<ProcurementLanding />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* ==================== PROTECTED ROUTES ==================== */}
            <Route element={<PrivateRoute />}>
              <Route path="/force-change-password" element={<ForceChangePassword />} />

              <Route element={<Layout />}>
                {/* Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* MPR Management */}
                <Route path="/creatempr" element={<CreateMPR />} />
                <Route path="/mpr-approval" element={<MPRApproval />} />
                <Route path="/mpr-history" element={<MPRHistory />} />
                <Route path="/mpr-approval-levels" element={<MPRApprovalLevels />} />
                <Route path="/mpr-list" element={<MPRManagement />} />

                {/* Tender Management */}
                <Route path="/publishtender" element={<PublishTender />} />
                <Route path="/tender-approval" element={<TenderApproval />} />
                <Route path="/searchtender" element={<SearchTender />} />
                <Route path="/admin/contracts" element={<AdminContractManagement />} />

                {/* Evaluation */}
                <Route path="/technical-evaluation" element={<TechnicalEvaluation />} />
                <Route path="/commercial-evaluation" element={<CommercialEvaluation />} />

                {/* Vendor Portal */}
                <Route path="/bid-submission/:tenderId?" element={<BidSubmission />} />
                <Route path="/vendor-contracts" element={<VendorContracts />} />
                <Route path="/clarification-response/:bidId" element={<ClarificationResponse />} />
                <Route path="/pending-clarifications" element={<PendingClarifications />} />
                <Route path="/my-bids" element={<MyBids />} />
                <Route path="/tender-results" element={<TenderResults />} />

                {/* Payment Pages */}
                <Route path="/paymentgateway" element={<PaymentGateway />} />
                <Route path="/tenderfeepayment" element={<TenderFeePayment />} />

                {/* Utility Pages */}
                <Route path="/workorderview" element={<WorkOrderView />} />
                <Route path="/ratevendor" element={<RateVendor />} />
                <Route path="/contractdetails" element={<ContractDetails />} />

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