import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { UfService } from '../../../services/uf/uf-service.service';

@Component({
  selector: 'app-planta-1',
  templateUrl: './planta-1.component.html',
  styleUrls: ['./planta-1.component.css']
})
export class Planta1Component implements OnInit {

  datos: any[] = []; // Para almacenar datos de materias_primas
  aditivosEspeciales: any[] = []; // Para almacenar datos de aditivos_especiales
  ufValue!: number;



  constructor(private router: Router, private apiService: ApiService, private ufService: UfService) {}

  ngOnInit(): void {
    this.apiService.getMateriasPrimas().subscribe(
      (response) => {
        this.datos = response;
      },
      (error) => {
        console.error('Error al obtener datos de materias_primas:', error);
      }
    );

    this.apiService.getAditivosEspeciales().subscribe(
      (response) => {
        this.aditivosEspeciales = response;
      },
      (error) => {
        console.error('Error al obtener datos de aditivos_especiales:', error);
      }
    );

    this.ufService.getUfValue().subscribe(data => {
      this.ufValue = data.serie[0].valor;
    });
  }

  // Método para calcular Densidad $/kg para el aditivo VISCOCRETE
  calcularDensidadKg(aditivo: any): string {
    if (aditivo.precio_por_litro && aditivo.densidad_kg_lt) {
      return (aditivo.precio_por_litro / aditivo.densidad_kg_lt).toFixed(2);
    }
    return 'N/A';
  }

  // Método para calcular UF/kg para el aditivo VISCOCRETE
  calcularUFPorKgVisco(aditivo: any): string {
    const densidadKg = this.calcularDensidadKg(aditivo);
    if (this.ufValue && densidadKg !== 'N/A') {
      return (parseFloat(densidadKg) / this.ufValue).toFixed(3);
    }
    return 'N/A';
  }

  // Método para calcular UF/kg para el aditivo DARAFILL
  calcularUFPorKgDara(aditivo: any): string {
    if (this.ufValue && aditivo.precio_kg) {
        const ufKgValue = (aditivo.precio_kg / this.ufValue).toFixed(3);
        return ufKgValue;
    }
    console.error('Datos insuficientes para calcular UF/kg para DARAFILL:', { ufValue: this.ufValue, precio_kg: aditivo.precio_kg });
    return 'N/A';
}

  logout() {
    this.router.navigate(['/login']);
  }
}
