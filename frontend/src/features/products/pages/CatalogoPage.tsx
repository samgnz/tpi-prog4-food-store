import { useState } from "react";
import { useCategories } from "@/features/categories";
import { Paginacion } from "@/shared/components/Paginacion";
import { CatalogoSkeleton } from "@/shared/components/Skeleton";
import { EmptyState, ErrorState } from "@/shared/components/StatusStates";
import { ProductoCard } from "../components/ProductoCard";
import { useProducts } from "../hooks/useProducts";

const LIMIT = 6;

export const CatalogoPage = () => {
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

    const { categorias } = useCategories();
    const { productos, total, isLoading, isError, error, refetch } = useProducts({
        skip: page * LIMIT,
        limit: LIMIT,
        search: search || undefined,
        categoria_id: categoriaId,
    });

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(0);
    };

    const handleCategoryChange = (value: string) => {
        setCategoriaId(value ? Number(value) : undefined);
        setPage(0);
    };

    return (
        <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Nuestro Menú
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Explorá los platos disponibles y armá tu pedido
                    </p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Buscar productos por nombre..."
                    className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
                <select
                    value={categoriaId ?? ""}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    aria-label="Filtrar por categoría"
                    className="sm:w-56 px-3.5 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <CatalogoSkeleton count={LIMIT} />
            ) : isError ? (
                <ErrorState
                    title="No se pudo cargar el catálogo"
                    message={error?.message}
                    onRetry={() => void refetch()}
                />
            ) : productos.length === 0 ? (
                <EmptyState
                    title="No se encontraron productos"
                    description="Probá ajustando tu búsqueda o seleccionando otra categoría."
                    actionLabel={search || categoriaId ? "Limpiar filtros" : undefined}
                    onAction={
                        search || categoriaId
                            ? () => {
                                setSearch("");
                                setCategoriaId(undefined);
                                setPage(0);
                            }
                            : undefined
                    }
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {productos.map((prod) => (
                            <ProductoCard key={prod.id} producto={prod} />
                        ))}
                    </div>
                    <Paginacion
                        page={page}
                        limit={LIMIT}
                        total={total}
                        onPageChange={setPage}
                    />
                </>
            )}
        </section>
    );
};

export default CatalogoPage;