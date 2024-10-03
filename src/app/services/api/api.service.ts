import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:4000/api/PLANTATOCOPILLA'; // URL de tu API

  constructor(private http: HttpClient) { }

  getDatos(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getFiles(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/api/files');
  }

  uploadFile(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }
}
