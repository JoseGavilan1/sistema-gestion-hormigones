import { Component, AfterViewInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Dosificacion } from '../../models/dosificacion.model';
import { UfService } from '../../services/uf/uf-service.service';
import Swal from 'sweetalert2';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { PdfService } from '../../services/pdf-generator/pdf-service.service';

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
      transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))]),
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

  otros: number = 0;
  isGeneratingQuote: boolean = false;
  datosExcel: any[] = [];
  plantaSeleccionada: number | null = null;
  nombrePlantaSeleccionada: string | null = null;
  idProducto: number | null = null;
  dosificacion: Dosificacion | null = null;

  margenEnUf: number = 0; // Margen directo en UF
  utilidad: number = 0; // Diferencia entre costo de producción y costo de venta
  precioVenta: number = 0; // Precio final de venta

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

  constructor(
    private apiService: ApiService,
    private ufService: UfService,
    private pdfService: PdfService
  ) {}

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

  costearProductoConMargenYOtros() {
    if (this.dosificacion) {
      this.costoFinal = this.redondear(this.costoTotal + this.costoAgua);
      this.precioVenta = this.redondear(
        this.costoFinal + this.margenEnUf + this.otros
      );

      Swal.fire({
        icon: 'success',
        title: 'Costeo completado',
        text: 'El costeo del producto se ha calculado correctamente.',
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Primero busca la dosificación del producto antes de calcular el costeo.',
      });
    }
  }

  generarPrecotizacion() {
    if (!this.dosificacion) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe calcular el costeo antes de generar la pre-cotización.',
      });
      return;
    }

    // Mostrar SweetAlert con el GIF
    Swal.fire({

      html: `<div>
               <img src="https://res.cloudinary.com/dk5bjcrb8/image/upload/v1732548351/gif-copat_zjppwk.gif" alt="Generando Pre-cotización" width="150">
               <p class="mt-3">Generando pre cotización</p>
             </div>`,
      allowOutsideClick: false,
      showConfirmButton: false,
    });

    // Simular un retraso de 3 segundos para generar el PDF
    setTimeout(() => {
      const quoteData = {
        date: new Date().toLocaleDateString(),
        seller: 'Vendedor XYZ',
        client: 'Cliente ABC',
        items: [
          {
            product: `Producto ${this.idProducto}`,
            quantity: 1,
            price: this.precioVenta,
            total: this.precioVenta,
          },
        ],
        total: this.precioVenta,
        observations: 'Esta es una cotización preliminar.',
      };

      // Generar el PDF
      this.pdfService.generateQuotePDF(
        quoteData,
        `Precotizacion_Producto_${this.idProducto}`
      );

      // Cerrar el SweetAlert después de generar el PDF
      Swal.close();

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Pre-cotización generada',
        text: `El archivo PDF ha sido generado correctamente.`,
        confirmButtonText: 'Aceptar',
      });
    }, 3000); // Retraso de 3 segundos
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
              text: 'No se encontró la dosificación para este producto en la planta seleccionada.',
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

      const materiales = ['CEMENTO', 'GRAVILLA', 'ARENA'];
      materiales.forEach((material) => {
        this.apiService
          .getMateriaPrimaPorNombre(plantaId, material)
          .subscribe((materiaPrima) => {
            const porcentajePerdida = materiaPrima.perdida ?? 0;

            if (material === 'CEMENTO') {
              this.cementoAjustado = this.redondear(
                cemento * (1 + porcentajePerdida / 100)
              );
              this.costoCemento = this.redondear(
                (this.cementoAjustado * materiaPrima.precio) / this.ufValue
              );
            } else if (material === 'GRAVILLA') {
              const gravillaSinAjustar = gravilla / materiaPrima.densidad;
              this.gravillaAjustadaConPerdida = this.redondear(
                gravillaSinAjustar * (1 + porcentajePerdida / 100)
              );
              this.costoGravilla = this.redondear(
                (this.gravillaAjustadaConPerdida * materiaPrima.precio) /
                  this.ufValue
              );
            } else if (material === 'ARENA') {
              const arenaSinAjustar = arena / materiaPrima.densidad;
              this.arenaAjustadaConPerdida = this.redondear(
                arenaSinAjustar * (1 + porcentajePerdida / 100)
              );
              this.costoArena = this.redondear(
                (this.arenaAjustadaConPerdida * materiaPrima.precio) /
                  this.ufValue
              );
            }

            this.costoTotal =
              this.costoCemento +
              this.costoArena +
              this.costoGravilla +
              this.costoAditivoBase +
              this.ufLaboratorio;
          });
      });

      this.apiService
        .getMateriaPrimaPorNombre(plantaId, 'AGUA')
        .subscribe((materiaPrima) => {
          this.precioAgua = materiaPrima.precio;
          this.costoAgua = this.redondear(
            (0.36 * this.precioAgua) / this.ufValue
          );
          this.costoFinal = this.redondear(this.costoTotal + this.costoAgua);

          // Calcular el precio de venta y la utilidad
          this.precioVenta = this.redondear(this.costoFinal + this.margenEnUf);
          this.utilidad = this.redondear(this.precioVenta - this.costoFinal);
        });
    } else {
      console.error('Dosificación o planta seleccionada no es válida.');
    }
  }

  // Método para redondear al próximo número si el dígito decimal es >= 5
  redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }

  buscarProducto() {
    if (this.idProducto && this.plantaSeleccionada !== null) {
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
            Swal.close();
            Swal.fire({
              icon: 'success',
              title: 'Dosificación cargada',
              text: `Se ha cargado la dosificación para el producto ${this.idProducto}`,
              timer: 1500,
              showConfirmButton: false,
            });

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
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se encontró la dosificación para este producto en la planta seleccionada.',
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
}
