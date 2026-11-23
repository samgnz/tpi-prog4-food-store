# Trabajo Práctico Integrador — Food Store (Sistema de Pedidos de Comida)

> **Tecnicatura Universitaria en Programación a Distancia (TUPaD)**  
> **Universidad Tecnológica Nacional (UTN)**  
> **Materia:** Programación IV  
> **Alumna:** Erika Gonzalez

---

## 🔗 Enlaces de Entrega

- **Repositorio público de GitHub (CE-01):** `https://github.com/TU_USUARIO/TU_REPOSITORIO` *(reemplazar por la URL real)*
- **Video de demostración (CE-07):** `https://...` *(reemplazar por el link público del video de 10 a 15 min)*

---

## 📌 Descripción del Sistema

**Food Store** es una aplicación web Full Stack para la gestión de pedidos de un negocio de comidas:
- **Backend (`FastAPI + SQLModel + PostgreSQL/SQLite`):** Arquitectura en capas por dominio (`Router -> Service -> Unit of Work -> Repository -> Model`), autenticación con JWT en cookie `HttpOnly` (`access_token`), autorización por roles (`user` y `admin`), control transaccional de stock (descuento al crear y restitución al cancelar) y máquina de 4 estados del pedido.
- **Frontend (`React 19 + TypeScript strict + Vite + Tailwind CSS 4`):** Arquitectura modular por *features*, cliente HTTP Axios con `withCredentials: true` e interceptor de sesión (`401` / `400`), gestión del estado del servidor con **TanStack Query v5**, formularios validados con **TanStack Form v1**, tablas administrativas con **TanStack Table v8**, estado del cliente con **Zustand v5** (`authStore` y `cartStore` con `persist`) y rutas protegidas con **React Router v7**.

---

## 📋 Requisitos Previos

- **Python:** `3.11`, `3.12` o `3.13` *(Nota: `SQLModel 0.0.22` no es compatible con Python 3.14)*
- **Node.js:** `20.19` o superior
- **pnpm:** `9` o superior
- **Base de datos:** **PostgreSQL 15+** (local o mediante Docker Compose incluido en `backend/docker-compose.yml`). Para desarrollo local también se acepta **SQLite** cambiando `DATABASE_URL=sqlite:///./foodstore.db`.

---

## ⚙️ Configuración y Puesta en Marcha

### 1. Backend (`backend/`)

1. Ingresar al directorio del backend:
   ```powershell
   cd backend
   ```
2. *(Opcional)* Si se utiliza Docker para PostgreSQL, iniciar el contenedor:
   ```powershell
   docker compose up -d
   ```
3. Crear y activar el entorno virtual con Python 3.12 (o 3.11 / 3.13):
   ```powershell
   py -3.12 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
4. Instalar las dependencias con versiones fijadas:
   ```powershell
   pip install -r requirements.txt
   ```
5. Configurar las variables de entorno copiando `.env.example` a `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
   Editar `backend/.env` ajustando las credenciales de PostgreSQL locales (o usar SQLite):
   ```env
   DATABASE_URL=postgresql://usuario:CAMBIAR_PASSWORD@localhost:5432/foodstore_db
   SECRET_KEY=cambiar-esta-clave-secreta-de-al-menos-32-caracteres
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   FRONTEND_ORIGIN=http://localhost:5173
   ```
6. Ejecutar el script de carga inicial (**seed idempotente**):
   ```powershell
   python -m app.db.seed
   ```
7. Iniciar el servidor de desarrollo:
   ```powershell
   uvicorn app.main:app --reload
   ```
   - **API Base URL:** `http://localhost:8000/api/v1`
   - **Swagger UI:** `http://localhost:8000/docs`
   - **ReDoc:** `http://localhost:8000/redoc`

---

### 2. Frontend (`frontend/`)

1. En una nueva terminal, ingresar al directorio del frontend:
   ```powershell
   cd frontend
   ```
2. Copiar el archivo de variables de entorno `.env.example` a `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
   Contenido de `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```
3. Instalar dependencias, verificar el tipado estricto y levantar el servidor:
   ```powershell
   pnpm install
   pnpm build
   pnpm dev
   ```
   - **Aplicación Web:** `http://localhost:5173`

---

## 🔑 Usuario Inicial del Seed (`python -m app.db.seed`)

El seed crea de forma idempotente **4 categorías**, **8 productos con stock** y el usuario administrador requerido por la cátedra:

| Rol | Usuario (`username`) | Contraseña | Email |
| :--- | :--- | :--- | :--- |
| **Administrador (`admin`)** | `admin` | `Admin1234!` | `admin@foodstore.com` |

*(Los usuarios clientes con rol `user` pueden registrarse públicamente desde `/register`).*

---

## 📂 Estructura del Proyecto

```text
tpi-progIV/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, CORS con credenciales y prefijo /api/v1
│   │   ├── core/                    # config.py, database.py, security.py, deps.py, repository.py, unit_of_work.py
│   │   ├── modules/
│   │   │   ├── auth/                # schemas.py, service.py, router.py (/auth/register, /token, /logout, /me)
│   │   │   ├── usuarios/            # models.py, schemas.py, repository.py, unit_of_work.py, service.py, router.py
│   │   │   ├── categorias/          # models.py, schemas.py, repository.py, unit_of_work.py, service.py, router.py
│   │   │   ├── productos/           # models.py, schemas.py, repository.py, unit_of_work.py, service.py, router.py
│   │   │   └── pedidos/             # models.py, schemas.py, repository.py, unit_of_work.py, service.py, router.py
│   │   └── db/
│   │       └── seed.py              # Carga inicial idempotente (python -m app.db.seed)
│   ├── .env.example
│   └── requirements.txt             # Dependencias con versiones fijadas
├── frontend/
│   ├── src/
│   │   ├── features/                # Módulos por dominio: auth, categories, products, pedidos
│   │   ├── shared/                  # api/ (Axios + Interceptor), components/ (Navbar, BadgeEstado, Paginacion, Skeleton, StatusStates)
│   │   ├── store/                   # cartStore.ts (Zustand + persist), themeStore.ts, notificationStore.ts
│   │   ├── routes/                  # AppRouter.tsx y ProtectedRoute.tsx
│   │   ├── App.tsx                  # checkSession al montar
│   │   └── main.tsx                 # QueryClientProvider y BrowserRouter
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.app.json            # TypeScript strict: true
└── README.md
```