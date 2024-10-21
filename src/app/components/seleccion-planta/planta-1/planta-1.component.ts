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

  datos: any[] = [];
  aditivosEspeciales: any[] = [];
  ufValue: number = 0

  cantidadDiseño: number=0;
  tipoHormigon: string = '';
  cemento: number = 0;
  kgGrava: number = 0;
  kgGravilla: number = 0;
  kgArena: number = 0;
  agua: number= 0;
  aditivo: number = 0;
  aditivo2: number = 0;
  porcentajeCemento: number = 0;
  porcentajeGrava: number = 0;
  porcentajeGravilla: number = 0;
  porcentajeArena: number = 0;
  porcentajeAgua: number= 0;
  porcentajeAditivo: number = 0;
  porcentajeAditivo2: number = 0;
  porcentajeMix: number = 0;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private ufService: UfService,
  ) {}

  ngOnInit(): void {

    this.ufService.getUfValue().subscribe(
      (data) => {
        this.ufValue = data.serie[0].valor;
        console.log('Valor de la UF:', this.ufValue);
      },
      (error) => {
        console.error('Error al obtener el valor de la UF:', error);
      }
    );
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
        console.log('Aditivos especiales:', this.aditivosEspeciales);
      },
      (error) => {
        console.error('Error al obtener datos de aditivos especiales:', error);
      }
    );
  }

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

    if (aditivo.precio_por_litro && aditivo.densidad) {
      return (aditivo.precio_por_litro / aditivo.densidad).toFixed(2);
    }

    return 'N/A';
  }

  calcularUFPorKgVisco(aditivo: any): string {
    const densidadKg = this.calcularDensidadKg(aditivo);
    if (densidadKg !== 'N/A' && this.ufValue) {
      return (Number(densidadKg) / this.ufValue).toFixed(2);
    }
    return 'N/A';
  }

  calcularResultadoGravilla(): number {
    const gravilla = this.datos.find(dato => dato.producto === 'GRAVILLA');

    if (gravilla && gravilla.densidad && this.kgGravilla > 0) {
      return parseFloat((this.kgGravilla / gravilla.densidad).toFixed(2));
    }

    return 0;
  }

  calcularResultadoGrava(): number {
    const grava = this.datos.find(dato => dato.producto === 'GRAVA');

    if (grava && grava.densidad && this.kgGrava > 0) {
      return parseFloat((this.kgGrava / grava.densidad).toFixed(2));
    }

    return 0;
  }

  calcularResultadoArena(): number {
    const arena = this.datos.find(dato => dato.producto === 'ARENA');

    if (arena && arena.densidad && this.kgArena > 0) {
      return parseFloat((this.kgArena / arena.densidad).toFixed(2));
    }

    return 0;
  }

  sumaMix(): number {
    const resultadoArena = this.calcularResultadoArena();
    const resultadoGrava = this.calcularResultadoGrava();
    const resultadoGravilla = this.calcularResultadoGravilla();

    const sumaTotal = resultadoArena + resultadoGrava + resultadoGravilla;

    return sumaTotal;
  }

  calcularValorAjustado(valor: any, porcentajePerdida: number): string {
    const numeroValor = parseFloat(valor);

    if (!isNaN(numeroValor) && porcentajePerdida) {
      const valorAjustado = numeroValor * (1 + porcentajePerdida / 100);
      return valorAjustado.toFixed(2);
    }
    return 'N/A';
  }



  calcularValorAjustadoSumaMix(): string {
    const resultadoArenaAjustado = parseFloat(this.calcularValorAjustado(this.calcularResultadoArena(), this.porcentajeArena));
    const resultadoGravaAjustado = parseFloat(this.calcularValorAjustado(this.calcularResultadoGrava(), this.porcentajeGrava));
    const resultadoGravillaAjustado = parseFloat(this.calcularValorAjustado(this.calcularResultadoGravilla(), this.porcentajeGravilla));

    if (!isNaN(resultadoArenaAjustado) && !isNaN(resultadoGravaAjustado) && !isNaN(resultadoGravillaAjustado)) {
      const sumaAjustada = resultadoArenaAjustado + resultadoGravaAjustado + resultadoGravillaAjustado;
      return sumaAjustada.toFixed(2);
    }

    return 'N/A';
  }

  calcularPrecio(dato: any): number {
    if (dato && dato.precio && this.ufValue) {
      let cantidad: number = 0;
      let porcentaje: number = 0;

      // Asigna la cantidad y el porcentaje en función del producto
      switch (dato.producto.toUpperCase()) {
        case 'CEMENTO':
          cantidad = this.cemento;
          porcentaje = this.porcentajeCemento;
          break;
        case 'GRAVA':
          cantidad = this.kgGrava;
          porcentaje = this.porcentajeGrava;
          break;
        case 'GRAVILLA':
          cantidad = this.kgGravilla;
          porcentaje = this.porcentajeGravilla;
          break;
        case 'ARENA':
          cantidad = this.kgArena;
          porcentaje = this.porcentajeArena;
          break;
        default:
          return 0; // Si el producto no es reconocido, regresa 0
      }

      // Calcula el valor ajustado con el porcentaje y convierte a UF
      const valorAjustado = cantidad * (1 + porcentaje / 1000);
      const resultado = (valorAjustado * dato.precio) / this.ufValue;
      return parseFloat(resultado.toFixed(2));
    }

    return 0;
  }



}
