import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UfService {

  private apiUrl = 'https://mindicador.cl/api/uf';

  constructor(private http: HttpClient) { }

  getUfValue(): Observable<number> {
    return this.http.get<any>(this.apiUrl).pipe(
      // Extrae y devuelve solo el valor de la UF
      map(response => response.serie[0].valor),
      // Captura y maneja cualquier error
      catchError(error => {
        console.error('Error al obtener el valor de la UF', error);
        return throwError('No se pudo obtener el valor de la UF, inténtelo más tarde.');
      })
    );
  }
}
