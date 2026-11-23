import type { SimpleFormApi } from "@/shared/types/form";
import type { Categoria, CategoriaFormValues } from "../types/category.types";

export type { CategoriaFormValues };

interface CategoriaModalProps {
  isOpen: boolean;
  categoriaEditar: Categoria | null;
  form: SimpleFormApi<CategoriaFormValues>;
  serverError: string | null;
  onClose: () => void;
}

export const CategoriaModal = ({
  isOpen,
  categoriaEditar,
  form,
  serverError,
  onClose,
}: CategoriaModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {categoriaEditar ? "Editar categoría" : "Nueva categoría"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2.5 rounded-lg">
            {serverError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) => {
                const len = value.trim().length;
                if (len < 2)
                  return "El nombre debe tener al menos 2 caracteres";
                if (len > 100)
                  return "El nombre no puede superar los 100 caracteres";
                return undefined;
              },
              onSubmit: ({ value }) => {
                const len = value.trim().length;
                if (len < 2)
                  return "El nombre debe tener al menos 2 caracteres";
                if (len > 100)
                  return "El nombre no puede superar los 100 caracteres";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nombre de la categoría *
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Pizzas"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Pizzas artesanales con masa madre"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || Boolean(isSubmitting)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                >
                  {isSubmitting
                    ? "Guardando..."
                    : categoriaEditar
                      ? "Guardar cambios"
                      : "Guardar"}
                </button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  );
};

export default CategoriaModal;
