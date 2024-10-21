import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface MateriaPrima {
  producto: string;
  densidad: number | null;
  precio: string; // o puedes usar number, dependiendo de tus requisitos
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Actualiza baseUrl para que apunte a tu servidor Node.js local
  private baseUrl = 'http://localhost:3000/';

  private apiUrlMATERIAS_PRIMAS_TALTAL = `${this.baseUrl}materias_primas`;

  constructor(private http: HttpClient) { }

  // Obtener materias primas de TALTAL
  getMateriasPrimasTALTAL(): Observable<MateriaPrima[]> {
    return this.http.get<MateriaPrima[]>(`${this.apiUrlMATERIAS_PRIMAS_TALTAL}`);
  }

  // Obtener aditivos especiales
  getAditivosEspeciales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}aditivos_especiales`);
  }

  cargarDatos(datos: any[]): Observable<any> {
    return this.http.post('http://localhost:3000/insertar_disenos', datos, { responseType: 'text' });
  }
}
