import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { UsuarioAdmin } from "../types/auth.types";

interface AdminUsersTableProps {
  usuarios: UsuarioAdmin[];
  currentUserId: number | null;
  isPending: boolean;
  onActivate: (id: number) => void;
  onDeactivate: (id: number) => void;
}

export const AdminUsersTable = ({
  usuarios,
  currentUserId,
  isPending,
  onActivate,
  onDeactivate,
}: AdminUsersTableProps) => {
  const columns = useMemo<ColumnDef<UsuarioAdmin>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: (info) => (
          <span className="font-mono text-xs text-slate-500">
            #{info.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "username",
        header: "Usuario",
        cell: (info) => (
          <span className="font-semibold text-slate-800">
            @{info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "full_name",
        header: "Nombre",
        cell: (info) => (
          <span className="text-slate-700">{info.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => (
          <span className="text-slate-600">{info.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Rol",
        cell: (info) => {
          const role = info.getValue<string>();
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase ${role === "admin"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
            >
              {role}
            </span>
          );
        },
      },
      {
        accessorKey: "disabled",
        header: "Estado",
        cell: (info) => {
          const disabled = info.getValue<boolean>();
          return !disabled ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
              Desactivado
            </span>
          );
        },
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const u = row.original;
          const isSelf = currentUserId !== null && u.id === currentUserId;

          if (!u.disabled) {
            if (isSelf) {
              return (
                <span className="text-xs italic text-slate-400">
                  Tu sesión
                </span>
              );
            }
            return (
              <button
                type="button"
                disabled={isPending}
                onClick={() => onDeactivate(u.id)}
                className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                Desactivar
              </button>
            );
          }

          return (
            <button
              type="button"
              disabled={isPending}
              onClick={() => onActivate(u.id)}
              className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              Activar
            </button>
          );
        },
      },
    ],
    [currentUserId, isPending, onActivate, onDeactivate]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: usuarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-[#f8f9fc] border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`py-3 px-4 ${header.id === "acciones" ? "text-right" : "text-left"
                      }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`py-3 px-4 text-sm ${cell.column.id === "acciones" ? "text-right" : ""
                      }`}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-[#f8f9fc] border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <span>
          Página <strong>{table.getState().pagination.pageIndex + 1}</strong>{" "}
          de <strong>{table.getPageCount() || 1}</strong>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersTable;