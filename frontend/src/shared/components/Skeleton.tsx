interface CatalogoSkeletonProps {
    count?: number;
}

export const CatalogoSkeleton = ({ count = 6 }: CatalogoSkeletonProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={idx}
                    className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-pulse"
                >
                    <div className="h-44 bg-slate-200" />
                    <div className="p-4 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-5 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-full" />
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                        <div className="pt-2 flex items-center justify-between">
                            <div className="h-6 bg-slate-200 rounded w-1/3" />
                            <div className="h-9 bg-slate-200 rounded w-1/3" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};