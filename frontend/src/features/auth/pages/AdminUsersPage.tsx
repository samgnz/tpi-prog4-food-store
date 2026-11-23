import { useState } from "react";
import { ErrorState, LoadingState } from "@/shared/components/StatusStates";
import { AdminUsersTable } from "../components/AdminUsersTable";
import { useAdminUsers, useAuth } from "../hooks/useAuth";

export const AdminUsersPage = () => {
  const { user } = useAuth();
  const {
    usuarios,
    isLoading,
    isError,
    error,
    refetch,
    activateMutation,
    deactivateMutation,
    isPending,
  } = useAdminUsers();
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState message="Cargando listado de usuarios..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="No se pudo cargar la lista de usuarios"
        message={error?.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Gestión de Usuarios
          </h2>
          <p className="text-xs text-slate-500">
            Panel exclusivo para administradores: activación y desactivación
            lógica de cuentas
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          Total: {usuarios.length}{" "}
          {usuarios.length === 1 ? "usuario" : "usuarios"}
        </span>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-red-700 font-medium">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <AdminUsersTable
        usuarios={usuarios}
        currentUserId={user?.id ?? null}
        isPending={isPending}
        onActivate={(id) =>
          activateMutation.mutate(id, {
            onSuccess: () => setActionError(null),
            onError: (err: Error) => setActionError(err.message),
          })
        }
        onDeactivate={(id) =>
          deactivateMutation.mutate(id, {
            onSuccess: () => setActionError(null),
            onError: (err: Error) => setActionError(err.message),
          })
        }
      />
    </section>
  );
};

export default AdminUsersPage;