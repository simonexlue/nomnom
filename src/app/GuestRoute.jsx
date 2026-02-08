import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function GuestRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (session) return <Navigate to="/" replace />;

  return children;
}
