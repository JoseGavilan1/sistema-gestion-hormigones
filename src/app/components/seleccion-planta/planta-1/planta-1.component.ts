import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { UfService } from '../../../services/uf/uf-service.service';

@Component({
  selector: 'app-planta-1',
  templateUrl: './planta-1.component.html',
  styleUrl: './planta-1.component.css'
})
export class Planta1Component implements OnInit {

  datos: any[] = []; // Para almacenar datos de materias_primas
  aditivosEspeciales: any[] = []; // Para almacenar datos de aditivos_especiales
  ufValue!: number;

  constructor(private router: Router, private apiService: ApiService, private ufService: UfService) {}

  ngOnInit(): void {
    // Obtener datos de materias_primas
    this.apiService.getMateriasPrimas().subscribe(
      (response) => {
        console.log('Datos de materias_primas recibidos:', response);
        this.datos = response;
      },
      (error) => {
        console.error('Error al obtener datos de materias_primas:', error);
      }
    );

    // Obtener datos de aditivos_especiales
    this.apiService.getAditivosEspeciales().subscribe(
      (response) => {
        console.log('Datos de aditivos_especiales recibidos:', response);
        this.aditivosEspeciales = response;
      },
      (error) => {
        console.error('Error al obtener datos de aditivos_especiales:', error);
      }
    );

    // Obtener valor de la UF
    this.ufService.getUfValue().subscribe(data => {
      this.ufValue = data.serie[0].valor;
    });
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
