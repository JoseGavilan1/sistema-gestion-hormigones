import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MateriaPrima } from '../../models/materia-prima.model';  // Usa el modelo desde aquí

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrlBase = 'https://localhost:44364/api/MateriaPrima';

  constructor(private http: HttpClient) { }

  // Obtener materias primas de una planta específica
  getMateriasPrimas(planta: string): Observable<MateriaPrima[]> {
    const url = `${this.apiUrlBase}/${planta}`;
    return this.http.get<MateriaPrima[]>(url);  // Asegúrate de que el tipo es correcto
  }

  actualizarPrecios(planta: string, materiasPrimas: MateriaPrima[]): Observable<any> {
    const url = `${this.apiUrlBase}/actualizar/${planta}`;

    // Aquí envolvemos las materiasPrimas en el formato esperado
    const requestBody = {
        materiasPrimas: materiasPrimas.map(mp => ({
            materiaPrimaId: mp.materiaPrimaId,
            nombre: mp.nombre,
            precio: mp.precio,
            unidadMedida: mp.unidadMedida,
            densidad: mp.densidad,
            plantaId: mp.plantaId
        }))
    };

    return this.http.put(url, requestBody);  // Enviar el cuerpo correctamente
}



}
