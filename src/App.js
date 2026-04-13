import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";
import Chatbot from "./Components/ChatBot";

const Layout = lazy(() => import("./Views/layout"));
const Dashboard = lazy(() => import("./Views/Dashboard"));
const Login = lazy(() => import("./Views/Login"));
const MPRManagement = lazy(() => import("./Views/Models/MPRManagement"));
const CreateMPR = lazy(() => import("./Views/CreateMPR"));
const ForceChangePassword = lazy(() => import("./Components/ForceChangePassword"));
const PublishTender = lazy(() => import("./Views/PublishTender"));
const SearchTender = lazy(() => import("./Views/SearchTender"));
const MPRApproval = lazy(() => import("./Views/MPRApproval"));
const Profile = lazy(() => import("./Views/Profile"));
const MPRHistory = lazy(() => import("./Views/MPRHistory"));
const ProcurementLanding = lazy(() => import("./Components/ProcurementLanding"));
const TenderDashboard = lazy(() => import("./Views/TenderDashboard"));
const CommercialComparison = lazy(() => import("./Views/CommercialComparison"));
const BidSubmissionForm = lazy(() => import("./Views/BidSubmissionForm"));
const VendorContracts = lazy(() => import("./Views/VendorContracts"));


const Loader = () => (
  <div style={{ textAlign: "center", marginTop: "50px" }}>
    Loading...
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>

            <Route path="/" element={<Login />} />
            <Route path="/tenders" element={<ProcurementLanding />} />

            <Route element={<PrivateRoute />}>

              <Route
                path="/force-change-password"
                element={<ForceChangePassword />}
              />

              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/mpr-list" element={<MPRManagement />} />
                <Route path="/creatempr" element={<CreateMPR />} />
               <Route path='/publishtender' element ={<PublishTender/>}/>
               <Route path='/searchtender' element ={<SearchTender/>}/>
               <Route path='/mpr-approval' element={<MPRApproval/>}/>
               <Route path='/profile' element={<Profile/>}/>
                <Route path='/mpr-history' element={<MPRHistory/>}/>
                <Route path='/tender-dashboard' element={<TenderDashboard/>}/>
                <Route path='/commercial-comparison' element={<CommercialComparison/>}/>
                <Route path='/bid-submission' element={<BidSubmissionForm/>}/>
                <Route path='/vendor-contracts' element={<VendorContracts/>}/>
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