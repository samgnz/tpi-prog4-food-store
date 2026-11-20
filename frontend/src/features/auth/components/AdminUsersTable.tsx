import type { UsuarioAdmin } from "../types/auth.types";

interface AdminUsersTableProps {
  usuarios: UsuarioAdmin[];
  isPending: boolean;
  onActivate: (id: number) => void;
  onDeactivate: (id: number) => void;
}

export const AdminUsersTable = ({
  usuarios,
  isPending,
  onActivate,
  onDeactivate,
}: AdminUsersTableProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8f9fc] border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Usuario</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Roles vigentes</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.map((u) => {
              const isActive = u.activo && !u.deleted_at;

              return (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    #{u.id}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-800">
                    {u.nombre} {u.apellido}
                    {u.celular && (
                      <span className="block text-xs font-normal text-slate-400">
                        {u.celular}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {u.email}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length > 0 ? (
                        u.roles.map((rol) => (
                          <span
                            key={rol}
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                              rol === "admin"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {rol}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-slate-400">
                          Sin roles vigentes
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        Desactivado
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isActive ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => onDeactivate(u.id)}
                        className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => onActivate(u.id)}
                        className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Activar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersTable;
