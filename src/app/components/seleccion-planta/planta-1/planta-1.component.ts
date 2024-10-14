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

  datos: any[] = []; // Para almacenar datos de materias_primas
  aditivosEspeciales: any[] = []; // Para almacenar datos de aditivos_especiales
  ufValue!: number;

  diseno: any[] = [
    {
      cantidad: '',
      tipoHormigon: '',
      cemento: '',
      grava: '',
      gravilla: '',
      arena: '',
      agua: '',
      aditivoBase: '',
      aditivo2: '',
      porcentajePerdida: '',
      porcentajePerdidaGrava: ''
    }
  ];

  myForm: FormGroup;
  controlNames = Array.from({ length: 9 }, (_, i) => `field${i + 1}`);

  constructor(private router: Router, private apiService: ApiService, private ufService: UfService, private fb: FormBuilder) {
    this.myForm = this.fb.group(
      this.controlNames.reduce((controls: { [key: string]: any }, name: string) => {
        controls[name] = [
          '',
          [Validators.required, Validators.pattern(/^\d+(\.\d{1})?$/)]
        ];
        return controls;
      }, {})
    );
  }


  onSubmit() {
    if (this.myForm.valid) {
      console.log(this.myForm.value);
    }
  }


  ngOnInit(): void {
    this.apiService.getMateriasPrimasPorPlanta('taltal').subscribe(
      (response) => {
        this.datos = response;
      },
      (error) => {
        console.error('Error al obtener datos de materias_primas:', error);
      }
    );

    // Obtener datos de aditivos especiales
    this.apiService.getAditivosEspeciales().subscribe(
      (response) => {
        this.aditivosEspeciales = response;
      },
      (error) => {
        console.error('Error al obtener datos de aditivos_especiales:', error);
      }
    );

    // Obtener el valor actual de la UF
    this.ufService.getUfValue().subscribe(data => {
      this.ufValue = data.serie[0].valor;
    });
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

    // Verificar si el nombre del aditivo está en la lista de aditivos sin cálculo
    if (aditivosSinCalculo.includes(aditivo.nombre)) {
      return aditivo.precio_por_kg ? aditivo.precio_por_kg.toFixed(2) : 'N/A';
    }

    return aditivo.densidad_kg_litro ? (aditivo.precio_por_litro / aditivo.densidad_kg_litro).toFixed(2) : 'N/A';
  }

  // Método para calcular UF/kg por visco
  calcularUFPorKgVisco(aditivo: any): string {
    const densidadKg = this.calcularDensidadKg(aditivo);
    return densidadKg !== 'N/A' ? (Number(densidadKg) / this.ufValue).toFixed(2) : 'N/A';
  }



}
