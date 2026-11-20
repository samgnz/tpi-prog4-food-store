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
import { IngredienteList } from "../components/IngredienteList";
import { IngredienteModal } from "../components/IngredienteModal";
import { useIngredients } from "../hooks/useIngredients";
import type {
  Ingrediente,
  IngredienteFormValues,
} from "../types/ingredient.types";

export const IngredientsPage = () => {
  const { isAdmin } = useAuth();
  const {
    ingredientes,
    isLoading,
    isError,
    error,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useIngredients();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [ingredienteEditar, setIngredienteEditar] =
    useState<Ingrediente | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const cerrarModal = () => {
    setIsModalOpen(false);
    setIngredienteEditar(null);
    setServerError(null);
    form.reset({ nombre: "" });
  };

  const form = useForm({
    defaultValues: {
      nombre: ingredienteEditar?.nombre ?? "",
    } as IngredienteFormValues,
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = {
        nombre: value.nombre.trim(),
      };
      try {
        if (ingredienteEditar) {
          await updateMutation.mutateAsync({
            id: ingredienteEditar.id,
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
    setIngredienteEditar(null);
    setServerError(null);
    form.reset({ nombre: "" });
    setIsModalOpen(true);
  };

  const abrirModalEditar = (ingrediente: Ingrediente) => {
    setIngredienteEditar(ingrediente);
    setServerError(null);
    form.reset({
      nombre: ingrediente.nombre,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (ingrediente: Ingrediente) => {
    setDeleteError(null);
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar el ingrediente "${ingrediente.nombre}"?`
    );
    if (confirmar) {
      deleteMutation.mutate(ingrediente.id, {
        onError: (err: Error) => {
          setDeleteError(err.message);
        },
      });
    }
  };

  const columns = useMemo<ColumnDef<Ingrediente>[]>(() => {
    const baseColumns: ColumnDef<Ingrediente>[] = [
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
    data: ingredientes,
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
    return (
      <LoadingState message="Cargando ingredientes desde el servidor..." />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="No se pudieron cargar los ingredientes"
        message={error?.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ingredientes</h2>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? "Modo administrador: podés crear, editar y dar de baja ingredientes"
              : "Modo lectura: visualización del catálogo de ingredientes"}
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={abrirModalCrear}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Nuevo ingrediente
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

      <IngredienteList
        table={table}
        totalCount={ingredientes.length}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onOpenCreate={abrirModalCrear}
        isAdmin={isAdmin}
      />

      {isAdmin && (
        <IngredienteModal
          isOpen={isModalOpen}
          ingredienteEditar={ingredienteEditar}
          form={form}
          serverError={serverError}
          onClose={cerrarModal}
        />
      )}
    </section>
  );
};

export default IngredientsPage;
