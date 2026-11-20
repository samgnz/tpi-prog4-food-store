import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth";
import { LoadingState } from "@/shared/components/StatusStates";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const user = useAuthStore((state) => state.user);
  const checking = useAuthStore((state) => state.checking);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (checking || isLoading) {
    return <LoadingState message="Verificando sesión con el servidor..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some((role) =>
      user.roles.includes(role)
    );
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
