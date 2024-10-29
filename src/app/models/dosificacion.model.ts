export interface Dosificacion {
  idProducto: number;
  cemento: number;
  aguaTotal: number;
  arena: number;
  gravilla: number;
  aditivo1?: number | null;
  aditivo2?: number | null;
  aditivo3?: number | null;
  aditivo4?: number | null;
  aditivo5?: number | null;
  descripcion: string;
}