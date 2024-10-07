import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private materiasPrimasUrl = 'http://localhost:3000/api/materias_primas'; // URL de la API para materias_primas
  private aditivosEspecialesUrl = 'http://localhost:3000/api/aditivos_especiales'; // URL de la API para aditivos_especiales

  constructor(private http: HttpClient) { }

  // Método para obtener los datos de materias_primas
  getMateriasPrimas(): Observable<any> {
    return this.http.get<any>(this.materiasPrimasUrl);
  }

  // Método para obtener los datos de aditivos_especiales
  getAditivosEspeciales(): Observable<any> {
    return this.http.get<any>(this.aditivosEspecialesUrl);
  }

  getPreciosPorPlanta(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/api/precios_por_planta');
  }

}
