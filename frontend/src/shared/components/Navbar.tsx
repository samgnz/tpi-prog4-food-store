import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAdmin, logout } = useAuth();
  const cantidadCarrito = useCartStore((state) =>
    state.items.reduce((acc, i) => acc + i.cantidad, 0)
  );
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const linkClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${active
      ? "bg-[#4338ca] text-white shadow-sm"
      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
    }`;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 px-5 py-4 space-y-3 transition-colors">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-3xl select-none" role="img" aria-label="food">
            🍕
          </span>
          <div>
            <h1 className="text-xl font-black text-[#4338ca] dark:text-indigo-400 tracking-tight">
              Food Store
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Sistema de Pedidos de Comida
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-1.5">
          <Link to="/" className={linkClass(location.pathname === "/")}>
            Catálogo
          </Link>
          <Link
            to="/carrito"
            className={linkClass(location.pathname === "/carrito")}
          >
            Carrito
            {cantidadCarrito > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-400 text-slate-900">
                {cantidadCarrito}
              </span>
            )}
          </Link>
          {user && (
            <Link
              to="/mis-pedidos"
              className={linkClass(location.pathname === "/mis-pedidos")}
            >
              Mis pedidos
            </Link>
          )}
        </nav>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema claro/oscuro"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
          </button>

          {user ? (
            <>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {user.full_name}
                </p>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${user.role === "admin"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                    }`}
                >
                  {user.role}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 border border-red-200/70 transition-colors cursor-pointer"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={linkClass(location.pathname === "/login")}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className={linkClass(location.pathname === "/register")}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2">
            Panel Admin:
          </span>
          <Link
            to="/admin/resumen"
            className={linkClass(location.pathname === "/admin/resumen")}
          >
            Resumen
          </Link>
          <Link
            to="/admin/categorias"
            className={linkClass(location.pathname === "/admin/categorias")}
          >
            Categorías
          </Link>
          <Link
            to="/admin/productos"
            className={linkClass(location.pathname === "/admin/productos")}
          >
            Productos
          </Link>
          <Link
            to="/admin/pedidos"
            className={linkClass(location.pathname === "/admin/pedidos")}
          >
            Pedidos
          </Link>
          <Link
            to="/admin/usuarios"
            className={linkClass(location.pathname === "/admin/usuarios")}
          >
            Usuarios
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;