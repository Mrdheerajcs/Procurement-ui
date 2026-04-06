import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

const PrivateRoute = () => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth || !auth.token) return <Navigate to="/" replace />;

  // ✅ FIX: allow access to force-change-password page
  if (!auth.isPasswordChanged && location.pathname !== "/force-change-password") {
    return <Navigate to="/force-change-password" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;