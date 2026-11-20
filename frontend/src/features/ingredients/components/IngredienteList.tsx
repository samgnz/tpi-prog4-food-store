import { flexRender, type Table } from "@tanstack/react-table";
import { EmptyState } from "@/shared/components/StatusStates";
import type { Ingrediente } from "../types/ingredient.types";

interface IngredienteListProps {
  table: Table<Ingrediente>;
  totalCount: number;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onOpenCreate: () => void;
  isAdmin: boolean;
}

export const IngredienteList = ({
  table,
  totalCount,
  globalFilter,
  onGlobalFilterChange,
  onOpenCreate,
  isAdmin,
}: IngredienteListProps) => {
  if (totalCount === 0) {
    return (
      <EmptyState
        title="No hay ingredientes registrados"
        description={
          isAdmin
            ? "Haz clic en 'Nuevo ingrediente' para agregar el primer ingrediente a la lista."
            : "Aún no se han cargado ingredientes en el catálogo."
        }
        actionLabel={isAdmin ? "Nuevo ingrediente" : undefined}
        onAction={isAdmin ? onOpenCreate : undefined}
      />
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            placeholder="Buscar ingrediente por nombre..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
        </div>
        <span className="text-xs font-medium text-slate-500">
          Total: {totalCount}{" "}
          {totalCount === 1 ? "ingrediente" : "ingredientes"}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-[#f8f9fc] border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider"
                >
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        onClick={
                          canSort
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        className={`py-3 px-4 font-bold ${
                          canSort
                            ? "cursor-pointer select-none hover:text-slate-800 transition-colors"
                            : ""
                        } ${
                          header.id === "acciones" ? "text-right" : "text-left"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {canSort && (
                            <span className="text-slate-400 text-[11px]">
                              {sorted === "asc"
                                ? "▲"
                                : sorted === "desc"
                                ? "▼"
                                : "↕"}
                            </span>
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={table.getAllColumns().length}
                    className="py-8 text-center text-sm text-slate-400"
                  >
                    No se encontraron ingredientes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`py-3 px-4 text-sm text-slate-700 ${
                          cell.column.id === "acciones" ? "text-right" : ""
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-[#f8f9fc] border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>
            Página{" "}
            <strong className="font-semibold text-slate-800">
              {table.getState().pagination.pageIndex + 1}
            </strong>{" "}
            de{" "}
            <strong className="font-semibold text-slate-800">
              {table.getPageCount() || 1}
            </strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredienteList;
