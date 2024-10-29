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
  private apiUrlBase = 'https://localhost:44364/api/';

  constructor(private http: HttpClient) {}

  // Obtener materias primas de una planta específica
  getMateriasPrimas(planta: string): Observable<MateriaPrima[]> {
    const url = `${this.apiUrlBase}MateriaPrima/${planta}`;
    return this.http.get<MateriaPrima[]>(url);
  }

  // Actualizar el precio de un producto en una planta
  actualizarPrecio(plantaId: number, productoId: number, precio: number): Observable<any> {
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
    return this.http.get<number>(`${this.apiUrlBase}producto/ultimo-numero-formula/${familia}`).pipe(
      catchError(() => of(1000)) // Si hay error, retorna 1000 como valor por defecto
    );
  }

  // Crear un nuevo producto
  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrlBase}producto`, producto);
  }

  // Obtener el último producto ingresado
  getUltimoProducto(): Observable<Producto | null> {
    return this.http.get<Producto>(`${this.apiUrlBase}producto/ultimo-producto`).pipe(
      catchError(() => of(null)) // Devuelve null en caso de error
    );
  }

  createDosificacion(dosificacion: Dosificacion): Observable<Dosificacion> {
    return this.http.post<Dosificacion>(`${this.apiUrlBase}dosificaciones`, dosificacion);
  }

}
