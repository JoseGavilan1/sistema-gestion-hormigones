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
import { PdfService } from '../../services/word-service.service';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';

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
setTimeout(arg0: undefined) {
throw new Error('Method not implemented.');
}
  plantas = [
    { id: 1, nombre: 'TALTAL' },
    { id: 2, nombre: 'MEJILLONES' },
    { id: 3, nombre: 'ANTOFAGASTA' },
    { id: 4, nombre: 'MARIA-ELENA' },
    { id: 5, nombre: 'CALAMA' },
    { id: 6, nombre: 'TOCOPILLA' },
  ];

  nomenclatura: string | null = null;
  descripcionATecnica: string = ''; // Para almacenar la nomenclatur
  tipoBusqueda: 'producto' | 'nomenclatura' = 'producto'; // Por defecto, es producto

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

  peaje: number = 0;
  viajes: number = 2; // Valor por defecto para ida y vuelta
  sobreDistancia: number = 0;
  movilizacion: number = 0;
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
  precioAditivo2: number = 0;
  precioAditivo3: number = 0;
  precioAditivo4: number = 0;
  precioAditivo5: number = 0;
  precioAditivo6: number = 0;
  precioAditivo7: number = 0;
  precioAditivo8: number = 0;
  precioAditivo9: number = 0;
  precioAditivo10: number = 0;
  ufValue: number = 0;
  ufLaboratorio: number = 0.1;
  nombreAditivo2: string | null = null;
  nombreAditivo3: string | null = null;
  nombreAditivo4: string | null = null;
  nombreAditivo5: string | null = null;
  nombreAditivo6: string | null = null;
  nombreAditivo7: string | null = null;
  nombreAditivo8: string | null = null;
  nombreAditivo9: string | null = null;
  nombreAditivo10: string | null = null;

  costoCemento: number = 0;
  costoAgua: number = 0;
  costoArena: number = 0;
  costoGravilla: number = 0;
  costoGrava: number = 0;
  costoTotal: number = 0;
  costoFinal: number = 0;
  costoAridos: number = 0;
  costoAditivoBase: number = 0;
  costoAditivo2: number = 0;
  costoAditivo3: number = 0;
  costoAditivo4: number = 0;
  costoAditivo5: number = 0;
  costoAditivo6: number = 0;
  costoAditivo7: number = 0;
  costoAditivo8: number = 0;
  costoAditivo9: number = 0;
  costoAditivo10: number = 0;

  cementoAjustado: number = 0;
  gravillaAjustadaConPerdida: number = 0;
  arenaAjustadaConPerdida: number = 0;

  porcentajeDePerdida: number = 0.02;

  mostrarDetalles: boolean = false;
  nombreComercial: any;

  sugerenciasNombreComercial: any[] = [];
  mostrarSugerencias: boolean = false;
  busquedaEnProgreso: boolean = false;
  minCaracteresBusqueda: number = 3;

  ocultarSugerenciasConDelay() {
  setTimeout(() => { this.mostrarSugerencias = false; }, 200);
}

handleInputEvent(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  this.buscarSugerenciasNombreComercial(inputElement.value);
}

  buscarSugerenciasNombreComercial(termino: string): void {
  // Resetear si el término es muy corto
  if (!termino || termino.length < this.minCaracteresBusqueda) {
    this.sugerenciasNombreComercial = [];
    this.mostrarSugerencias = false;
    return;
  }

  // Validar que se haya seleccionado planta
  if (!this.plantaSeleccionada) {
    Swal.fire({
      icon: 'warning',
      title: 'Planta no seleccionada',
      text: 'Por favor, selecciona una planta primero.',
    });
    return;
  }

  this.busquedaEnProgreso = true;
  this.mostrarSugerencias = true;

  this.apiService.buscarNombresComerciales(termino, this.plantaSeleccionada)
    .pipe(
      debounceTime(300), // Esperar 300ms después de la última tecla
      distinctUntilChanged(), // Evitar llamadas duplicadas
      finalize(() => this.busquedaEnProgreso = false)
    )
    .subscribe({
      next: (sugerencias) => {
        this.sugerenciasNombreComercial = sugerencias;
      },
      error: (err) => {
        this.handleError('Error al buscar sugerencias');
        this.sugerenciasNombreComercial = [];
      }
    });
}

/**
 * Maneja errores mostrando un mensaje con SweetAlert.
 * @param mensaje Mensaje de error a mostrar.
 */
private handleError(mensaje: string): void {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: mensaje,
  });
}

seleccionarSugerencia(sugerencia: any): void {
  this.nombreComercial = sugerencia.nombreComercial;
  this.mostrarSugerencias = false;
  // Opcional: cargar automáticamente la dosificación al seleccionar
  this.buscarPorNombreComercial(sugerencia.nombreComercial, this.plantaSeleccionada!);
}

  constructor(
    private apiService: ApiService,
    private ufService: UfService,
    private pdfService: PdfService
  ) {}

  ngOnInit() {
    this.ufService.getUfValue().subscribe({
      next: (ufData) => {
        this.ufValue = ufData;
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo obtener el valor de la UF.',
        });
      },
    });
  }

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

  transformarNomenclaturaParaBD(nomenclatura: string): string {
    if (!nomenclatura) return nomenclatura;

    // Extraer partes del texto con una expresión regular
    const match = nomenclatura.match(/([A-Z]+)(\d+)\((\d+)\)-(\d+)-(\d+)/);

    if (match) {
      const [, tipo, resistencia, parametro, dias, fecha] = match;

      // Asegurarse de que la resistencia siempre tenga un decimal (.0)
      const resistenciaFormateada = parseFloat(resistencia).toFixed(1);

      // Formatear el texto al estilo de la base de datos (asegurar solo un espacio)
      const transformada = `${tipo.trim()} ${resistenciaFormateada}(${parametro})${dias}/${fecha}`;
      console.log('Resultado de transformación:', transformada); // Verificar el resultado aquí
      return transformada;
    }

    return nomenclatura; // Si no coincide, se retorna como está
  }

  buscarPorNomenclatura(descripcionATecnica: string, idPlanta: number): void {
    this.tipoBusqueda = 'nomenclatura';

    if (!descripcionATecnica || !idPlanta) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, ingresa una descripción técnica válida y selecciona una planta.',
      });
      return;
    }

    // Transformar nomenclatura al formato esperado por la base de datos
    const nomenclaturaTransformada =
      this.transformarNomenclaturaParaBD(descripcionATecnica);
    console.log(
      'Buscando con nomenclatura transformada para BD:',
      nomenclaturaTransformada
    );

    Swal.fire({
      title: 'Cargando dosificación...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.apiService
      .getDosificacionByNomenclatura(nomenclaturaTransformada, idPlanta)
      .subscribe({
        next: (dosificacion) => {
          this.dosificacion = dosificacion;
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: 'Dosificación encontrada',
            text: `Se encontró la dosificación para la nomenclatura: ${descripcionATecnica}`,
            timer: 1500,
            showConfirmButton: false,
          });
          this.ufService.getUfValue().subscribe({
            next: (ufData) => {
              this.ufValue = ufData;
              this.descripcionATecnica = nomenclaturaTransformada;
              this.obtenerPreciosMateriasPrimas();
            },
            error: () => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener el valor de la UF.',
              });
            },
          });
        },
        error: () => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró una dosificación para la descripción técnica ingresada y planta seleccionada.',
          });
        },
      });
  }

  activarBusqueda(tipo: 'producto' | 'nomenclatura'): void {
    this.tipoBusqueda = tipo;
    console.log(`Tipo de búsqueda activado: ${this.tipoBusqueda}`);
  }

  costearProductoConMargenYOtros() {
  // Calcula el costo total sumando todos los componentes
  const costoTransporte = (this.peaje * this.viajes) + this.sobreDistancia + this.movilizacion;

  this.precioVenta = this.costoFinal + this.margenEnUf + this.otros + costoTransporte;

  // Puedes mostrar el desglose en consola para debug
  console.log('Desglose de costos:', {
    costoProduccion: this.costoFinal,
    peaje: this.peaje * this.viajes,
    sobreDistancia: this.sobreDistancia,
    movilizacion: this.movilizacion,
    margen: this.margenEnUf,
    otros: this.otros,
    total: this.precioVenta
  });
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

  this.isGeneratingQuote = true;

  // Preparar los datos para el PDF
  const costosAdicionales = {
    costoProduccion: this.costoFinal,
    peaje: this.peaje * this.viajes,
    sobreDistancia: this.sobreDistancia,
    movilizacion: this.movilizacion,
    margen: this.margenEnUf,
    otros: this.otros,
    viajes: this.viajes
  };

  // Datos del cliente (puedes modificar esto según necesites)
  const cliente = {
    nombre: 'Cliente ABC',
    rut: '12.345.678-9',
    direccion: 'Av. Siempre Viva 742',
    comuna: 'Springfield',
    ciudad: 'Springfield',
    telefono: '+56 9 1234 5678',
    email: 'cliente@correo.com',
    vendedor: 'Juan Pérez',
  };

  // Determinar la descripción del producto según el tipo de búsqueda
  let descripcionProducto = '';
  if (this.tipoBusqueda === 'producto' && this.idProducto) {
    descripcionProducto = `Hormigón ID ${this.idProducto}`;
  } else if (this.tipoBusqueda === 'nomenclatura' && this.descripcionATecnica) {
    descripcionProducto = `Hormigón ${this.descripcionATecnica}`;
  } else {
    descripcionProducto = 'Hormigón Especial';
  }

  const productos = [{
    cantidad: 1,
    unMedida: 'M3',
    descripcion: descripcionProducto,
    valorUF: this.precioVenta,
    valorReferencia: this.precioVenta * this.ufValue,
  }];

  const totales = {
    numeroCotizacion: this.tipoBusqueda === 'producto'
      ? `PC-${this.idProducto}`
      : `PC-${new Date().getTime()}`,
    fecha: new Date().toLocaleDateString('es-CL'),
    uf: this.precioVenta,
    clp: this.precioVenta * this.ufValue,
    iva: this.precioVenta * this.ufValue * 0.19,
    total: this.precioVenta * this.ufValue * 1.19,
  };

  // Mostrar loading mientras se genera el PDF
  Swal.fire({
    html: `<div>
             <img src="https://res.cloudinary.com/dk5bjcrb8/image/upload/v1732548351/gif-copat_zjppwk.gif" alt="Generando Pre-cotización" width="150">
             <p class="mt-3">Generando cotización...</p>
           </div>`,
    allowOutsideClick: false,
    showConfirmButton: false,
  });

  // Generar el PDF con todos los datos
  this.pdfService.generarCotizacionPdf(cliente, productos, totales, costosAdicionales);

  // Cerrar el loading y mostrar mensaje de éxito
  setTimeout(() => {
    this.isGeneratingQuote = false;
    Swal.close();
    Swal.fire({
      icon: 'success',
      title: 'Pre-cotización generada',
      text: 'El archivo PDF ha sido generado correctamente.',
      timer: 2000,
    });
  }, 2000);
}

  private convertPdfToWord(pdfBuffer: ArrayBuffer): ArrayBuffer {
    // Aquí puedes usar una biblioteca o API para la conversión de PDF a Word
    throw new Error('Función de conversión pendiente de implementación');
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

            const aditivo2 = materias.find(
              (m) => m.nombre === 'ADITIVO 2'
            );
            const aditivo3 = materias.find(
              (m) => m.nombre === 'ADITIVO 3'
            );
            const aditivo4 = materias.find(
              (m) => m.nombre === 'ADITIVO 4'
            );
            const aditivo5 = materias.find(
              (m) => m.nombre === 'ADITIVO 5'
            );
            const aditivo6 = materias.find(
              (m) => m.nombre === 'ADITIVO 6'
            );
            const aditivo7 = materias.find(
              (m) => m.nombre === 'ADITIVO 7'
            );
            const aditivo8 = materias.find(
              (m) => m.nombre === 'ADITIVO 8'
            );
            const aditivo9 = materias.find(
              (m) => m.nombre === 'ADITIVO 9'
            );

            const aditivo10 = materias.find(
              (m) => m.nombre === 'ADITIVO 10'
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
            if (aditivo2) this.precioAditivo2 = aditivo2.precio;
            if (aditivo3) this.precioAditivo3 = aditivo3.precio;
            if (aditivo4) this.precioAditivo4 = aditivo4.precio;
            if (aditivo5) this.precioAditivo5 = aditivo5.precio;
            if (aditivo6) this.precioAditivo6 = aditivo6.precio;
            if (aditivo7) this.precioAditivo7 = aditivo7.precio;
            if (aditivo8) this.precioAditivo8 = aditivo8.precio;
            if (aditivo9) this.precioAditivo9 = aditivo9.precio;
            if (aditivo10) this.precioAditivo10 = aditivo10.precio;


            if (this.dosificacion) {
              this.nombreAditivo2 = this.dosificacion.nombreAditivo2 || null;
              this.nombreAditivo3 = this.dosificacion.nombreAditivo3 || null;
              this.nombreAditivo4 = this.dosificacion.nombreAditivo4 || null;
              this.nombreAditivo5 = this.dosificacion.nombreAditivo5 || null;
              this.nombreAditivo6 = this.dosificacion.nombreAditivo6 || null;
              this.nombreAditivo7 = this.dosificacion.nombreAditivo7 || null;
              this.nombreAditivo8 = this.dosificacion.nombreAditivo8 || null;
              this.nombreAditivo9 = this.dosificacion.nombreAditivo9 || null;
              this.nombreAditivo10 = this.dosificacion.nombreAditivo10 || null;
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
              this.costoAditivo2 +
              this.costoAditivo3 +
              this.costoAditivo4 +
              this.costoAditivo5 +
              this.costoAditivo6 +
              this.costoAditivo7 +
              this.costoAditivo8 +
              this.costoAditivo9 +
              this.costoAditivo10 +
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

  buscarProducto(): void {
    this.tipoBusqueda = 'producto'; // Cambia el tipo de búsqueda
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
              error: () => {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se pudo obtener el valor de la UF.',
                });
              },
            });
          },
          error: () => {
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

  buscarPorNombreComercial(nombreComercial: string, idPlanta: number): void {
  if (!nombreComercial || !idPlanta) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Por favor, ingresa un nombre comercial válido y selecciona una planta.',
    });
    return;
  }

  Swal.fire({
    title: 'Cargando dosificación...',
    text: 'Por favor espera',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  // Llamamos a la API para obtener la dosificación por Nombre Comercial
  this.apiService.getDosificacionByNombreComercial(nombreComercial, idPlanta).subscribe({
    next: (dosificacion) => {
      this.dosificacion = dosificacion;
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Dosificación encontrada',
        text: `Se encontró la dosificación para el nombre comercial: ${nombreComercial}`,
        timer: 1500,
        showConfirmButton: false,
      });
      this.ufService.getUfValue().subscribe({
        next: (ufData) => {
          this.ufValue = ufData;
          this.descripcionATecnica = nombreComercial;  // Podemos utilizar el nombre comercial para la descripción
          this.obtenerPreciosMateriasPrimas();
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo obtener el valor de la UF.',
          });
        },
      });
    },
    error: () => {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró una dosificación para este nombre comercial en la planta seleccionada.',
      });
    },
  });
}


}
