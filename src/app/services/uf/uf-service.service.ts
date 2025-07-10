import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UfService {
  private apiUrls = [
    'https://mindicador.cl/api/uf',
    //
  ];

  constructor(private http: HttpClient) {}

  getUfValue(): Observable<number> {
    return this.tryUrls(this.apiUrls);
  }

  private tryUrls(urls: string[]): Observable<number> {
    return this.http.get<any>(urls[0]).pipe(
      map((response) => response.serie[0].valor),
      catchError((error) => {
        console.error('Error al obtener el valor de la UF de', urls[0], error);
        if (urls.length > 1) {
          return this.tryUrls(urls.slice(1));
        }
        return throwError('No se pudo obtener el valor de la UF, inténtelo más tarde.');
      })
    );
  }
}
