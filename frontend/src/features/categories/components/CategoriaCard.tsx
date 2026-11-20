import type { Categoria } from "../types/category.types";

interface CategoriaCardProps {
  categoria: Categoria;
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number) => void;
}

export const CategoriaCard = ({
  categoria,
  onEdit,
  onDelete,
}: CategoriaCardProps) => {
  return (
    <tr className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
      <td className="py-3.5 px-4 text-sm text-slate-500 font-normal">
        {categoria.id}
      </td>
      <td className="py-3.5 px-4 text-sm font-medium text-slate-800">
        {categoria.nombre}
      </td>
      <td className="py-3.5 px-4 text-sm text-slate-600">
        {categoria.descripcion}
      </td>
      <td className="py-3.5 px-4 text-sm text-right space-x-3 whitespace-nowrap">
        <button
          type="button"
          onClick={() => onEdit(categoria)}
          className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition-colors"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(categoria.id)}
          className="text-red-500 hover:text-red-700 font-medium cursor-pointer transition-colors"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
};

export default CategoriaCard;
