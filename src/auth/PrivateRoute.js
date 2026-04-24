import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

// Define route access rules with NEW role names
const routeAccessRules = {
  // Admin only routes (PROCUREMENT_ADMIN)
  "/creatempr": ["PROCUREMENT_ADMIN"],
  "/mpr-list": ["PROCUREMENT_ADMIN"],
  "/mpr-approval": ["PROCUREMENT_ADMIN"],
  "/mpr-approval-levels": ["PROCUREMENT_ADMIN"],
  "/publishtender": ["PROCUREMENT_ADMIN"],
  "/tender-approval": ["PROCUREMENT_ADMIN"],
  "/technical-evaluation": ["PROCUREMENT_ADMIN"],
  "/commercial-evaluation": ["PROCUREMENT_ADMIN"],
  "/audit-logs": ["PROCUREMENT_ADMIN"],
  "/ratevendor": ["PROCUREMENT_ADMIN"],
  
  // User routes (PROCUREMENT_USER)
  "/creatempr": ["PROCUREMENT_ADMIN", "PROCUREMENT_USER"],
  "/mpr-list": ["PROCUREMENT_ADMIN", "PROCUREMENT_USER"],
  "/mpr-history": ["PROCUREMENT_ADMIN", "PROCUREMENT_USER", "VENDER_USER"],
  
  // Vendor only routes (VENDER_USER)
  "/bid-submission": ["VENDER_USER"],
  "/vendor-contracts": ["VENDER_USER"],
  "/pending-clarifications": ["VENDER_USER"],
  "/clarification-response": ["VENDER_USER"],
  "/my-bids": ["VENDER_USER"],
  "/tenderfeepayment": ["VENDER_USER"],
  
  // Common routes (All roles)
  "/dashboard": ["PROCUREMENT_ADMIN", "PROCUREMENT_USER", "VENDER_USER"],
  "/searchtender": ["PROCUREMENT_ADMIN", "PROCUREMENT_USER", "VENDER_USER"],
  "/profile": ["PROCUREMENT_ADMIN", "PROCUREMENT_USER", "VENDER_USER"],
  "/workorderview": ["PROCUREMENT_ADMIN", "PROCUREMENT_USER", "VENDER_USER"],
  "/paymentgateway": ["PROCUREMENT_ADMIN", "PROCUREMENT_USER", "VENDER_USER"],
  "/contractdetails": ["PROCUREMENT_ADMIN", "PROCUREMENT_USER", "VENDER_USER"],
};

const PrivateRoute = () => {
  const { auth } = useAuth();
  const location = useLocation();

  console.log("🔐 PrivateRoute - Auth:", auth);
  console.log("🔐 PrivateRoute - Path:", location.pathname);

  // Check if user is logged in
  if (!auth || !auth.token) {
    console.log("❌ No token, redirecting to login");
    return <Navigate to="/" replace />;
  }

  // Allow access to force-change-password page
  if (!auth.isPasswordChanged && location.pathname !== "/force-change-password") {
    console.log("❌ Password not changed");
    return <Navigate to="/force-change-password" replace />;
  }

  // Get user roles
  const userRoles = auth.roles || [];
  console.log("📋 User Roles:", userRoles);

  // Find matching route rule
  let matchedRoute = null;
  for (const route in routeAccessRules) {
    if (location.pathname.startsWith(route)) {
      matchedRoute = route;
      break;
    }
  }

  console.log("📍 Matched Route:", matchedRoute);

  // If no specific rule, allow access
  if (!matchedRoute) {
    console.log("✅ No specific rule, allowing access");
    return <Outlet />;
  }

  // Check if user has required role
  const allowedRoles = routeAccessRules[matchedRoute];
  console.log("🔑 Allowed Roles:", allowedRoles);
  
  const hasAccess = allowedRoles.some(role => userRoles.includes(role));
  console.log("🎯 Has Access:", hasAccess);

  if (!hasAccess) {
    console.log("❌ Access denied!");
    alert("You don't have permission to access this page");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("✅ Access granted");
  return <Outlet />;
};

export default PrivateRoute;