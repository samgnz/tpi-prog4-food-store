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
import { useCategories } from "@/features/categories";
import { ErrorState, LoadingState } from "@/shared/components/StatusStates";
import { ProductoList } from "../components/ProductoList";
import { ProductoModal } from "../components/ProductoModal";
import { useProducts } from "../hooks/useProducts";
import type {
  Producto,
  ProductoFormValues,
  ProductoPayload,
} from "../types/product.types";

export const ProductsPage = () => {
  const { isAdmin } = useAuth();
  const {
    productos,
    isLoading,
    isError,
    error,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useProducts();
  const { categorias: categoriasDisponibles } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const cerrarModal = () => {
    setIsModalOpen(false);
    setProductoEditar(null);
    setServerError(null);
    form.reset({
      nombre: "",
      descripcion: "",
      precio_base: 0,
      disponible: true,
      categoria_ids: [],
    });
  };

  const form = useForm({
    defaultValues: {
      nombre: productoEditar?.nombre ?? "",
      descripcion: productoEditar?.descripcion ?? "",
      precio_base: productoEditar?.precio_base ?? 0,
      disponible: productoEditar?.disponible ?? true,
      categoria_ids: productoEditar?.categorias?.map((c) => c.id) ?? [],
    } as ProductoFormValues,
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload: ProductoPayload = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        precio_base: Number(value.precio_base),
        disponible: value.disponible,
        imagenes_url: productoEditar?.imagenes_url ?? [],
        categoria_ids: value.categoria_ids,
      };
      try {
        if (productoEditar) {
          await updateMutation.mutateAsync({
            id: productoEditar.id,
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
    setProductoEditar(null);
    setServerError(null);
    form.reset({
      nombre: "",
      descripcion: "",
      precio_base: 0,
      disponible: true,
      categoria_ids: [],
    });
    setIsModalOpen(true);
  };

  const abrirModalEditar = (producto: Producto) => {
    setProductoEditar(producto);
    setServerError(null);
    form.reset({
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? "",
      precio_base: producto.precio_base,
      disponible: producto.disponible,
      categoria_ids: producto.categorias?.map((c) => c.id) ?? [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (producto: Producto) => {
    setDeleteError(null);
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"?`
    );
    if (confirmar) {
      deleteMutation.mutate(producto.id, {
        onError: (err: Error) => {
          setDeleteError(err.message);
        },
      });
    }
  };

  const columns = useMemo<ColumnDef<Producto>[]>(() => {
    const baseColumns: ColumnDef<Producto>[] = [
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
      {
        id: "categorias",
        header: "Categorías",
        enableSorting: false,
        cell: ({ row }) => {
          const cats = row.original.categorias ?? [];
          if (cats.length === 0) {
            return (
              <span className="text-xs italic text-slate-400">
                Sin categoría
              </span>
            );
          }
          return (
            <div className="flex flex-wrap gap-1">
              {cats.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {cat.nombre}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "precio_base",
        header: "Precio Base",
        cell: (info) => (
          <span className="font-semibold text-slate-800">
            $
            {info.getValue<number>().toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: "disponible",
        header: "Estado",
        cell: (info) => {
          const disp = info.getValue<boolean>();
          return disp ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Disponible
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              No disponible
            </span>
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
    data: productos,
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
    return <LoadingState message="Cargando productos desde el servidor..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="No se pudieron cargar los productos"
        message={error?.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Productos</h2>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? "Modo administrador: podés crear, editar y dar de baja productos"
              : "Modo lectura: visualización del catálogo de productos y sus categorías"}
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={abrirModalCrear}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Nuevo producto
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

      <ProductoList
        table={table}
        totalCount={productos.length}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        onOpenCreate={abrirModalCrear}
        isAdmin={isAdmin}
      />

      {isAdmin && (
        <ProductoModal
          isOpen={isModalOpen}
          productoEditar={productoEditar}
          categoriasDisponibles={categoriasDisponibles}
          form={form}
          serverError={serverError}
          onClose={cerrarModal}
        />
      )}
    </section>
  );
};

export default ProductsPage;
