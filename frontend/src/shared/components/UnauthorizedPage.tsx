import { Link } from "react-router-dom";

export const UnauthorizedPage = () => {
  return (
    <section className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center space-y-4">
      <div className="text-4xl select-none" role="img" aria-label="denegado">
        🚫
      </div>
      <h2 className="text-2xl font-bold text-slate-800">Acceso denegado</h2>
      <p className="text-sm text-slate-600">
        No tenés los permisos o roles necesarios para acceder a esta sección del
        sistema.
      </p>
      <div className="pt-2 flex items-center justify-center gap-3">
        <Link
          to="/"
          className="px-4 py-2 text-sm font-semibold text-white bg-[#4338ca] hover:bg-[#3730a3] rounded-lg shadow-sm transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
};

export default UnauthorizedPage;
