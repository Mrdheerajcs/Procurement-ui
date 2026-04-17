import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

// Define route access rules 
const routeAccessRules = {
  // Admin only routes
  "/creatempr": ["PROCUREMENT_ADMIN"],
  "/mpr-list": ["PROCUREMENT_ADMIN"],
  "/mpr-approval": ["PROCUREMENT_ADMIN"],
  "/mpr-approval-levels": ["PROCUREMENT_ADMIN"],
  "/publishtender": ["PROCUREMENT_ADMIN"],
  "/tender-approval": ["PROCUREMENT_ADMIN"],
  "/technical-evaluation": ["PROCUREMENT_ADMIN"],
  "/commercial-evaluation": ["PROCUREMENT_ADMIN"],
  "/audit-logs": ["PROCUREMENT_ADMIN"],
  
  // Vendor only routes
  "/bid-submission": ["ROLE_VENDOR", "ROLE_VENDER"],  // ✅ Added both spellings
  "/vendor-contracts": ["ROLE_VENDOR", "ROLE_VENDER"],
  "/pending-clarifications": ["ROLE_VENDOR", "ROLE_VENDER"],
  "/clarification-response": ["ROLE_VENDOR", "ROLE_VENDER"],
  
  // Common routes
  "/dashboard": ["PROCUREMENT_ADMIN", "ROLE_VENDOR", "ROLE_VENDER"],
  "/searchtender": ["PROCUREMENT_ADMIN", "ROLE_VENDOR", "ROLE_VENDER"],
  "/profile": ["PROCUREMENT_ADMIN", "ROLE_VENDOR", "ROLE_VENDER"],
  "/mpr-history": ["PROCUREMENT_ADMIN", "ROLE_VENDOR", "ROLE_VENDER"],

  // new routs
  "/tenderfeepayment": ["PROCUREMENT_ADMIN", "ROLE_VENDOR", "ROLE_VENDER"],
  "/workorderview": ["PROCUREMENT_ADMIN", "ROLE_VENDOR", "ROLE_VENDER"],
  "/paymentgateway": ["PROCUREMENT_ADMIN", "ROLE_VENDOR", "ROLE_VENDER"],
  "/ratevendor": ["PROCUREMENT_ADMIN", "ROLE_VENDOR", "ROLE_VENDER"],
  "/contractdetails": ["PROCUREMENT_ADMIN", "ROLE_VENDOR", "ROLE_VENDER"],


};

const PrivateRoute = () => {
  const { auth } = useAuth();
  const location = useLocation();

  // Debug: Log auth data
  console.log("🔐 PrivateRoute - Auth Data:", auth);
  console.log("🔐 PrivateRoute - User Roles:", auth?.roles);
  console.log("🔐 PrivateRoute - Current Path:", location.pathname);

  // Check if user is logged in
  if (!auth || !auth.token) {
    console.log("❌ No token, redirecting to login");
    return <Navigate to="/" replace />;
  }

  // Allow access to force-change-password page
  if (!auth.isPasswordChanged && location.pathname !== "/force-change-password") {
    console.log("❌ Password not changed, redirecting to force-change-password");
    return <Navigate to="/force-change-password" replace />;
  }

  // Get user roles (handle both ROLE_VENDOR and ROLE_VENDER)
  const userRoles = auth.roles || [];
  console.log("📋 User Roles from auth:", userRoles);
  
  // Normalize roles (convert ROLE_VENDER to ROLE_VENDOR if needed)
  const normalizedRoles = userRoles.map(role => {
    if (role === "ROLE_VENDER") return "ROLE_VENDOR";
    return role;
  });
  console.log("📋 Normalized Roles:", normalizedRoles);

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
  console.log("🔑 Allowed Roles for this route:", allowedRoles);
  
  const hasAccess = allowedRoles.some(role => normalizedRoles.includes(role));
  console.log("🎯 Has Access:", hasAccess);

  if (!hasAccess) {
    console.log("❌ Access denied! Redirecting to dashboard");
    alert("You don't have permission to access this page");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("✅ Access granted");
  return <Outlet />;
};

export default PrivateRoute;