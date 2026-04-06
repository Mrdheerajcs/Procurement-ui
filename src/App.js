import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";

const Layout = lazy(() => import("./Views/layout"));
const Dashboard = lazy(() => import("./Views/Dashboard"));
const Login = lazy(() => import("./Views/Login"));
const MPRManagement = lazy(() => import("./Views/Models/MPRManagement"));
const CreateMPR = lazy(() => import("./Views/CreateMPR"));
const ForceChangePassword = lazy(() => import("./Components/ForceChangePassword"));
const PublishTender = lazy(() => import("./Views/PublishTender"));
const SearchTender = lazy(() => import("./Views/SearchTender"));


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

            <Route element={<PrivateRoute />}>

              <Route
                path="/force-change-password"
                element={<ForceChangePassword />}
              />

              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/mpr-list" element={<MPRManagement />} />
                <Route path="/create-mpr" element={<CreateMPR />} />
               <Route path='/publishtender' element ={<PublishTender/>}/>
               <Route path='/searchtender' element ={<SearchTender/>}/>
              </Route>

            </Route>

          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;