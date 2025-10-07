import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MateriaPrima } from '../../models/materia-prima.model';
import { Producto } from '../../models/producto.model';
import { Dosificacion } from '../../models/dosificacion.model';
import { AditivoEspecial } from '../../models/aditivoEspecial.model';
import { CostoGeneral } from '../../models/costo-general.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  //private apiUrlBase = 'https://localhost:44364/api/';

  private apiUrlBase = 'https://backendcopat2025-gtc2ccgcd3h0ceg0.canadaeast-01.azurewebsites.net/api/';

  constructor(private http: HttpClient) {}

updateMateriaPrimaAntofagasta(id: number, data: { nombreProducto: string, precio: number }): Observable<any> {
  return this.http.put(`${this.apiUrlBase}materiasprimasantofagasta/${id}`, data);
}

  getProveedoresAntofagasta(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrlBase}proveedor/proveedores`);
}

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

  getAditivosEspeciales(): Observable<AditivoEspecial[]> {
    return this.http.get<AditivoEspecial[]>(
      `${this.apiUrlBase}aditivoespecial`
    );
  }

  getAditivoEspecialById(id: number): Observable<AditivoEspecial> {
    return this.http.get<AditivoEspecial>(
      `${this.apiUrlBase}aditivoespecial/${id}`
    );
  }

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

  getPorcentajePerdida(
    plantaId: number,
    materialId: number
  ): Observable<number> {
    const url = `${this.apiUrlBase}MateriaPrima/perdida/${plantaId}/${materialId}`;
    return this.http.get<number>(url);
  }

  getMateriaPrimaPorNombre(
    plantaId: number,
    nombre: string
  ): Observable<MateriaPrima> {
    const url = `${this.apiUrlBase}MateriaPrima/buscar/${plantaId}/${nombre}`;
    return this.http.get<MateriaPrima>(url);
  }

  actualizarMateriaPrima(
    plantaId: number,
    productoId: number,
    precio: number,
    perdida: number,
    tipo: string
  ): Observable<any> {
    const url = `${this.apiUrlBase}MateriaPrima/actualizar/${plantaId}/${productoId}`;
    const body = { precio, perdida, tipo };
    return this.http.put(url, body, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getDosificacionByNomenclatura(descripcionATecnica: string, idPlanta: number) {
    const params = new HttpParams()
      .set('descripcionATecnica', descripcionATecnica)
      .set('idPlanta', idPlanta.toString());
    return this.http.get<Dosificacion>(
      `${this.apiUrlBase}Dosificacion/nomenclatura`,
      { params }
    );
  }

  updateProductDescription(
    numeroFormula: number,
    nombreComercial: string
  ): Observable<Producto> {
    const url = `${this.apiUrlBase}producto/update-description/${numeroFormula}`;

    return this.http.put<Producto>(url, JSON.stringify(nombreComercial), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getDosificacionByNombreComercial(
  nombreComercial: string,
  idPlanta: number
): Observable<Dosificacion> {
  // Usar query parameters en lugar de path parameters
  const params = new HttpParams()
    .set('nombreComercial', nombreComercial)
    .set('idPlanta', idPlanta.toString());

  return this.http.get<Dosificacion>(
    `${this.apiUrlBase}Dosificacion/dosificacion`,
    { params }
  );
}

  buscarNombresComerciales(
    termino: string,
    idPlanta: number
  ): Observable<any[]> {
    const params = new HttpParams()
      .set('termino', termino)
      .set('idPlanta', idPlanta.toString());

    return this.http
      .get<any[]>(`${this.apiUrlBase}Dosificacion/buscar-nombres-comerciales`, {
        params,
      })
      .pipe(
        catchError(() => of([]))
      );
  }

  getCostosGenerales(): Observable<CostoGeneral[]> {
    return this.http.get<CostoGeneral[]>(`${this.apiUrlBase}CostoGeneral`);
  }

  createCostosGenerales(costo: CostoGeneral): Observable<CostoGeneral> {
    return this.http.post<CostoGeneral>(
      `${this.apiUrlBase}CostoGeneral`,
      costo
    );
  }

  updateCostoGeneral(id: number, costo: CostoGeneral): Observable<void> {
    return this.http.put<void>(`${this.apiUrlBase}CostoGeneral/${id}`, costo);
  }

  deleteCostoGeneral(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlBase}CostoGeneral/${id}`);
  }

  // En tu api.service.ts
getMateriasPrimasAntofagasta(proveedorId: number): Observable<any[]> {
  // Asegurarse de que proveedorId sea un número
  const id = Number(proveedorId);
  console.log('Solicitando productos para proveedor ID:', id);

  const url = `${this.apiUrlBase}MateriasPrimasAntofagasta/${id}`;
  return this.http.get<any[]>(url).pipe(
    catchError((error) => {
      console.error('Error al obtener materias primas de Antofagasta:', error);
      return of([]);
    })
  );
}

// Método para obtener todas las materias primas de Antofagasta (opcional)
getAllMateriasPrimasAntofagasta(): Observable<any[]> {
  const url = `${this.apiUrlBase}MateriasPrimasAntofagasta`;
  return this.http.get<any[]>(url).pipe(
    catchError((error) => {
      console.error('Error al obtener todas las materias primas de Antofagasta:', error);
      return of([]);
    })
  );
}
}
