import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MateriaPrima } from '../../models/materia-prima.model';
import { Producto } from '../../models/producto.model';
import { Dosificacion } from '../../models/dosificacion.model';
import { AditivoEspecial } from '../../models/aditivoEspecial.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  //private apiUrlBase = 'https://localhost:44364/api/';

    private apiUrlBase = 'https://backendcopatapirest20241105111006.azurewebsites.net/api/';

  constructor(private http: HttpClient) {}

  // Métodos relacionados con Producto
  getFamilias(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrlBase}producto/familias`);
  }

  getUltimoNumeroFormula(familia: number): Observable<number> {
    return this.http
      .get<number>(
        `${this.apiUrlBase}producto/ultimo-numero-formula/${familia}`
      )
      .pipe(catchError(() => of(1000)));
  }

  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrlBase}producto`, producto);
  }

  getUltimoProducto(): Observable<Producto | null> {
    return this.http
      .get<Producto>(`${this.apiUrlBase}producto/ultimo-producto`)
      .pipe(catchError(() => of(null)));
  }

  getProductoByNumeroFormula(
    numeroFormula: number
  ): Observable<Producto | null> {
    return this.http
      .get<Producto | null>(`${this.apiUrlBase}producto/${numeroFormula}`)
      .pipe(catchError(() => of(null)));
  }

  createMultipleProductos(productos: Producto[]): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrlBase}producto/multiples`,
      productos
    );
  }

  // Métodos relacionados con Dosificacion
  createDosificacion(dosificacion: Dosificacion): Observable<Dosificacion> {
    const { idDosificacion, producto, ...data } = dosificacion as any;
    return this.http.post<Dosificacion>(`${this.apiUrlBase}Dosificacion`, data);
  }

  getDosificacionByProducto(idProducto: number): Observable<Dosificacion> {
    return this.http.get<Dosificacion>(
      `${this.apiUrlBase}dosificacion/${idProducto}`
    );
  }

  getDosificacionByProductoYPlanta(
    idProducto: number,
    idPlanta: number
  ): Observable<Dosificacion> {
    return this.http.get<Dosificacion>(
      `${this.apiUrlBase}dosificacion/${idProducto}/${idPlanta}`
    );
  }

  updateDosificacionPorNumeroFormula(
    numeroFormula: number,
    dosificacion: Dosificacion
  ): Observable<Dosificacion> {
    return this.http.put<Dosificacion>(
      `${this.apiUrlBase}dosificacion/${numeroFormula}`,
      dosificacion
    );
  }

  actualizarDosificacion(
    numeroFormula: number,
    dosificacion: Dosificacion
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrlBase}dosificacion/${numeroFormula}`,
      dosificacion
    );
  }

  // Método adicional para obtener los precios de los aditivos especiales
  getAditivosEspeciales(): Observable<AditivoEspecial[]> {
    return this.http.get<AditivoEspecial[]>(
      `${this.apiUrlBase}aditivoespecial`
    );
  }

  // Método en ApiService para obtener un aditivo especial por su ID
  getAditivoEspecialById(id: number): Observable<AditivoEspecial> {
    return this.http.get<AditivoEspecial>(
      `${this.apiUrlBase}aditivoespecial/${id}`
    );
  }

  // Métodos relacionados con Materia Prima
  getMateriasPrimas(planta: string): Observable<MateriaPrima[]> {
    const url = `${this.apiUrlBase}MateriaPrima/${planta}`;
    return this.http.get<MateriaPrima[]>(url);
  }

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

  getDosificaciones(): Observable<Dosificacion[]> {
    return this.http.get<Dosificacion[]>(`${this.apiUrlBase}dosificacion`);
  }

  getPorcentajePerdida(plantaId: number, materialId: number): Observable<number> {
    const url = `${this.apiUrlBase}MateriaPrima/perdida/${plantaId}/${materialId}`;
    return this.http.get<number>(url);
  }

  getMateriaPrimaPorNombre(plantaId: number, nombre: string): Observable<MateriaPrima> {
    const url = `${this.apiUrlBase}MateriaPrima/buscar/${plantaId}/${nombre}`;
    return this.http.get<MateriaPrima>(url);
  }

  actualizarMateriaPrima(
    plantaId: number,
    productoId: number,
    precio: number,
    perdida: number
  ): Observable<any> {
    const url = `${this.apiUrlBase}MateriaPrima/actualizar/${plantaId}/${productoId}`;
    const body = { precio, perdida };
    return this.http.put(url, body, {
      headers: { 'Content-Type': 'application/json' },
    });
  }




}
