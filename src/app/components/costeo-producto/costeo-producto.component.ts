import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../../services/api/api.service';
import { Dosificacion } from '../../models/dosificacion.model';
import { UfService } from '../../services/uf/uf-service.service';

@Component({
  selector: 'app-costeo-producto',
  templateUrl: './costeo-producto.component.html',
  styleUrls: ['./costeo-producto.component.css'],
})
export class CosteoProductoComponent {
  plantas = [
    { id: 1, nombre: 'TALTAL' },
    { id: 2, nombre: 'MEJILLONES' },
    { id: 3, nombre: 'ANTOFAGASTA' },
    { id: 4, nombre: 'MARIA ELENA' },
    { id: 5, nombre: 'CALAMA' },
    { id: 6, nombre: 'TOCOPILLA' },
  ];

  datosExcel: any[] = [];
  plantaSeleccionada: number | null = null;
  nombrePlantaSeleccionada: string | null = null;
  idProducto: number | null = null;
  dosificacion: Dosificacion | null = null;

  precioCemento: number = 0;
  precioAgua: number = 0;
  precioArena: number = 0;
  precioGravilla: number = 0;
  precioGrava: number = 0;
  densidadArena: number = 0;
  densidadGravilla: number = 0;
  densidadGrava: number = 0;
  densidadAgua: number = 0.36;
  ufValue: number = 0;
  ufLaboratorio: number = 0.1;

  costoCemento: number = 0;
  costoAgua: number = 0;
  costoArena: number = 0;
  costoGravilla: number = 0;
  costoGrava: number = 0;
  costoTotal: number = 0;
  costoFinal: number = 0;
  costoAridos: number = 0;

  porcentajeDePerdida: number = 0.02;

  constructor(private apiService: ApiService, private ufService: UfService) {}

  seleccionarPlanta(idPlanta: number) {
    const planta = this.plantas.find((p) => p.id === idPlanta);
    if (planta) {
      this.plantaSeleccionada = idPlanta;
      this.nombrePlantaSeleccionada = planta.nombre;
    }
  }

  costearProducto() {
    if (this.idProducto && this.plantaSeleccionada !== null) {
      console.log(
        'Buscando dosificación para:',
        this.idProducto,
        'en planta:',
        this.plantaSeleccionada
      );

      this.apiService
        .getDosificacionByProductoYPlanta(
          this.idProducto,
          this.plantaSeleccionada
        )
        .subscribe({
          next: (dosificacion) => {
            this.dosificacion = dosificacion;
            console.log('Dosificación encontrada:', dosificacion);

            this.ufService.getUfValue().subscribe({
              next: (ufData) => {
                this.ufValue = ufData;
                console.log('Valor de la UF:', this.ufValue);
                this.obtenerPreciosMateriasPrimas();
              },
              error: (err) => {
                console.log('Error al obtener el valor de la UF:', err);
                alert('No se pudo obtener el valor de la UF.');
              },
            });
          },
          error: (err) => {
            console.log('Error al obtener dosificación:', err);
            alert(
              'No se encontró la dosificación para este producto en la planta seleccionada.'
            );
          },
        });
    } else {
      alert('Por favor, selecciona una planta e ingresa el ID del producto.');
    }
  }

  obtenerPreciosMateriasPrimas() {
    if (this.nombrePlantaSeleccionada) {
      this.apiService
        .getMateriasPrimas(this.nombrePlantaSeleccionada)
        .subscribe({
          next: (materias) => {
            const cemento = materias.find((m) => m.nombre === 'CEMENTO');
            const agua = materias.find((m) => m.nombre === 'AGUA');
            const arena = materias.find((m) => m.nombre === 'ARENA');
            const gravilla = materias.find((m) => m.nombre === 'GRAVILLA');
            const grava = materias.find((m) => m.nombre === 'GRAVA');

            if (cemento) this.precioCemento = cemento.precio;
            if (agua) this.precioAgua = agua.precio;
            if (arena) {
              this.precioArena = arena.precio;
              this.densidadArena = arena.densidad;
            }
            if (gravilla) {
              this.precioGravilla = gravilla.precio;
              this.densidadGravilla = gravilla.densidad;
            }
            if (grava) {
              this.precioGrava = grava.precio;
              this.densidadGrava = grava.densidad;
            }

            this.calcularCostos();
          },
          error: (err) => {
            console.log(
              'Error al obtener los precios de las materias primas:',
              err
            );
            alert('No se pudieron obtener los precios de las materias primas.');
          },
        });
    }
  }

  calcularCostos() {
    if (this.dosificacion) {
      this.costoCemento =
        (this.dosificacion.cemento * this.precioCemento) / this.ufValue;

      this.costoAgua = 0.36 * this.precioAgua /this.ufValue;

      const arenaAjustada = this.dosificacion.arena / this.densidadArena;
      this.costoArena = (arenaAjustada * this.precioArena) / this.ufValue;

      const gravillaAjustada =
        this.dosificacion.gravilla / this.densidadGravilla;
      this.costoGravilla =
        (gravillaAjustada * this.precioGravilla) / this.ufValue;

      this.costoTotal =
        this.costoCemento +
        this.costoAgua +
        this.costoArena +
        this.costoGravilla +
        this.ufLaboratorio +
        this.costoGrava;

      this.costoFinal = this.costoTotal;

      this.costoAridos = this.costoArena + this.costoGravilla

      console.log('Costo total:', this.costoTotal);
      console.log('Costo final:', this.costoFinal);
    }
  }


}
