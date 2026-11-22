interface PaginacionProps {
    page: number;
    limit: number;
    total: number;
    onPageChange: (newPage: number) => void;
}

export const Paginacion = ({
    page,
    limit,
    total,
    onPageChange,
}: PaginacionProps) => {
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm text-xs text-slate-600">
            <span>
                Página <strong className="text-slate-800">{page + 1}</strong> de{" "}
                <strong className="text-slate-800">{totalPages}</strong> ({total}{" "}
                {total === 1 ? "resultado" : "resultados"})
            </span>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={page <= 0}
                    onClick={() => onPageChange(page - 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    Anterior
                </button>
                <button
                    type="button"
                    disabled={page + 1 >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};