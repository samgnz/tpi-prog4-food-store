# Trabajo Práctico Unidad 10 — Arquitectura por Features y Rutas Protegidas

> **Tecnicatura Universitaria en Programación a Distancia (TUPaD) — UTN**  
> **Materia:** Programación IV  
> **Unidad 10:** Autorización, Arquitectura por Features y Rutas Protegidas  
> **Alumna:** Erika Gonzalez

---

## 📌 Descripción General

Frontend del sistema **Food Store** desarrollado con **React 19 + TypeScript + Vite + Tailwind CSS**, refactorizado desde la estructura plana de la Unidad 9 hacia una **arquitectura modular por features**.

Incorpora:
- **Arquitectura por Features (`src/features/`)** con aislamiento de dominios (`auth`, `categories`, `products`, `ingredients`) y **Barrel Exports (`index.ts`)**.
- **Alias de rutas `@/`** configurado en Vite (`vite.config.ts`) y TypeScript (`tsconfig.app.json`).
- **Protección de rutas (`ProtectedRoute` + `<Outlet />`)** por sesión activa y por rol (`user` / `admin`) en `src/routes/AppRouter.tsx`.
- **Manejo centralizado de errores HTTP `401` y `403`** mediante interceptores de Axios (`src/shared/api/setupInterceptors.ts`).
- **Custom Hooks por dominio (`useAuth`, `useCategories`, `useProducts`, `useIngredients`)** que encapsulan todas las peticiones a Axios y las consultas/mutaciones de **TanStack Query**.
- **Estado global de interfaz con Zustand**:
  - `themeStore`: modo oscuro persistido en `localStorage` (`name: 'theme-storage'`) con selector en la `Navbar`.
  - `notificationStore` + `Toast`: notificaciones globales con auto-cierre a los 3 segundos.
  - `authStore` **sin `persist`**: la sesión no se almacena en `localStorage`; se verifica al iniciar mediante `GET /api/v1/auth/me` en cookie `HttpOnly`.

---

## 📂 Estructura de Módulos por Feature (`src/`)

```text
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   └── AdminUsersTable.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts              # Encapsula login, logout, registro, lectura del store y gestión admin
│   │   ├── store/
│   │   │   └── authStore.ts            # Store de sesión Zustand (sin persist; verifica con /auth/me)
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── AdminUsersPage.tsx
│   │   └── index.ts                    # Barrel export de la feature auth
│   ├── categories/
│   │   ├── components/
│   │   │   ├── CategoriaCard.tsx
│   │   │   ├── CategoriaList.tsx
│   │   │   └── CategoriaModal.tsx
│   │   ├── hooks/
│   │   │   └── useCategories.ts        # Encapsula Axios + TanStack Query (useQuery y useMutation)
│   │   ├── types/
│   │   │   └── category.types.ts
│   │   ├── pages/
│   │   │   └── CategoriesPage.tsx
│   │   └── index.ts                    # Barrel export de la feature categories
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductoList.tsx
│   │   │   └── ProductoModal.tsx
│   │   ├── hooks/
│   │   │   └── useProducts.ts          # Encapsula Axios + TanStack Query (useQuery y useMutation)
│   │   ├── types/
│   │   │   └── product.types.ts
│   │   ├── pages/
│   │   │   └── ProductsPage.tsx
│   │   └── index.ts                    # Barrel export de la feature products
│   └── ingredients/
│       ├── components/
│       │   ├── IngredienteList.tsx
│       │   └── IngredienteModal.tsx
│       ├── hooks/
│       │   └── useIngredients.ts       # Encapsula Axios + TanStack Query (useQuery y useMutation)
│       ├── types/
│       │   └── ingredient.types.ts
│       ├── pages/
│       │   └── IngredientsPage.tsx
│       └── index.ts                    # Barrel export de la feature ingredients
├── shared/
│   ├── components/
│   │   ├── Navbar.tsx                  # Navegación por rol, usuario activo y botón de modo oscuro
│   │   ├── UnauthorizedPage.tsx        # Pantalla de acceso denegado (/unauthorized)
│   │   ├── Toast.tsx                   # Notificaciones flotantes (se ocultan a los 3 segundos)
│   │   └── StatusStates.tsx            # Estados visuales reutilizables (Loading, Empty, Error)
│   ├── api/
│   │   ├── api.ts                      # Instancia de Axios con withCredentials: true
│   │   └── setupInterceptors.ts        # Interceptor de 401 (limpia sesión) y 403 (muestra Toast)
│   └── types/
│       └── form.ts                     # Tipos auxiliares compartidos para TanStack Form
├── store/
│   ├── themeStore.ts                   # Estado de tema oscuro con middleware persist ('theme-storage')
│   └── notificationStore.ts            # Estado global de notificaciones (showNotification / hideNotification)
├── routes/
│   ├── AppRouter.tsx                   # Definición de rutas públicas, protegidas y de administración
│   └── ProtectedRoute.tsx              # Guardia de rutas por sesión y rol usando <Outlet />
├── App.tsx                             # Verifica la sesión al iniciar (checkAuth) y monta <AppRouter /> y <Toast />
└── main.tsx                            # Punto de entrada, QueryClientProvider, BrowserRouter e interceptores
```

---

## 🏛️ Reglas de Arquitectura Cumplidas

- **Autonomía y Barrel Exports (`RA-01`, `RA-03`)**: Cada feature expone su API pública a través de su archivo `index.ts`. Ninguna feature importa desde subdirectorios internos de otra feature (por ejemplo, `products` importa `useCategories` y `Categoria` desde `@/features/categories`).
- **Elementos Transversales (`RA-02`)**: Componentes compartidos (`Navbar`, `UnauthorizedPage`, `Toast`), la instancia de Axios (`api.ts`, `setupInterceptors.ts`) y los stores de interfaz (`themeStore`, `notificationStore`) residen en `src/shared/` y `src/store/`.
- **`App.tsx` sin lógica de negocio (`RA-04`)**: Solo ejecuta `checkAuth()` en un `useEffect` al iniciar y monta `<AppRouter />` y `<Toast />`.
- **Protección con `<Outlet />` (`RA-05`, `RA-06`)**: `ProtectedRoute` muestra un estado de carga mientras `checking` está activo, redirige a `/login` si no hay sesión, a `/unauthorized` si el rol no está en `allowedRoles`, o renderiza `<Outlet />`.
- **Custom Hooks de Datos (`RA-07`)**: Las páginas dentro de `pages/` no importan ni llaman a Axios ni a TanStack Query directamente.
- **Alias `@/` (`RA-08`)**: Configurado en `vite.config.ts` y `tsconfig.app.json`.
- **Sin sesión en `localStorage` (`RA-09`)**: `authStore` no utiliza `persist`; solo se persiste la preferencia visual del tema en `theme-storage`.

---

## 🚀 Instalación y Ejecución

1. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   pnpm dev
   ```
   La aplicación estará disponible en `http://localhost:5173` (conectándose al backend FastAPI de la Unidad 9 en `http://localhost:8000/api/v1`).

3. **Verificar compilación de TypeScript y build de producción:**
   ```bash
   pnpm build
   pnpm lint
   ```
