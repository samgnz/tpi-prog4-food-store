import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useThemeStore } from "@/store/themeStore";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAdmin, logout } = useAuth();
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const isCategorias =
    location.pathname.startsWith("/categories") ||
    location.pathname.startsWith("/categorias");
  const isProductos =
    location.pathname.startsWith("/products") ||
    location.pathname.startsWith("/productos");
  const isAdminUsers = location.pathname.startsWith("/admin/users");
  const isLogin = location.pathname.startsWith("/login");
  const isRegister = location.pathname.startsWith("/register");

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-3xl select-none" role="img" aria-label="catalogo">
          🍕
        </span>
        <div>
          <h1 className="text-xl font-black text-[#4338ca] dark:text-indigo-400 tracking-tight">
            Food Store — Unidad 10
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">
            Arquitectura por Features y Rutas Protegidas
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
        {user ? (
          <>
            <nav className="flex items-center gap-1.5">
              <Link
                to="/categories"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${isCategorias
                    ? "bg-[#4338ca] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
              >
                Categorías
              </Link>
              <Link
                to="/products"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${isProductos
                    ? "bg-[#4338ca] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
              >
                Productos
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/users"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${isAdminUsers
                      ? "bg-[#4338ca] text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                >
                  Usuarios
                </Link>
              )}
            </nav>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {user.nombre} {user.apellido}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  {user.roles.map((rol) => (
                    <span
                      key={rol}
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${rol === "admin"
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                        }`}
                    >
                      {rol}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Alternar tema claro/oscuro"
                title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                className="px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
              </button>

              <button
                type="button"
                onClick={() => void handleLogout()}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200/70 dark:border-red-800/60 transition-colors cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          </>
        ) : (
          <nav className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Alternar tema claro/oscuro"
              title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
            >
              {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
            </button>
            <Link
              to="/login"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isLogin
                  ? "bg-[#4338ca] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isRegister
                  ? "bg-[#4338ca] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
            >
              Registrarse
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
