interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({
  message = "Cargando datos desde el servidor...",
}: LoadingStateProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
      <p className="text-sm font-medium text-slate-500 animate-pulse">
        {message}
      </p>
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center space-y-3">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = "Ocurrió un error al cargar los datos",
  message = "Verifica que el servidor Backend esté en ejecución en http://localhost:8000",
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-2">
      <p className="text-sm font-semibold text-red-700">{title}</p>
      <p className="text-xs text-red-600">{message}</p>
      {onRetry && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
};
