import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MateriaPrima } from '../../models/materia-prima.model';
import { Producto } from '../../models/producto.model'; // Asegúrate de definir el modelo Producto
import { Dosificacion } from '../../models/dosificacion.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  updateProducto(producto: Producto): Observable<Producto> {
    // Cambia la URL por la de tu API de actualización
    return this.http.put<Producto>(
      `${this.apiUrlBase}producto/${producto.numeroFormula}`,
      producto
    );
  }
  private apiUrlBase = 'https://localhost:44364/api/';

  constructor(private http: HttpClient) {}

  // Obtener materias primas de una planta específica
  getMateriasPrimas(planta: string): Observable<MateriaPrima[]> {
    const url = `${this.apiUrlBase}MateriaPrima/${planta}`;
    return this.http.get<MateriaPrima[]>(url);
  }

  // Actualizar el precio de un producto en una planta
  actualizarPrecio(
    plantaId: number,
    productoId: number,
    precio: number
  ): Observable<any> {
    const url = `${this.apiUrlBase}MateriaPrima/actualizar/${plantaId}/${productoId}`;
    return this.http.put(url, precio, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Obtener familias de productos
  getFamilias(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrlBase}producto/familias`);
  }

  // Obtener el último número de fórmula para una familia específica
  getUltimoNumeroFormula(familia: number): Observable<number> {
    return this.http
      .get<number>(
        `${this.apiUrlBase}producto/ultimo-numero-formula/${familia}`
      )
      .pipe(
        catchError(() => of(1000)) // Si hay error, retorna 1000 como valor por defecto
      );
  }

  // Crear un nuevo producto
  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrlBase}producto`, producto);
  }

  // Obtener el último producto ingresado
  getUltimoProducto(): Observable<Producto | null> {
    return this.http
      .get<Producto>(`${this.apiUrlBase}producto/ultimo-producto`)
      .pipe(catchError(() => of(null)));
  }

  createDosificacion(dosificacion: Dosificacion): Observable<Dosificacion> {
    // Remueve el `idDosificacion` y `producto` antes de enviar
    const { idDosificacion, producto, ...data } = dosificacion as any; // Quita los campos extra
    return this.http.post<Dosificacion>(`${this.apiUrlBase}Dosificacion`, data);
  }

  getDosificacionByProducto(idProducto: number): Observable<Dosificacion> {
    return this.http.get<Dosificacion>(
      `${this.apiUrlBase}dosificacion/${idProducto}`
    );
  }

  // En el servicio ApiService
  updateDosificacionPorNumeroFormula(numeroFormula: number, dosificacion: Dosificacion): Observable<Dosificacion> {
    return this.http.put<Dosificacion>(`${this.apiUrlBase}dosificacion/${numeroFormula}`, dosificacion);
  }



  obtenerDosificacion(idProducto: number): Observable<any> {
    return this.http.get(`${this.apiUrlBase}dosificacion/${idProducto}`);
  }

  actualizarDosificacion(numeroFormula: number, dosificacion: Dosificacion): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrlBase}dosificacion/${numeroFormula}`,
      dosificacion
    );
  }


  createMultipleProductos(productos: Producto[]): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrlBase}producto/multiples`,
      productos
    );
  }

  // Método para verificar si el producto ya existe en la base de datos
  getProductoByNumeroFormula(
    numeroFormula: number
  ): Observable<Producto | null> {
    return this.http
      .get<Producto | null>(`${this.apiUrlBase}producto/${numeroFormula}`)
      .pipe(
        catchError(() => of(null)) // Si ocurre un error o no existe, devolvemos null
      );
  }

  insertarDosificacion(
    dosificacionData: Dosificacion
  ): Observable<Dosificacion> {
    return this.http.post<Dosificacion>(
      `${this.apiUrlBase}Dosificacion`,
      dosificacionData
    );
  }

  getDosificacionByProductoYPlanta(idProducto: number, idPlanta: number): Observable<Dosificacion> {
    return this.http.get<Dosificacion>(`api/dosificaciones/${idProducto}/${idPlanta}`);
  }

}
