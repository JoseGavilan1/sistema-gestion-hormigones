export interface Dosificacion {
  idDosificacion: number;
  idProducto: number;
  cemento: number;
  aguaTotal: number;
  arena: number;
  gravilla: number;
  aditivo1: number;
  nombreAditivo2?: string;
  aditivo2?: number;
  nombreAditivo3?: string;
  aditivo3?: number;
  nombreAditivo4?: string;
  aditivo4?: number;
  nombreAditivo5?: string;
  aditivo5?: number;
  idPlanta: number;
  descripcion: string;
}
