export interface Dosificacion {
  idDosificacion: number;     // Coincide con el backend
  idProducto: number;         // Coincide con el backend
  cemento: number;            // Coincide con el backend
  aguaTotal: number;          // Coincide con el backend
  arena: number;              // Coincide con el backend
  gravilla: number;           // Coincide con el backend
  aditivo1?: number | null;   // Coincide con el backend
  aditivo2?: number | null;   // Coincide con el backend
  aditivo3?: number | null;   // Coincide con el backend
  aditivo4?: number | null;   // Coincide con el backend
  aditivo5?: number | null;   // Coincide con el backend
  idPlanta?: number | null;   // Coincide con el backend
  descripcion: string;        // Coincide con el backend
}
