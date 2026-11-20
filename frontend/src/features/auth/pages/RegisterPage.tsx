import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useAuth } from "../hooks/useAuth";

interface RegisterFormValues {
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  password: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      celular: "",
      password: "",
    } as RegisterFormValues,
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await register({
          nombre: value.nombre.trim(),
          apellido: value.apellido.trim(),
          email: value.email.trim(),
          celular: value.celular.trim() ? value.celular.trim() : null,
          password: value.password,
        });
        navigate("/login", { replace: true });
      } catch (error: unknown) {
        if (error instanceof Error) {
          setServerError(error.message);
        } else {
          setServerError("No se pudo registrar el usuario.");
        }
      }
    },
  });

  return (
    <section className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-1">
        <span className="text-4xl select-none" role="img" aria-label="registro">
          📝
        </span>
        <h2 className="text-2xl font-bold text-slate-800">Crear cuenta</h2>
        <p className="text-xs text-slate-500">
          Completa tus datos para registrarte con el rol de cliente (user)
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-lg"
        >
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? "El nombre es obligatorio" : undefined,
              onSubmit: ({ value }) =>
                !value.trim() ? "El nombre es obligatorio" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Juan"
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

          <form.Field
            name="apellido"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? "El apellido es obligatorio" : undefined,
              onSubmit: ({ value }) =>
                !value.trim() ? "El apellido es obligatorio" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Pérez"
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
        </div>

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              if (!value.trim()) return "El email es obligatorio";
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                return "Ingresa un email válido";
              }
              return undefined;
            },
            onSubmit: ({ value }) => {
              if (!value.trim()) return "El email es obligatorio";
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                return "Ingresa un email válido";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="juan.perez@foodstore.com"
                autoComplete="email"
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

        <form.Field name="celular">
          {(field) => (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Celular (opcional)
              </label>
              <input
                type="tel"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="+54 9 351 1234567"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              value.length < 8
                ? "La contraseña debe tener al menos 8 caracteres (RN-09)"
                : undefined,
            onSubmit: ({ value }) =>
              value.length < 8
                ? "La contraseña debe tener al menos 8 caracteres (RN-09)"
                : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Contraseña (mínimo 8 caracteres) *
              </label>
              <input
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
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

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || Boolean(isSubmitting)}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#4338ca] hover:bg-[#3730a3] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {isSubmitting ? "Registrando cuenta..." : "Crear cuenta"}
            </button>
          )}
        </form.Subscribe>
      </form>

      <div className="pt-2 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-600">
          ¿Ya tenés una cuenta?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#4338ca] hover:underline"
          >
            Iniciá sesión
          </Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;
