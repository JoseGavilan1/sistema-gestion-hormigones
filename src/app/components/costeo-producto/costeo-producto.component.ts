import { Component, AfterViewInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Dosificacion } from '../../models/dosificacion.model';
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
import { CostoGeneral } from '../../models/costo-general.model';
import { TruncateDecimalsPipe } from '../../services/pipe/pipeTranform.service';

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
  truncateDecimalsPipe = new TruncateDecimalsPipe();
  constructor(private apiService: ApiService, private pdfService: PdfService) { }

  ngOnInit() {
    this.cargarCostosGenerales().catch((err) => {
      console.error('Error cargando costos:', err);
    });
  }

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
  descripcionATecnica: string = '';
  nombreComercialTexto: string = '';
  tipoBusqueda: 'producto' | 'nomenclatura' | 'nombreComercialText' =
    'producto';

  costosGenerales: any = {};
  otros: number = 0;
  isGeneratingQuote: boolean = false;
  datosExcel: any[] = [];
  plantaSeleccionada: number | null = null;
  nombrePlantaSeleccionada: string | null = null;
  idProducto: number | null = null;
  dosificacion: Dosificacion | null = null;

  margenEnUf: number = 0;
  utilidad: number = 0;
  precioVenta: number = 0;

  peaje: number = 0;
  viajes: number = 2;
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
  ufLaboratorio: number = 0;
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

  aguaUtilizada: number = 0;

  cementoAjustado: number = 0;
  gravillaAjustadaConPerdida: number = 0;
  arenaAjustadaConPerdida: number = 0;

  mostrarDetalles: boolean = false;
  nombreComercial: any;

  sugerenciasNombreComercial: any[] = [];
  mostrarSugerencias: boolean = false;
  busquedaEnProgreso: boolean = false;
  minCaracteresBusqueda: number = 3;

  peajeClp: number = 0;
  peajeUf: number = 0;
  sobreDistanciaKms: number = 0;
  valorPorKm: number = 0;

  ocultarSugerenciasConDelay() {
    setTimeout(() => {
      this.mostrarSugerencias = false;
    }, 200);
  }

  handleInputEvent(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.buscarSugerenciasNombreComercial(inputElement.value);
  }

  buscarSugerenciasNombreComercial(termino: string): void {
    if (!termino || termino.length < this.minCaracteresBusqueda) {
      this.sugerenciasNombreComercial = [];
      this.mostrarSugerencias = false;
      return;
    }

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

    this.apiService
      .buscarNombresComerciales(termino, this.plantaSeleccionada)
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        finalize(() => (this.busquedaEnProgreso = false))
      )
      .subscribe({
        next: (sugerencias) => {
          this.sugerenciasNombreComercial = sugerencias;
        },
        error: (err) => {
          this.handleError('Error al buscar sugerencias');
          this.sugerenciasNombreComercial = [];
        },
      });
  }

  private handleError(mensaje: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje,
    });
  }


  cargarCostosGenerales(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.getCostosGenerales().subscribe({
        next: (costos: CostoGeneral[]) => {
          costos.forEach((costo) => {
            this.costosGenerales[costo.nombreCosto] = costo.valorCosto;
          });

          this.ufValue = this.costosGenerales['UF'] || 0;
          this.movilizacion = this.costosGenerales['Transporte'] || 0;
          this.valorPorKm = this.costosGenerales['Sobredistancia'] || 0;
          this.ufLaboratorio = this.costosGenerales['Laboratorio'] || 0.1;

          console.log('Costos generales cargados:', this.costosGenerales);
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar costos generales:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los costos generales desde la base de datos',
          });
          reject(err);
        },
      });
    });
  }

  actualizarPeajeEnUf(): void {
    if (this.ufValue > 0) {
      this.peajeUf = this.redondear(this.peajeClp / this.ufValue);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Valor UF no disponible',
        text: 'No se puede convertir el peaje a UF sin el valor actual de la UF',
      });
    }
  }

  calcularSobreDistancia(): void {
    if (this.sobreDistanciaKms > 30) {
      this.sobreDistancia = this.sobreDistanciaKms * this.valorPorKm;
    } else {
      this.sobreDistancia = 0;
    }

  }

  getFormattedSobreDistancia(): string {
    return this.truncateDecimalsPipe.transform(this.sobreDistancia, 2);
  }


  seleccionarSugerencia(sugerencia: any): void {
    this.nombreComercial = sugerencia.nombreComercial;
    this.mostrarSugerencias = false;
    this.buscarPorNombreComercial(
      sugerencia.nombreComercial,
      this.plantaSeleccionada!
    );

    const inputElement = document.querySelector(
      '#nombreComercialInput'
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.blur();
    }
  }

  toggleDetalles() {
    this.mostrarDetalles = !this.mostrarDetalles;
  }

  seleccionarPlanta(idPlanta: number) {
    const planta = this.plantas.find((p) => p.id === idPlanta);
    if (planta) {
      this.plantaSeleccionada = idPlanta;
      this.nombrePlantaSeleccionada = planta.nombre;
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

    const match = nomenclatura.match(/([A-Z]+)(\d+)\((\d+)\)-(\d+)-(\d+)/);

    if (match) {
      const [, tipo, resistencia, parametro, dias, fecha] = match;

      const resistenciaFormateada = parseFloat(resistencia).toFixed(1);

      const transformada = `${tipo.trim()} ${resistenciaFormateada}(${parametro})${dias}/${fecha}`;
      console.log('Resultado de transformación:', transformada);
      return transformada;
    }

    return nomenclatura;
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
          this.ufValue = this.costosGenerales['UF'] || 0;
          this.descripcionATecnica = nomenclaturaTransformada;
          if (this.ufValue <= 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Valor de UF no disponible',
              text: 'El valor de UF no se ha cargado correctamente. Por favor, verifica los costos generales.',
            });
          }

          this.obtenerPreciosMateriasPrimas();
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
    // Primero actualizamos los valores de peaje y sobre distancia
    this.actualizarPeajeEnUf();
    this.calcularSobreDistancia();

    const costoTransporte =
      this.peajeUf * this.viajes + this.sobreDistancia + this.movilizacion;

    this.precioVenta =
      this.costoFinal + this.margenEnUf + this.otros + costoTransporte + this.ufLaboratorio;

    console.log('Desglose de costos:', {
      costoProduccion: this.costoFinal,
      peaje: this.peajeUf * this.viajes,
      sobreDistancia: this.sobreDistancia,
      movilizacion: this.movilizacion,
      margen: this.margenEnUf,
      otros: this.otros,
      total: this.precioVenta,
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

    const costosAdicionales = {
      costoProduccion: this.costoFinal,
      peaje: this.peaje * this.viajes,
      sobreDistancia: this.sobreDistancia,
      movilizacion: this.movilizacion,
      margen: this.margenEnUf,
      otros: this.otros,
      viajes: this.viajes,
    };

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

    let descripcionProducto = '';
    if (this.tipoBusqueda === 'producto' && this.idProducto) {
      descripcionProducto = `Hormigón ID ${this.idProducto}`;
    } else if (
      this.tipoBusqueda === 'nomenclatura' &&
      this.descripcionATecnica
    ) {
      descripcionProducto = `Hormigón ${this.descripcionATecnica}`;
    } else {
      descripcionProducto = 'Hormigón Especial';
    }

    const productos = [
      {
        cantidad: 1,
        unMedida: 'M3',
        descripcion: descripcionProducto,
        valorUF: this.precioVenta,
        valorReferencia: this.precioVenta * this.ufValue,
      },
    ];

    const totales = {
      numeroCotizacion:
        this.tipoBusqueda === 'producto'
          ? `PC-${this.idProducto}`
          : `PC-${new Date().getTime()}`,
      fecha: new Date().toLocaleDateString('es-CL'),
      uf: this.precioVenta,
      clp: this.precioVenta * this.ufValue,
      iva: this.precioVenta * this.ufValue * 0.19,
      total: this.precioVenta * this.ufValue * 1.19,
    };

    Swal.fire({
      html: `<div>
             <img src="https://res.cloudinary.com/dk5bjcrb8/image/upload/v1732548351/gif-copat_zjppwk.gif" alt="Generando Pre-cotización" width="150">
             <p class="mt-3">Generando cotización...</p>
           </div>`,
      allowOutsideClick: false,
      showConfirmButton: false,
    });

    this.pdfService.generarCotizacionPdf(
      cliente,
      productos,
      totales,
      costosAdicionales
    );

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
    throw new Error('Función de conversión pendiente de implementación');
  }

  costearProducto() {
    if (this.idProducto && this.plantaSeleccionada !== null) {
      // Verificar si los costos generales están cargados
      if (
        !this.costosGenerales ||
        Object.keys(this.costosGenerales).length === 0
      ) {
        Swal.fire({
          title: 'Cargando costos...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        this.cargarCostosGenerales().then(() => {
          this.continuarConCosteoProducto();
        });
      } else {
        this.continuarConCosteoProducto();
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Información incompleta',
        text: 'Por favor, selecciona una planta e ingresa el ID del producto.',
      });
    }
  }

  private continuarConCosteoProducto() {
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
        this.idProducto!,
        this.plantaSeleccionada!
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

          // Usamos el valor de UF desde costos generales
          this.ufValue = this.costosGenerales['UF'] || 0;

          if (this.ufValue <= 0) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'El valor de UF no está configurado en los costos generales.',
            });
            return;
          }

          this.obtenerPreciosMateriasPrimas();
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
            const aditivoBase = materias.find(
              (m) => m.nombre === 'ADITIVO BASE'
            );

            const aditivo2 = materias.find((m) => m.nombre === 'ADITIVO 2');
            const aditivo3 = materias.find((m) => m.nombre === 'ADITIVO 3');
            const aditivo4 = materias.find((m) => m.nombre === 'ADITIVO 4');
            const aditivo5 = materias.find((m) => m.nombre === 'ADITIVO 5');
            const aditivo6 = materias.find((m) => m.nombre === 'ADITIVO 6');
            const aditivo7 = materias.find((m) => m.nombre === 'ADITIVO 7');
            const aditivo8 = materias.find((m) => m.nombre === 'ADITIVO 8');
            const aditivo9 = materias.find((m) => m.nombre === 'ADITIVO 9');

            const aditivo10 = materias.find((m) => m.nombre === 'ADITIVO 10');

            if (cemento) {
              this.precioCemento = cemento.precio;
              const porcentajePerdidaCemento = cemento.perdida; // Obtener el porcentaje de pérdida desde la base de datos

              // Log de los datos de entrada
              console.log(`Precio Cemento: ${this.precioCemento}`);
              console.log(`Porcentaje de pérdida de Cemento: ${porcentajePerdidaCemento}`);

              // Obtener la cantidad de cemento desde la dosificación
              const cantidadCemento = this.dosificacion ? this.dosificacion.cemento || 0 : 0; // Asumimos que la cantidad de cemento está en la dosificación

              // Log de la cantidad de cemento
              console.log(`Cantidad de Cemento (desde dosificación): ${cantidadCemento}`);


              // Ajustar por el porcentaje de pérdida
              const cantidadCementoConPerdida = cantidadCemento * (1 + porcentajePerdidaCemento / 100);
              console.log(`Cantidad de Cemento ajustada con pérdida: ${cantidadCementoConPerdida}`);

              // Calcular el costo final del cemento en función de su precio en la planta seleccionada
              this.costoCemento = this.redondear(
                (cantidadCementoConPerdida * this.precioCemento) / this.ufValue
              );
              console.log(`Costo de Cemento ajustado: ${this.costoCemento}`);
            }

            if (agua) {
              this.precioAgua = agua.precio;
              this.aguaUtilizada = agua.perdida;
              this.costoAgua = this.redondear(
                (this.aguaUtilizada * this.precioAgua) / this.ufValue
              );
              console.log(`Costo Agua: ${this.costoAgua}`);
            }
            if (arena) {
              this.precioArena = arena.precio;
              this.densidadArena = arena.densidad;
              const porcentajePerdidaArena = arena.perdida;

              console.log(`Precio Arena: ${this.precioArena}`);
              console.log(`Densidad de Arena: ${this.densidadArena}`);
              console.log(`Porcentaje de pérdida de Arena: ${porcentajePerdidaArena}`);

              const cantidadArena = this.dosificacion?.arena ?? 0;

              console.log(`Cantidad de Arena (desde dosificación): ${cantidadArena}`);

              const cantidadArenaAjustada = cantidadArena / this.densidadArena;
              console.log(`Cantidad de Arena ajustada (por densidad): ${cantidadArenaAjustada}`);

              const cantidadArenaConPerdida = cantidadArenaAjustada * (1 + porcentajePerdidaArena / 100);
              console.log(`Cantidad de Arena ajustada con pérdida: ${cantidadArenaConPerdida}`);

              this.costoArena = this.redondear(
                (cantidadArenaConPerdida * this.precioArena) / this.ufValue
              );
              console.log(`Costo de Arena ajustado: ${this.costoArena}`);
            }


            if (gravilla) {
              this.precioGravilla = gravilla.precio;
              this.densidadGravilla = gravilla.densidad;
              const porcentajePerdidaGravilla = gravilla.perdida; // Obtener el porcentaje de pérdida desde la base de datos

              // Log de los datos de entrada
              console.log(`Precio Gravilla: ${this.precioGravilla}`);
              console.log(`Densidad de Gravilla: ${this.densidadGravilla}`);
              console.log(`Porcentaje de pérdida de Gravilla: ${porcentajePerdidaGravilla}`);

              // Obtener la cantidad de gravilla desde la dosificación
              const cantidadGravilla = this.dosificacion?.gravilla ?? 0; // Asumimos que la cantidad de gravilla está en la dosificación

              // Log de la cantidad de gravilla
              console.log(`Cantidad de Gravilla (desde dosificación): ${cantidadGravilla}`);

              // Dividir la cantidad de gravilla entre la densidad de la gravilla para ajustarla
              const cantidadGravillaAjustada = cantidadGravilla / this.densidadGravilla;
              console.log(`Cantidad de Gravilla ajustada (por densidad): ${cantidadGravillaAjustada}`);

              // Ajustar por el porcentaje de pérdida
              const cantidadGravillaConPerdida = cantidadGravillaAjustada * (1 + porcentajePerdidaGravilla / 100);
              console.log(`Cantidad de Gravilla ajustada con pérdida: ${cantidadGravillaConPerdida}`);

              // Calcular el costo final de la gravilla en función de su precio en la planta seleccionada
              this.costoGravilla = this.redondear(
                (cantidadGravillaConPerdida * this.precioGravilla) / this.ufValue
              );
              console.log(`Costo de Gravilla ajustado: ${this.costoGravilla}`);
            }


            if (aditivoBase) {
              this.precioAditivoBase = aditivoBase.precio;
              console.log(`Costo Aditivo Base: ${this.precioAditivoBase}`);
            }
            if (aditivo2) this.precioAditivo2 = aditivo2.precio;
            if (aditivo3) this.precioAditivo3 = aditivo3.precio;
            if (aditivo4) this.precioAditivo4 = aditivo4.precio;
            if (aditivo5) this.precioAditivo5 = aditivo5.precio;
            if (aditivo6) this.precioAditivo6 = aditivo6.precio;
            if (aditivo7) this.precioAditivo7 = aditivo7.precio;
            if (aditivo8) this.precioAditivo8 = aditivo8.precio;
            if (aditivo9) this.precioAditivo9 = aditivo9.precio;
            if (aditivo10) this.precioAditivo10 = aditivo10.precio;

            // Cálculo para el aditivo base
            if (this.dosificacion) {
              const cantidadAditivoBase = this.dosificacion.aditivo1 || 0; // Obtener cantidad de aditivo base de la dosificación
              this.costoAditivoBase = this.redondear(
                (cantidadAditivoBase * this.precioAditivoBase) / this.ufValue
              );
              console.log(`Cantidad Aditivo Base: ${cantidadAditivoBase}`);
              console.log(`Costo Aditivo Base calculado: ${this.costoAditivoBase}`);
            }


            this.calcularCostos();
            Swal.close();

            Swal.fire({
              icon: 'success',
              title: 'Costeo completado',
              text: 'Se ha calculado el costeo del producto correctamente.',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          error: (err) => {
            Swal.close();
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
              this.costoAditivo10
          });
      });

      this.apiService
        .getMateriaPrimaPorNombre(plantaId, 'AGUA')
        .subscribe((materiaPrima) => {
          this.precioAgua = materiaPrima.precio;
          this.costoAgua = this.redondear(
            (this.aguaUtilizada * this.precioAgua) / this.ufValue
          );
          this.costoFinal = this.redondear(this.costoTotal + this.costoAgua);

          this.precioVenta = this.redondear(this.costoFinal + this.margenEnUf + this.ufLaboratorio);
          this.utilidad = this.redondear(this.precioVenta - this.costoFinal);
        });
    } else {
      console.error('Dosificación o planta seleccionada no es válida.');
    }
  }

  redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }

  buscarProducto(): void {
    this.tipoBusqueda = 'producto';

    if (this.idProducto && this.plantaSeleccionada !== null) {
      // Primero verificar si tenemos los costos generales cargados
      if (
        !this.costosGenerales ||
        Object.keys(this.costosGenerales).length === 0
      ) {
        this.cargarCostosAntesDeBuscar();
      } else {
        this.ejecutarBusquedaProducto();
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Información incompleta',
        text: 'Por favor, selecciona una planta e ingresa el ID del producto.',
      });
    }
  }

  private cargarCostosAntesDeBuscar(): void {
    Swal.fire({
      title: 'Cargando costos...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.apiService.getCostosGenerales().subscribe({
      next: (costos: CostoGeneral[]) => {
        this.costosGenerales = {};
        costos.forEach((costo) => {
          this.costosGenerales[costo.nombreCosto] = costo.valorCosto;
        });

        Swal.close();
        this.ejecutarBusquedaProducto();
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los costos generales',
        });
      },
    });
  }

  private ejecutarBusquedaProducto(): void {
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
        this.idProducto!,
        this.plantaSeleccionada!
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

          // Usar el valor de UF desde costos generales
          this.ufValue = this.costosGenerales['UF'] || 0;

          if (this.ufValue <= 0) {
            Swal.fire({
              icon: 'error',
              title: 'Valor de UF inválido',
              text: 'El valor de UF no está configurado o es incorrecto en los costos generales.',
              timer: 2000,
            });
          }

          this.obtenerPreciosMateriasPrimas();
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
  }

  buscarPorNombreComercial(nombreComercial: string, idPlanta: number): void {
    this.tipoBusqueda = 'nombreComercialText';

    if (!nombreComercial || !idPlanta) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, ingresa un nombre comercial válido y selecciona una planta.',
      });
      return;
    }

    // Verificar si los costos generales están cargados
    if (
      !this.costosGenerales ||
      Object.keys(this.costosGenerales).length === 0
    ) {
      Swal.fire({
        title: 'Cargando costos...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.apiService.getCostosGenerales().subscribe({
        next: (costos: CostoGeneral[]) => {
          this.costosGenerales = {};
          costos.forEach((costo) => {
            this.costosGenerales[costo.nombreCosto] = costo.valorCosto;
          });

          Swal.close();
          this.ejecutarBusquedaPorNombreComercial(nombreComercial, idPlanta);
        },
        error: (err) => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los costos generales',
          });
        },
      });
    } else {
      this.ejecutarBusquedaPorNombreComercial(nombreComercial, idPlanta);
    }
  }

  private ejecutarBusquedaPorNombreComercial(
    nombreComercial: string,
    idPlanta: number
  ): void {
    Swal.fire({
      title: 'Cargando dosificación...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.apiService
      .getDosificacionByNombreComercial(nombreComercial, idPlanta)
      .subscribe({
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

          // Usar el valor de UF desde costos generales
          this.ufValue = this.costosGenerales['UF'] || 0;

          if (this.ufValue <= 0) {
            Swal.fire({
              icon: 'error',
              title: 'Valor de UF inválido',
              text: 'El valor de UF no está configurado en los costos generales.',
              timer: 2000,
            });
          }

          this.obtenerPreciosMateriasPrimas();
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

  obtenerCostosGenerales() {
    this.apiService.getCostosGenerales().subscribe({
      next: (costosGenerales: CostoGeneral[]) => {
        // Transformar el array a objeto para fácil acceso
        this.costosGenerales = {};
        costosGenerales.forEach((costo) => {
          this.costosGenerales[costo.nombreCosto] = costo.valorCosto;
        });

        // Asignar valores específicos
        this.ufValue = this.costosGenerales['UF'] || 0;
        this.peaje = this.costosGenerales['PEAJE'] || 0;
        this.sobreDistancia = this.costosGenerales['SOBREDISTANCIA'] || 0;
        this.movilizacion = this.costosGenerales['Transporte'] || 0; // <-- Esta es la asignación clave
        this.otros = this.costosGenerales['OTROS_COSTOS'] || 0;

        Swal.fire({
          icon: 'success',
          title: 'Costos cargados',
          text: 'Los costos generales se han cargado correctamente',
          timer: 1500,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los costos generales',
        });
        console.error('Error:', err);
      },
    });
  }
}
