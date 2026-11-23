import { Navigate, Route, Routes } from "react-router-dom";
import { AdminUsersPage, LoginPage, RegisterPage } from "@/features/auth";
import { CategoriesPage } from "@/features/categories";
import {
  AdminPedidosPage,
  AdminResumenPage,
  CarritoPage,
  CheckoutPage,
  MisPedidosPage,
} from "@/features/pedidos";
import { CatalogoPage, ProductsPage } from "@/features/products";
import { Navbar } from "@/shared/components/Navbar";
import { UnauthorizedPage } from "@/shared/components/UnauthorizedPage";
import { useThemeStore } from "@/store/themeStore";
import { ProtectedRoute } from "./ProtectedRoute";

export const AppRouter = () => {
  const darkMode = useThemeStore((state) => state.darkMode);

  return (
    <div
      className={`min-h-screen antialiased transition-colors ${darkMode
          ? "dark bg-slate-900 text-slate-100"
          : "bg-[#f3f4f9] text-slate-800"
        }`}
    >
      <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
        <Navbar />
        <main className="space-y-6">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<CatalogoPage />} />
            <Route path="/carrito" element={<CarritoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Rutas protegidas para cualquier usuario autenticado */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/mis-pedidos" element={<MisPedidosPage />} />
            </Route>

            {/* Panel de administración exclusivo para rol admin */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/resumen" element={<AdminResumenPage />} />
              <Route path="/admin/categorias" element={<CategoriesPage />} />
              <Route path="/admin/productos" element={<ProductsPage />} />
              <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
              <Route path="/admin/usuarios" element={<AdminUsersPage />} />
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AppRouter;