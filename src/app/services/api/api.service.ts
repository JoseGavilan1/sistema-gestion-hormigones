import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface MateriaPrima {
  producto: string;
  densidad: number | null;
  precio: string; // o number dependiendo de tu necesidad
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:3000/'; // Define la base URL para evitar duplicación

  private apiUrlMATERIAS_PRIMAS_TALTAL = 'http://localhost:3000/materias_primas?planta=TALTAL';

  constructor(private http: HttpClient) { }



  getMateriasPrimasTALTAL(): Observable<MateriaPrima[]> {
    return this.http.get<MateriaPrima[]>(this.apiUrlMATERIAS_PRIMAS_TALTAL);
  }


  // Obtener aditivos especiales
  getAditivosEspeciales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}aditivos_especiales`);
  }

}
