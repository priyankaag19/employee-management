// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function PrivateRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user || (roles.length && !roles.includes(user.role))) return <Navigate to="/login" />;

  return children;
}
