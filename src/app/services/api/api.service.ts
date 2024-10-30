import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MateriaPrima } from '../../models/materia-prima.model';
import { Producto } from '../../models/producto.model';
import { Dosificacion } from '../../models/dosificacion.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrlBase = 'https://localhost:44364/api/';

  constructor(private http: HttpClient) {}

  getMateriasPrimas(planta: string): Observable<MateriaPrima[]> {
    const url = `${this.apiUrlBase}MateriaPrima/${planta}`;
    return this.http.get<MateriaPrima[]>(url);
  }

  actualizarPrecio(plantaId: number, productoId: number, precio: number): Observable<any> {
    const url = `${this.apiUrlBase}MateriaPrima/actualizar/${plantaId}/${productoId}`;
    return this.http.put(url, precio, { headers: { 'Content-Type': 'application/json' } });
  }

  getFamilias(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrlBase}producto/familias`);
  }

  getUltimoNumeroFormula(familia: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrlBase}producto/ultimo-numero-formula/${familia}`)
      .pipe(catchError(() => of(1000)));
  }

  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrlBase}producto`, producto);
  }

  getUltimoProducto(): Observable<Producto | null> {
    return this.http.get<Producto>(`${this.apiUrlBase}producto/ultimo-producto`)
      .pipe(catchError(() => of(null)));
  }

  createDosificacion(dosificacion: Dosificacion): Observable<Dosificacion> {
    const { idDosificacion, producto, ...data } = dosificacion as any;
    return this.http.post<Dosificacion>(`${this.apiUrlBase}Dosificacion`, data);
  }

  getDosificacionByProducto(idProducto: number): Observable<Dosificacion> {
    return this.http.get<Dosificacion>(`${this.apiUrlBase}dosificacion/${idProducto}`);
  }

  actualizarDosificacion(id: number, dosificacion: Dosificacion): Observable<Dosificacion> {
    return this.http.put<Dosificacion>(`${this.apiUrlBase}dosificacion/${id}`, dosificacion);
  }

  obtenerDosificacion(idProducto: number, idPlanta: number): Observable<Dosificacion> {
    return this.http.get<Dosificacion>(`${this.apiUrlBase}dosificacion?idProducto=${idProducto}&idPlanta=${idPlanta}`);
  }
}
