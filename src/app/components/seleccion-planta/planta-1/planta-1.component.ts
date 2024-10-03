import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';

@Component({
  selector: 'app-planta-1',
  templateUrl: './planta-1.component.html',
  styleUrl: './planta-1.component.css'
})
export class Planta1Component {
  constructor(private router: Router, private apiService: ApiService) {}

  logout() {
    this.router.navigate(['/login']);
  }

  datos: any[] = [];

  ngOnInit(): void {
    this.apiService.getDatos().subscribe(
      (response) => {
        console.log('Datos recibidos:', response);
        this.datos = response;
      },
      (error) => {
        console.error('Error al obtener datos:', error);
      }
    );
  }
}
