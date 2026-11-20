# Trabajo Práctico Unidad 10 — Programación IV
> **Tecnicatura Universitaria en Programación a Distancia (TUPaD)**  
> **Universidad Tecnológica Nacional (UTN)**  
> **Materia:** Programación IV  
> **Unidad 10:** Autorización, Arquitectura por Features y Rutas Protegidas

---

## 📌 Descripción General del Proyecto

Aplicación **Full Stack** del *Food Store* que refactoriza el frontend de la Unidad 9 adoptando una **arquitectura de módulos por feature** (`auth`, `categories`, `products`, `ingredients`), protección de rutas por sesión y rol mediante `<Outlet />` de React Router, custom hooks de dominio que encapsulan Axios + TanStack Query, y estado global de interfaz con Zustand (`themeStore` con `persist` y `notificationStore` con `Toast`).

El backend de la Unidad 9 (**FastAPI + SQLModel + PostgreSQL + JWT en Cookie HttpOnly + RBAC**) se reutiliza tal cual sin modificaciones.

---

## 📂 Estructura del Frontend (`frontend/src/`)

```text
frontend/src/
├── features/
│   ├── auth/
│   │   ├── components/AdminUsersTable.tsx
│   │   ├── hooks/useAuth.ts
│   │   ├── store/authStore.ts
│   │   ├── types/auth.types.ts
│   │   ├── pages/ (LoginPage, RegisterPage, AdminUsersPage)
│   │   └── index.ts
│   ├── categories/
│   │   ├── components/ (CategoriaCard, CategoriaList, CategoriaModal)
│   │   ├── hooks/useCategories.ts
│   │   ├── types/category.types.ts
│   │   ├── pages/CategoriesPage.tsx
│   │   └── index.ts
│   ├── products/
│   │   ├── components/ (ProductoList, ProductoModal)
│   │   ├── hooks/useProducts.ts
│   │   ├── types/product.types.ts
│   │   ├── pages/ProductsPage.tsx
│   │   └── index.ts
│   └── ingredients/
│       ├── components/ (IngredienteList, IngredienteModal)
│       ├── hooks/useIngredients.ts
│       ├── types/ingredient.types.ts
│       ├── pages/IngredientsPage.tsx
│       └── index.ts
├── shared/
│   ├── components/ (Navbar, UnauthorizedPage, Toast, StatusStates)
│   ├── api/ (api.ts, setupInterceptors.ts)
│   └── types/form.ts
├── store/
│   ├── themeStore.ts
│   └── notificationStore.ts
├── routes/
│   ├── AppRouter.tsx
│   └── ProtectedRoute.tsx
├── App.tsx
└── main.tsx
```

---

## 🚀 Puesta en Marcha

### 1. Backend (`FastAPI + PostgreSQL`)
```powershell
cd backend
docker compose up -d
.venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```
- **Cuentas de prueba (`seed.py`):**
  - **Administrador (`admin`):** `admin@foodstore.com` / `admin1234`
  - **Cliente (`user`):** `user@foodstore.com` / `user1234`

### 2. Frontend (`React + TypeScript + Vite`)
```powershell
cd frontend
pnpm install
pnpm dev
```
- **Aplicación Web:** `http://localhost:5173`

---

## 👤 Autoría

- **Alumna:** Erika Gonzalez
- **Carrera:** Tecnicatura Universitaria en Programación a Distancia (TUPaD - UTN)
- **Año:** 2026
