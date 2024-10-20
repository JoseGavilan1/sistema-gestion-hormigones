import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface MateriaPrima {
  producto: string;
  densidad: number | null;
  precio: string; // or number, depending on your requirements
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Update the baseUrl to point to your deployed Node.js server's URL
  private baseUrl = 'https://backend-copat.netlify.app/';

  private apiUrlMATERIAS_PRIMAS_TALTAL = `${this.baseUrl}materias_primas?planta=TALTAL`;

  constructor(private http: HttpClient) { }

  getMateriasPrimasTALTAL(): Observable<MateriaPrima[]> {
    return this.http.get<MateriaPrima[]>(this.apiUrlMATERIAS_PRIMAS_TALTAL);
  }

  // Fetch special additives
  getAditivosEspeciales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}aditivos_especiales`);
  }
}
