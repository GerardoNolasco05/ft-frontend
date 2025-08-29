// src/components/RequireAuth.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContextProvider";

export default function RequireAuth() {
  const { token } = useAuthContext();
  const location = useLocation();

  if (!token) {
    // Remember where the user wanted to go
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
