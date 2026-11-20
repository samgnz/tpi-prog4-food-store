import type { Categoria } from "@/features/categories";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  disponible: boolean;
  imagenes_url?: string[];
  categorias?: Categoria[];
}

export interface ProductoPayload {
  nombre: string;
  descripcion: string;
  precio_base: number;
  disponible: boolean;
  imagenes_url?: string[];
  categoria_ids?: number[];
}

export interface ProductoFormValues {
  nombre: string;
  descripcion: string;
  precio_base: number;
  disponible: boolean;
  categoria_ids: number[];
}
