import { Component } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Dosificacion } from '../../models/dosificacion.model';
import { UfService } from '../../services/uf/uf-service.service';
import Swal from 'sweetalert2';
import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-costeo-producto',
  templateUrl: './costeo-producto.component.html',
  styleUrls: ['./costeo-producto.component.css'],
  animations: [
    trigger('detalleAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class CosteoProductoComponent {
  plantas = [
    { id: 1, nombre: 'TALTAL' },
    { id: 2, nombre: 'MEJILLONES' },
    { id: 3, nombre: 'ANTOFAGASTA' },
    { id: 4, nombre: 'MARIA-ELENA' },
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
  precioAditivoBase: number = 0;
  ufValue: number = 0;
  ufLaboratorio: number = 0.1;
  nombreAditivo2: string | null = null;
  nombreAditivo3: string | null = null;
  nombreAditivo4: string | null = null;
  nombreAditivo5: string | null = null;

  costoCemento: number = 0;
  costoAgua: number = 0;
  costoArena: number = 0;
  costoGravilla: number = 0;
  costoGrava: number = 0;
  costoTotal: number = 0;
  costoFinal: number = 0;
  costoAridos: number = 0;
  costoAditivoBase: number = 0;

  cementoAjustado: number = 0;
  gravillaAjustadaConPerdida: number = 0;
  arenaAjustadaConPerdida: number = 0;

  porcentajeDePerdida: number = 0.02;

  mostrarDetalles: boolean = false;

  constructor(private apiService: ApiService, private ufService: UfService) {}

  toggleDetalles() {
    this.mostrarDetalles = !this.mostrarDetalles;
  }

  seleccionarPlanta(idPlanta: number) {
    const planta = this.plantas.find((p) => p.id === idPlanta);
    if (planta) {
      this.plantaSeleccionada = idPlanta;
      this.nombrePlantaSeleccionada = planta.nombre;
      // Mostrar mensaje de selección exitosa
      Swal.fire({
        icon: 'success',
        title: 'Planta seleccionada',
        text: `Has seleccionado la planta ${this.nombrePlantaSeleccionada}`,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  }

  costearProducto() {
    if (this.idProducto && this.plantaSeleccionada !== null) {
      // Mostrar mensaje de carga
      Swal.fire({
        title: 'Cargando dosificación...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.apiService
        .getDosificacionByProductoYPlanta(
          this.idProducto,
          this.plantaSeleccionada
        )
        .subscribe({
          next: (dosificacion) => {
            this.dosificacion = dosificacion;
            Swal.close(); // Cerrar el loading
            // Mostrar mensaje de éxito al cargar dosificación
            Swal.fire({
              icon: 'success',
              title: 'Dosificación cargada',
              text: `Se ha cargado la dosificación para el producto ${this.idProducto}`,
              timer: 1500,
              showConfirmButton: false,
            });

            // Obtener valor UF y continuar con el costeo
            this.ufService.getUfValue().subscribe({
              next: (ufData) => {
                this.ufValue = ufData;
                this.obtenerPreciosMateriasPrimas();
              },
              error: (err) => {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se pudo obtener el valor de la UF.',
                });
              },
            });
          },
          error: (err) => {
            Swal.close(); // Cerrar el loading
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text:
                'No se encontró la dosificación para este producto en la planta seleccionada.',
            });
          },
        });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Información incompleta',
        text: 'Por favor, selecciona una planta e ingresa el ID del producto.',
      });
    }
  }

  obtenerPreciosMateriasPrimas() {
    if (this.nombrePlantaSeleccionada) {
      Swal.fire({
        title: 'Calculando costeo...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.apiService
        .getMateriasPrimas(this.nombrePlantaSeleccionada)
        .subscribe({
          next: (materias) => {
            const cemento = materias.find((m) => m.nombre === 'CEMENTO');
            const agua = materias.find((m) => m.nombre === 'AGUA');
            const arena = materias.find((m) => m.nombre === 'ARENA');
            const gravilla = materias.find((m) => m.nombre === 'GRAVILLA');
            //const grava = materias.find((m) => m.nombre === 'GRAVA');
            const aditivoBase = materias.find(
              (m) => m.nombre === 'ADITIVO BASE'
            );

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
            if (aditivoBase) this.precioAditivoBase = aditivoBase.precio;
            //if (grava) {
            //this.precioGrava = grava.precio;
            //this.densidadGrava = grava.densidad;
            //}

            if (this.dosificacion) {
              this.nombreAditivo2 = this.dosificacion.nombreAditivo2 || null;
              this.nombreAditivo3 = this.dosificacion.nombreAditivo3 || null;
              this.nombreAditivo4 = this.dosificacion.nombreAditivo4 || null;
              this.nombreAditivo5 = this.dosificacion.nombreAditivo5 || null;
            }

            this.calcularCostos();
            Swal.close(); // Cerrar el loading

            // Mostrar mensaje de éxito al finalizar el cálculo
            Swal.fire({
              icon: 'success',
              title: 'Costeo completado',
              text: 'Se ha calculado el costeo del producto correctamente.',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          error: (err) => {
            Swal.close(); // Cerrar el loading
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudieron obtener los precios de las materias primas.',
            });
          },
        });
    }
  }

  calcularCostos() {
    if (this.dosificacion && this.plantaSeleccionada !== null) {
      const plantaId = this.plantaSeleccionada;

      // Extraer propiedades de la dosificación para evitar verificaciones múltiples
      const { cemento, gravilla, arena } = this.dosificacion;

      const materiales = ['CEMENTO', 'GRAVILLA', 'ARENA']; // Materiales dinámicos (sin AGUA porque es un caso especial)
      materiales.forEach((material) => {
        this.apiService
          .getMateriaPrimaPorNombre(plantaId, material)
          .subscribe((materiaPrima) => {
            const porcentajePerdida = materiaPrima.perdida ?? 0;

            if (material === 'CEMENTO') {
              // Cálculo para cemento
              this.cementoAjustado = this.redondear(
                cemento * (1 + porcentajePerdida / 100)
              );
              this.costoCemento = this.redondear(
                (this.cementoAjustado * materiaPrima.precio) / this.ufValue
              );

              console.log('Cemento ajustado:', this.cementoAjustado);
            } else if (material === 'GRAVILLA') {
              // Cálculo para gravilla
              const gravillaSinAjustar = gravilla / materiaPrima.densidad;
              this.gravillaAjustadaConPerdida = this.redondear(
                gravillaSinAjustar * (1 + porcentajePerdida / 100)
              );
              this.costoGravilla = this.redondear(
                (this.gravillaAjustadaConPerdida * materiaPrima.precio) /
                  this.ufValue
              );

              console.log('Gravilla ajustada:', this.gravillaAjustadaConPerdida);
            } else if (material === 'ARENA') {
              // Cálculo para arena
              const arenaSinAjustar = arena / materiaPrima.densidad;
              this.arenaAjustadaConPerdida = this.redondear(
                arenaSinAjustar * (1 + porcentajePerdida / 100)
              );
              this.costoArena = this.redondear(
                (this.arenaAjustadaConPerdida * materiaPrima.precio) / this.ufValue
              );

              console.log('Arena ajustada:', this.arenaAjustadaConPerdida);
            }

            // Calcular costo total parcial
            this.costoTotal =
              this.costoCemento +
              this.costoArena +
              this.costoGravilla +
              this.costoAditivoBase +
              this.ufLaboratorio;

            console.log('Costo total parcial:', this.costoTotal);
          });
      });

      // Cálculo del agua (independiente del porcentaje de pérdida)
      this.apiService
        .getMateriaPrimaPorNombre(plantaId, 'AGUA')
        .subscribe((materiaPrima) => {
          this.precioAgua = materiaPrima.precio;

          // Fórmula específica para el agua
          this.costoAgua = this.redondear(
            (0.36 * this.precioAgua) / this.ufValue
          );

          console.log('Costo agua:', this.costoAgua);

          // Calcular el costo final sumando el agua al total
          this.costoFinal = this.redondear(this.costoTotal + this.costoAgua);
          console.log('Costo final:', this.costoFinal);
        });
    } else {
      console.error('Dosificación o planta seleccionada no es válida.');
    }
  }

  // Método para redondear al próximo número si el dígito decimal es >= 5
  redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }










}
