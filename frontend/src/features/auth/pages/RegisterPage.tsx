import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useAuth } from "../hooks/useAuth";

interface RegisterFormValues {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
    } as RegisterFormValues,
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await register({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
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
          Completá tus datos para registrarte como cliente
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
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) =>
              value.trim().length < 2
                ? "El usuario debe tener al menos 2 caracteres"
                : undefined,
            onSubmit: ({ value }) =>
              value.trim().length < 2
                ? "El usuario debe tener al menos 2 caracteres"
                : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Usuario *
              </label>
              <input
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="juanperez"
                autoComplete="username"
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
          name="full_name"
          validators={{
            onChange: ({ value }) =>
              !value.trim() ? "El nombre completo es obligatorio" : undefined,
            onSubmit: ({ value }) =>
              !value.trim() ? "El nombre completo es obligatorio" : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Juan Pérez"
                autoComplete="name"
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
          name="email"
          validators={{
            onChange: ({ value }) => {
              if (!value.trim()) return "El email es obligatorio";
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                return "Ingresá un email válido";
              }
              return undefined;
            },
            onSubmit: ({ value }) => {
              if (!value.trim()) return "El email es obligatorio";
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                return "Ingresá un email válido";
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

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              value.length < 8
                ? "La contraseña debe tener al menos 8 caracteres"
                : undefined,
            onSubmit: ({ value }) =>
              value.length < 8
                ? "La contraseña debe tener al menos 8 caracteres"
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