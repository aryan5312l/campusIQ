import { Navigate } from "react-router-dom";

export default function AuthRedirect() {
  const token = localStorage.getItem("token");

  return token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
}