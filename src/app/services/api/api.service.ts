import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:3000/api'; // Define la base URL para evitar duplicación

  constructor(private http: HttpClient) { }

  // Obtener materias primas filtradas por planta
  getMateriasPrimasPorPlanta(planta: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${planta}/materias_primas`);
  }

  // Obtener aditivos especiales
  getAditivosEspeciales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/aditivos_especiales`);
  }

  // Obtener precios por planta (si es necesario)
  getPreciosPorPlanta(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/precios_por_planta`);
  }
}
