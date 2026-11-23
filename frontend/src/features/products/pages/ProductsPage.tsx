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
    updateStockMutation,
    deleteMutation,
  } = useProducts({ skip: 0, limit: 100 });
  const { categorias: categoriasDisponibles } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Estado del modal rápido de stock/disponibilidad (PATCH /productos/{id}/stock)
  const [productoStock, setProductoStock] = useState<Producto | null>(null);
  const [nuevoStock, setNuevoStock] = useState<number>(0);
  const [nuevaDisponibilidad, setNuevaDisponibilidad] = useState<boolean>(true);
  const [stockError, setStockError] = useState<string | null>(null);

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
      imagen_url: "",
      stock: 0,
      disponible: true,
      categoria_id: categoriasDisponibles[0]?.id ?? 0,
    });
  };

  const form = useForm({
    defaultValues: {
      nombre: productoEditar?.nombre ?? "",
      descripcion: productoEditar?.descripcion ?? "",
      precio_base: productoEditar?.precio_base ?? 0,
      imagen_url: productoEditar?.imagen_url ?? "",
      stock: productoEditar?.stock ?? 0,
      disponible: productoEditar?.disponible ?? true,
      categoria_id:
        productoEditar?.categoria_id ?? categoriasDisponibles[0]?.id ?? 0,
    } as ProductoFormValues,
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload: ProductoPayload = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim(),
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
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
      imagen_url: "",
      stock: 10,
      disponible: true,
      categoria_id: categoriasDisponibles[0]?.id ?? 0,
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
      imagen_url: producto.imagen_url ?? "",
      stock: producto.stock,
      disponible: producto.disponible,
      categoria_id: producto.categoria_id,
    });
    setIsModalOpen(true);
  };

  const abrirModalStock = (producto: Producto) => {
    setProductoStock(producto);
    setNuevoStock(producto.stock);
    setNuevaDisponibilidad(producto.disponible);
    setStockError(null);
  };

  const handleGuardarStock = async () => {
    if (!productoStock) return;
    if (Number.isNaN(nuevoStock) || nuevoStock < 0 || !Number.isInteger(nuevoStock)) {
      setStockError("El stock debe ser un número entero mayor o igual a 0.");
      return;
    }
    setStockError(null);
    try {
      await updateStockMutation.mutateAsync({
        id: productoStock.id,
        datos: { stock: nuevoStock, disponible: nuevaDisponibilidad },
      });
      setProductoStock(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStockError(err.message);
      }
    }
  };

  const handleDelete = (producto: Producto) => {
    setDeleteError(null);
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas dar de baja el producto "${producto.nombre}"?`
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
        id: "categoria",
        header: "Categoría",
        accessorFn: (row) => row.categoria?.nombre ?? "Sin categoría",
        cell: (info) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "precio_base",
        header: "Precio",
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
        accessorKey: "stock",
        header: "Stock",
        cell: (info) => {
          const stock = info.getValue<number>();
          return (
            <span
              className={`font-bold ${stock === 0 ? "text-red-600" : "text-slate-800"
                }`}
            >
              {stock}
            </span>
          );
        },
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
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => abrirModalStock(row.original)}
              className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
            >
              Stock
            </button>
            <button
              type="button"
              onClick={() => abrirModalEditar(row.original)}
              className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row.original)}
              className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
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
        pageSize: 10,
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Gestión de Productos
          </h2>
          <p className="text-xs text-slate-500">
            ABM de catálogo, stock y disponibilidad
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

      {isAdmin && productoStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">
                Stock: {productoStock.nombre}
              </h3>
              <button
                type="button"
                onClick={() => setProductoStock(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {stockError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2 rounded-lg">
                {stockError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Cantidad en stock
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={Number.isNaN(nuevoStock) ? "" : nuevoStock}
                  onChange={(e) =>
                    setNuevoStock(
                      e.target.value === "" ? NaN : Number(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nuevaDisponibilidad}
                  onChange={(e) => setNuevaDisponibilidad(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Disponible para la venta
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductoStock(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={updateStockMutation.isPending}
                onClick={() => void handleGuardarStock()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg cursor-pointer"
              >
                {updateStockMutation.isPending ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductsPage;