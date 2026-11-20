import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

import { useAuth } from "@/features/auth";
import { ErrorState, LoadingState } from "@/shared/components/StatusStates";
import { CategoriaList } from "../components/CategoriaList";
import { CategoriaModal } from "../components/CategoriaModal";
import { useCategories } from "../hooks/useCategories";
import type { Categoria, CategoriaFormValues } from "../types/category.types";

export const CategoriesPage = () => {
  const { isAdmin } = useAuth();
  const {
    categorias,
    isLoading,
    isError,
    error,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [categoriaEditar, setCategoriaEditar] = useState<Categoria | null>(
    null
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const cerrarModal = () => {
    setIsModalOpen(false);
    setCategoriaEditar(null);
    setServerError(null);
    form.reset({ nombre: "", descripcion: "" });
  };

  const form = useForm({
    defaultValues: {
      nombre: categoriaEditar?.nombre ?? "",
      descripcion: categoriaEditar?.descripcion ?? "",
    } as CategoriaFormValues,
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
      };
      try {
        if (categoriaEditar) {
          await updateMutation.mutateAsync({
            id: categoriaEditar.id,
            datos: payload,
          });
        } else {
          await createMutation.mutateAsync(payload);
        }
        cerrarModal();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setServerError(err.message);
        }
      }
    },
  });

  const abrirModalCrear = () => {
    setCategoriaEditar(null);
    setServerError(null);
    form.reset({ nombre: "", descripcion: "" });
    setIsModalOpen(true);
  };

  const abrirModalEditar = (categoria: Categoria) => {
    setCategoriaEditar(categoria);
    setServerError(null);
    form.reset({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (categoria: Categoria) => {
    setDeleteError(null);
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar la categoría "${categoria.nombre}"?`
    );
    if (confirmar) {
      deleteMutation.mutate(categoria.id, {
        onError: (err: Error) => {
          setDeleteError(err.message);
        },
      });
    }
  };

  const columns = useMemo<ColumnDef<Categoria>[]>(() => {
    const baseColumns: ColumnDef<Categoria>[] = [
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
        accessorKey: "nombre",
        header: "Nombre",
        cell: (info) => (
          <span className="font-semibold text-slate-800">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: (info) => {
          const val = info.getValue<string>();
          return val ? (
            <span className="text-slate-600">{val}</span>
          ) : (
            <span className="italic text-slate-400">Sin descripción</span>
          );
        },
      },
    ];

    if (isAdmin) {
      baseColumns.push({
        id: "acciones",
        header: "Acciones",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => abrirModalEditar(row.original)}
              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row.original)}
              className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
            >
              Eliminar
            </button>
          </div>
        ),
      });
    }

    return baseColumns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: categorias,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  if (isLoading) {
    return <LoadingState message="Cargando categorías desde el servidor..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="No se pudieron cargar las categorías"
        message={error?.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Categorías</h2>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? "Modo administrador: podés crear, editar y dar de baja categorías"
              : "Modo lectura: visualización del catálogo de categorías"}
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={abrirModalCrear}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Nueva categoría
          </button>
        )}
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-red-700 font-medium">
          <span>{deleteError}</span>
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <CategoriaList
        table={table}
        totalCount={categorias.length}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onOpenCreate={abrirModalCrear}
        isAdmin={isAdmin}
      />

      {isAdmin && (
        <CategoriaModal
          isOpen={isModalOpen}
          categoriaEditar={categoriaEditar}
          form={form}
          serverError={serverError}
          onClose={cerrarModal}
        />
      )}
    </section>
  );
};

export default CategoriesPage;
