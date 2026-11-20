import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useAuth } from "../hooks/useAuth";

interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const { user, isLoading, login } = useAuth();

  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } as LoginFormValues,
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await login(value.email.trim(), value.password);
        navigate("/categories", { replace: true });
      } catch (error: unknown) {
        if (error instanceof Error) {
          setServerError(error.message);
        } else {
          setServerError(
            "Credenciales inválidas. Verifica tu email y contraseña."
          );
        }
      }
    },
  });

  if (!isLoading && user) {
    return <Navigate to="/categories" replace />;
  }

  return (
    <section className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-1">
        <span className="text-4xl select-none" role="img" aria-label="login">
          🔐
        </span>
        <h2 className="text-2xl font-bold text-slate-800">Iniciar sesión</h2>
        <p className="text-xs text-slate-500">
          Ingresa con tu correo electrónico para acceder al Food Store
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
          name="email"
          validators={{
            onChange: ({ value }) => {
              if (!value.trim()) return "El email es obligatorio";
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                return "Ingresa un email con formato válido";
              }
              return undefined;
            },
            onSubmit: ({ value }) => {
              if (!value.trim()) return "El email es obligatorio";
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                return "Ingresa un email con formato válido";
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
                placeholder="usuario@foodstore.com"
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
              !value ? "La contraseña es obligatoria" : undefined,
            onSubmit: ({ value }) =>
              !value ? "La contraseña es obligatoria" : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
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
              {isSubmitting ? "Iniciando sesión..." : "Ingresar"}
            </button>
          )}
        </form.Subscribe>
      </form>

      <div className="pt-2 border-t border-slate-100 text-center space-y-2">
        <p className="text-xs text-slate-600">
          ¿Todavía no tenés cuenta?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#4338ca] hover:underline"
          >
            Registrate aquí
          </Link>
        </p>
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-left text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            Cuentas de prueba (seed.py):
          </p>
          <p>
            • <strong>Admin:</strong> <code>admin@foodstore.com</code> /{" "}
            <code>admin1234</code>
          </p>
          <p>
            • <strong>User:</strong> <code>user@foodstore.com</code> /{" "}
            <code>user1234</code>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
