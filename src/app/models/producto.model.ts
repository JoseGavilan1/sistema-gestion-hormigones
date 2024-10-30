export interface Producto {
  idProducto: number; // Asegúrate de que este campo se asigna después de crear el producto
  numeroFormula: number;
  familia: number;
  descripcionATecnica: string;
  insertDate?: Date; // Esta propiedad puede ser opcional
}
