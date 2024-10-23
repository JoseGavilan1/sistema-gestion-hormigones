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

  // Endpoint para obtener materias primas de la planta Taltal
  private apiUrlMATERIAS_PRIMAS_TALTAL = 'https://localhost:44364/api/MateriaPrima/taltal';
  private apiUrlMATERIAS_PRIMAS_MEJILLONES = 'https://localhost:44364/api/MateriaPrima/mejillones';

  constructor(private http: HttpClient) { }

  // Obtener materias primas de TALTAL
  getMateriasPrimasTaltal() {
    return this.http.get<any[]>(this.apiUrlMATERIAS_PRIMAS_TALTAL);
  }

  getMateriasPrimasMejillones() {
    return this.http.get<any[]>(this.apiUrlMATERIAS_PRIMAS_MEJILLONES);
  }
}
