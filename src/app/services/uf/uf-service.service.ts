import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UfService {

  private apiUrl = 'https://mindicador.cl/api/uf';

  constructor(private http: HttpClient) { }

  getUfValue(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

}
