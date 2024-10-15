import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api/api.service';
import { UfService } from '../../../services/uf/uf-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-planta-1',
  templateUrl: './planta-1.component.html',
  styleUrls: ['./planta-1.component.css']
})
export class Planta1Component implements OnInit {

  datos: any[] = []; // Almacenar datos de materias primas
  aditivosEspeciales: any[] = []; // Almacenar datos de aditivos especiales
  ufValue: number | null = null; // Valor de la UF inicializado como null


  constructor(
    private router: Router,
    private apiService: ApiService,
    private ufService: UfService,
  ) {
    // Inicialización del formulario con validaciones

  }

  ngOnInit(): void {

    // Obtener el valor de la UF
    this.ufService.getUfValue().subscribe(
      (data) => {
        this.ufValue = data.serie[0].valor;
        console.log('Valor de la UF:', this.ufValue); // Verifica el valor
      },
      (error) => {
        console.error('Error al obtener el valor de la UF:', error);
      }
    );
    //Obtener materias primas TALTAL
    this.apiService.getMateriasPrimasTALTAL().subscribe(
      (data) => {
        this.datos = data;
      },
      (error) => {
        console.error('Error al obtener materias primas:', error);
      }
    );

    this.apiService.getAditivosEspeciales().subscribe(
      (response) => {
        this.aditivosEspeciales = response;
        console.log('Aditivos especiales:', this.aditivosEspeciales); // Verifica la respuesta
      },
      (error) => {
        console.error('Error al obtener datos de aditivos especiales:', error);
      }
    );
  }




  // Método para calcular Densidad $/kg
  calcularDensidadKg(aditivo: any): string {
    const aditivosSinCalculo = [
      'DARAFILL',
      'SIKAFIBER FORCE-48',
      'SIKA WT240',
      'DELVO',
      'PERLAS',
      'SIKA CNI',
      'BARCHIP54'
    ];

    if (aditivosSinCalculo.includes(aditivo.nombre)) {
      return aditivo.precio_por_kg ? aditivo.precio_por_kg.toFixed(2) : 'N/A';
    }

    if (aditivo.precio_por_litro && aditivo.densidad_kg_litro) {
      return (aditivo.precio_por_litro / aditivo.densidad_kg_litro).toFixed(2);
    }

    return 'N/A';
  }

  // Método para calcular UF/kg por visco
  calcularUFPorKgVisco(aditivo: any): string {
    const densidadKg = this.calcularDensidadKg(aditivo);
    if (densidadKg !== 'N/A' && this.ufValue) {
      return (Number(densidadKg) / this.ufValue).toFixed(2);
    }
    return 'N/A';
  }
}
