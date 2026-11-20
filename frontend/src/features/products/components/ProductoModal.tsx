import type { Categoria } from "@/features/categories";
import type { SimpleFormApi } from "@/shared/types/form";
import type { Producto, ProductoFormValues } from "../types/product.types";

export type { ProductoFormValues };

interface ProductoModalProps {
  isOpen: boolean;
  productoEditar: Producto | null;
  categoriasDisponibles: Categoria[];
  form: SimpleFormApi<ProductoFormValues>;
  serverError: string | null;
  onClose: () => void;
}

export const ProductoModal = ({
  isOpen,
  productoEditar,
  categoriasDisponibles,
  form,
  serverError,
  onClose,
}: ProductoModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {productoEditar ? "Editar producto" : "Nuevo producto"}
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
              onChange: ({ value }) =>
                !value.trim()
                  ? "El nombre del producto es obligatorio"
                  : undefined,
              onSubmit: ({ value }) =>
                !value.trim()
                  ? "El nombre del producto es obligatorio"
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Pizza Muzzarella"
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
                  placeholder="Ej: Salsa de tomate casera, muzzarella y aceitunas"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            )}
          </form.Field>

          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) =>
                typeof value !== "number" || Number.isNaN(value) || value < 0
                  ? "El precio base no puede ser negativo"
                  : undefined,
              onSubmit: ({ value }) =>
                typeof value !== "number" || Number.isNaN(value) || value < 0
                  ? "El precio base no puede ser negativo"
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Precio base ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={
                    Number.isNaN(field.state.value) ? "" : field.state.value
                  }
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value === "" ? NaN : Number(e.target.value)
                    )
                  }
                  placeholder="Ej: 12500"
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

          <form.Field name="categoria_ids">
            {(field) => {
              const selectedIds = field.state.value ?? [];
              const toggleCat = (catId: number) => {
                if (selectedIds.includes(catId)) {
                  field.handleChange(selectedIds.filter((id) => id !== catId));
                } else {
                  field.handleChange([...selectedIds, catId]);
                }
              };

              return (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Categorías asociadas
                  </label>
                  {categoriasDisponibles.length === 0 ? (
                    <p className="text-xs italic text-slate-400">
                      No hay categorías registradas aún.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                      {categoriasDisponibles.map((cat) => {
                        const checked = selectedIds.includes(cat.id);
                        return (
                          <label
                            key={cat.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer select-none border transition-colors ${
                              checked
                                ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCat(cat.id)}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 cursor-pointer"
                            />
                            {cat.nombre}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="disponible">
            {(field) => (
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="producto-disponible"
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="producto-disponible"
                  className="text-sm font-medium text-slate-700 cursor-pointer select-none"
                >
                  Producto disponible para la venta
                </label>
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
                    : productoEditar
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

export default ProductoModal;
