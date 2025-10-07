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
  constructor(private apiService: ApiService, private pdfService: PdfService) {}

  proveedoresAntofagasta: any[] = [];

  proveedorSeleccionado: number | null = null;
  productosAntofagasta: any[] = [];
  productoSeleccionadoAntofagasta: any = null;
  filtroProducto: string = '';
  mostrarListaProductos: boolean = false;
  productosFiltrados: any[] = [];

  nombreProveedorSeleccionado: string | null = null;

  ngOnInit() {
    this.cargarCostosGenerales().catch((err) => {
      console.error('Error cargando costos:', err);
    });

    this.cargarProveedoresAntofagasta();
  }

  cargarProveedoresAntofagasta(): void {
    this.apiService.getProveedoresAntofagasta().subscribe({
      next: (proveedores) => {
        // Mapear la estructura correcta - usar idProveedor como id
        this.proveedoresAntofagasta = proveedores.map((proveedor) => ({
          id: proveedor.idProveedor, // Usar idProveedor como id
          nombre: proveedor.nombre,
        }));

        console.log(
          'Proveedores cargados (estructura corregida):',
          this.proveedoresAntofagasta
        );

        // Verificar la nueva estructura
        this.proveedoresAntofagasta.forEach((proveedor, index) => {
          console.log(`Proveedor ${index}:`, {
            id: proveedor.id,
            tipo: typeof proveedor.id,
            nombre: proveedor.nombre,
          });
        });
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los proveedores de Antofagasta',
        });
      },
    });
  }

  plantas = [
    { id: 1, nombre: 'TALTAL' },
    { id: 2, nombre: 'MEJILLONES' },
    { id: 3, nombre: 'ANTOFAGASTA' },
    { id: 4, nombre: 'MARIA-ELENA' },
    { id: 5, nombre: 'CALAMA' },
    { id: 6, nombre: 'TOCOPILLA' },
  ];

  descripcionATecnica: string = '';
  tipoBusqueda: 'producto' | 'nomenclatura' | 'nombreComercialText' =
    'producto';

  costosGenerales: any = {};
  otros: number = 0;
  isGeneratingQuote: boolean = false;
  plantaSeleccionada: number | null = null;
  nombrePlantaSeleccionada: string | null = null;
  idProducto: number | null = null;
  dosificacion: Dosificacion | null = null;

  margenEnUf: number = 0;
  utilidad: number = 0;
  precioVenta: number = 0;

  viajes: number = 2;
  sobreDistancia: number = 0;
  movilizacion: number = 0;
  precioCemento: number = 0;
  precioAgua: number = 0;
  precioArena: number = 0;
  precioGravilla: number = 0;
  densidadArena: number = 0;
  densidadGravilla: number = 0;
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
  costoTotal: number = 0;
  costoFinal: number = 0;
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
    // No ocultar si hay un toast activo - verificar de manera más específica
    if (document.querySelector('.swal2-container')) {
      const toast = document.querySelector('.swal2-toast');
      if (toast) {
        return; // Hay un toast activo, no ocultar sugerencias
      }
    }

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
      this.peajeUf = this.redondear(this.peajeClp / this.ufValue / 7);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Valor UF no disponible',
        text: 'No se puede convertir el peaje a UF sin el valor actual de la UF',
      });
    }
    console.log('Peaje CLP:', this.peajeClp);
    console.log('Viajes:', this.viajes);
    console.log('UF Value:', this.ufValue);
    console.log('Peaje en UF (dividido por 7):', this.peajeUf);
  }

  calcularSobreDistancia(): void {
    if (this.sobreDistanciaKms > 30) {
      const kilometrosExcedentes = this.sobreDistanciaKms - 30;
      this.sobreDistancia = kilometrosExcedentes * this.valorPorKm;
    } else {
      this.sobreDistancia = 0;
    }
  }

  getFormattedSobreDistancia(): string {
    return this.truncateDecimalsPipe.transform(this.sobreDistancia, 2);
  }

  seleccionarSugerencia(sugerencia: any): void {
    console.log('Sugerencia seleccionada:', sugerencia);

    this.nombreComercial = sugerencia.nombreComercial;
    this.mostrarSugerencias = false;

    // Toast de selección exitosa
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: 'success',
      title: `"${sugerencia.nombreComercial}" seleccionado`,
    });

    const nombreCodificado = encodeURIComponent(sugerencia.nombreComercial);
    // Llamar a la búsqueda con toasts en lugar de alerts modales
    this.ejecutarBusquedaPorNombreComercialConToasts(
      sugerencia.nombreComercial,
      this.plantaSeleccionada!
    );
  }

  private ejecutarBusquedaPorNombreComercialConToasts(
    nombreComercial: string,
    idPlanta: number
  ): void {
    console.log('Ejecutando búsqueda con toasts:', {
      nombreComercial,
      idPlanta,
    });

    // Toast de "Buscando dosificación..."
    const loadingToast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        Swal.showLoading();
      },
    });

    const toastInstance = loadingToast.fire({
      title: 'Buscando dosificación...',
    });

    this.apiService
      .getDosificacionByNombreComercial(nombreComercial, idPlanta)
      .subscribe({
        next: (dosificacion) => {
          console.log('Dosificación encontrada:', dosificacion);
          this.dosificacion = dosificacion;

          // Cerrar toast de búsqueda
          Swal.close();

          // Toast de éxito
          const successToast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });

          successToast.fire({
            icon: 'success',
            title: `Dosificación encontrada`,
          });

          // Usar el valor de UF desde costos generales
          this.ufValue = this.costosGenerales['UF'] || 0;

          if (this.ufValue <= 0) {
            const warningToast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 4000,
            });
            warningToast.fire({
              icon: 'warning',
              title: 'Valor UF no disponible',
            });
          }

          // Proceder con el cálculo de costos usando toast
          this.obtenerPreciosMateriasPrimasConToasts();
        },
        error: (error) => {
          console.error('Error en búsqueda por nombre comercial:', error);
          Swal.close();

          // Toast de error
          const errorToast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
          });

          errorToast.fire({
            icon: 'error',
            title: 'No se encontró dosificación',
          });
        },
      });
  }

  seleccionarPlanta(idPlanta: number) {
    const planta = this.plantas.find((p) => p.id === idPlanta);
    if (planta) {
      this.plantaSeleccionada = idPlanta;
      this.nombrePlantaSeleccionada = planta.nombre;

      // Resetear proveedor seleccionado cuando cambia la planta
      this.proveedorSeleccionado = null;
      this.nombreProveedorSeleccionado = null;

      Swal.fire({
        icon: 'success',
        title: 'Planta seleccionada',
        text: `Has seleccionado la planta ${this.nombrePlantaSeleccionada}`,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  }

  seleccionarProveedor(idProveedor: number) {
    console.log('ID Proveedor seleccionado:', idProveedor); // Agregar este log para debug

    const proveedor = this.proveedoresAntofagasta.find(
      (p) => p.id === idProveedor
    );

    if (proveedor) {
      this.proveedorSeleccionado = idProveedor;
      this.nombreProveedorSeleccionado = proveedor.nombre;

      // Cargar productos del proveedor seleccionado
      this.cargarProductosPorProveedor(idProveedor);

      Swal.fire({
        icon: 'success',
        title: 'Proveedor seleccionado',
        text: `Has seleccionado el proveedor ${this.nombreProveedorSeleccionado}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      console.error('Proveedor no encontrado con ID:', idProveedor);
    }
  }

  // En cargarProductosPorProveedor()
  cargarProductosPorProveedor(idProveedor: number): void {
    console.log('Cargando productos para proveedor ID:', idProveedor);

    if (!idProveedor || idProveedor === undefined) {
      console.error('ID Proveedor inválido:', idProveedor);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID de proveedor inválido',
      });
      return;
    }

    this.apiService.getMateriasPrimasAntofagasta(idProveedor).subscribe({
      next: (productos) => {
        // Normalizar la estructura de productos
        this.productosAntofagasta = productos
          .filter((producto) => producto.precio > 0)
          .map((producto) => ({
            ...producto,
            // Asegurar que siempre tenga la propiedad 'nombre'
            nombre: producto.nombre_producto || producto.nombre || 'Sin nombre',
          }));

        this.productosFiltrados = [...this.productosAntofagasta];

        console.log('Productos cargados:', this.productosAntofagasta);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los productos del proveedor',
        });
      },
    });
  }

  filtrarProductos(): void {
    if (this.filtroProducto.length >= 3) {
      const filtro = this.filtroProducto.toLowerCase();

      this.productosFiltrados = this.productosAntofagasta.filter((producto) => {
        const nombre = producto.nombre_producto || producto.nombre || '';
        return nombre.toLowerCase().includes(filtro) && producto.precio > 0;
      });

      this.mostrarListaProductos = true;
    } else {
      this.productosFiltrados = this.productosAntofagasta.filter(
        (producto) => producto.precio > 0
      );
      this.mostrarListaProductos = this.filtroProducto.length > 0;
    }

    console.log('Productos filtrados:', this.productosFiltrados);
  }

  private blurTimeout: any;

  seleccionarProducto(producto: any): void {
    // Cancelar cualquier timeout pendiente de blur
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }

    this.productoSeleccionadoAntofagasta = producto;
    this.filtroProducto = producto.nombre_producto || producto.nombre;
    this.mostrarListaProductos = false;

    // 🔥 SEPARAR LÓGICA POR TIPO DE PLANTA
    if (this.plantaSeleccionada === 3) {
      // ANTOFAGASTA: Lógica actual
      this.cargarDosificacionParaProductoAntofagasta(producto);
    } else {
      // OTRAS PLANTAS: Nueva lógica que replica "Buscar por Nombre Comercial"
      this.seleccionarProductoOtraPlanta(producto);
    }
  }

  cargarDosificacionParaProductoAntofagasta(producto: any): void {
    console.log('Cargando dosificación para producto:', producto);

    const loadingToast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        Swal.showLoading();
      },
    });

    const toastInstance = loadingToast.fire({
      title: 'Cargando información...',
    });

    // 🔥 PARA ANTOFAGASTA: Mantener el comportamiento actual
    if (this.plantaSeleccionada === 3) {
      // ... código existente para Antofagasta ...

      this.costearProductoDirectoAntofagasta(producto);
    } else {
      // 🔥 PARA OTRAS PLANTAS: Buscar dosificación y calcular costos completos
      this.apiService
        .getDosificacionByProductoYPlanta(
          producto.id_producto,
          this.plantaSeleccionada!
        )
        .subscribe({
          next: (dosificacion) => {
            this.dosificacion = dosificacion;
            Swal.close();

            const successToast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });

            successToast.fire({
              icon: 'success',
              title: 'Dosificación cargada',
            });

            // 🔥 SOLUCIÓN: Obtener precios actualizados antes de costear
            this.obtenerPreciosMateriasPrimasConToasts(false).then(() => {
              // Una vez que tenemos los precios, ejecutar el costeo para otras plantas
              this.costearProductoConDosificacion(producto);
            });
          },
          error: (error) => {
            Swal.close();
            console.warn(
              'No se encontró dosificación específica, usando valores por defecto'
            );

            this.dosificacion = {
              idDosificacion: 0,
              idProducto: producto.id_producto || 0,
              idPlanta: this.plantaSeleccionada || 0,
              descripcion: `Producto: ${
                producto.nombre_producto || producto.nombre
              }`,
              cemento: 300,
              aguaTotal: 180,
              arena: 800,
              gravilla: 1000,
              aditivo1: 0,
              aditivo2: 0,
              aditivo3: 0,
              aditivo4: 0,
              aditivo5: 0,
              aditivo6: 0,
              aditivo7: 0,
              aditivo8: 0,
            };

            // 🔥 SOLUCIÓN: Obtener precios actualizados también en caso de error
            this.obtenerPreciosMateriasPrimasConToasts(false).then(() => {
              this.costearProductoConDosificacion(producto);
            });

            const infoToast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 4000,
            });

            infoToast.fire({
              icon: 'info',
              title: 'Usando dosificación estándar',
            });
          },
        });
    }
  }

  costearProductoConDosificacion(producto: any): void {
    this.tipoBusqueda = 'producto';

    // Calcular costos adicionales
    this.actualizarPeajeEnUf();
    this.calcularSobreDistancia();

    const costoTransporte =
      this.peajeUf * this.viajes + this.sobreDistancia + this.movilizacion;

    // Para plantas con dosificación, usar el costo calculado en calcularCostos()
    this.precioVenta =
      this.costoFinal + // 🔥 Este viene de calcularCostos() ejecutado en obtenerPreciosMateriasPrimasConToasts()
      this.margenEnUf +
      this.otros +
      costoTransporte +
      this.ufLaboratorio;

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: 'success',
      title: `"${
        producto.nombre_producto || producto.nombre
      }" costeado correctamente`,
    });

    console.log('Costeo con dosificación:', {
      producto: producto.nombre_producto,
      costoProduccion: this.costoFinal,
      precioVenta: this.precioVenta,
      dosificacion: this.dosificacion,
    });
  }

  obtenerPreciosMateriasPrimasConToasts(
    mostrarAlerta: boolean = true
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.nombrePlantaSeleccionada) {
        const calculatingToast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            Swal.showLoading();
          },
        });

        calculatingToast.fire({
          title: 'Calculando costeo...',
        });

        this.apiService
          .getMateriasPrimas(this.nombrePlantaSeleccionada)
          .subscribe({
            next: (materias) => {
              // TODO EL CÓDIGO COMPLETO DE obtenerPreciosMateriasPrimas AQUÍ
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
                const porcentajePerdidaCemento = cemento.perdida;
                const cantidadCemento = this.dosificacion
                  ? this.dosificacion.cemento || 0
                  : 0;
                const cantidadCementoConPerdida =
                  cantidadCemento * (1 + porcentajePerdidaCemento / 100);
                this.costoCemento = this.redondear(
                  (cantidadCementoConPerdida * this.precioCemento) /
                    this.ufValue
                );
              }

              if (agua) {
                this.precioAgua = agua.precio;
                this.aguaUtilizada = agua.perdida;
                this.costoAgua = this.redondear(
                  (this.aguaUtilizada * this.precioAgua) / this.ufValue
                );
              }

              if (arena) {
                this.precioArena = arena.precio;
                this.densidadArena = arena.densidad;
                const porcentajePerdidaArena = arena.perdida;
                const cantidadArena = this.dosificacion?.arena ?? 0;
                const cantidadArenaAjustada =
                  cantidadArena / this.densidadArena;
                const cantidadArenaConPerdida =
                  cantidadArenaAjustada * (1 + porcentajePerdidaArena / 100);
                this.costoArena = this.redondear(
                  (cantidadArenaConPerdida * this.precioArena) / this.ufValue
                );
              }

              if (gravilla) {
                this.precioGravilla = gravilla.precio;
                this.densidadGravilla = gravilla.densidad;
                const porcentajePerdidaGravilla = gravilla.perdida;
                const cantidadGravilla = this.dosificacion?.gravilla ?? 0;
                const cantidadGravillaAjustada =
                  cantidadGravilla / this.densidadGravilla;
                const cantidadGravillaConPerdida =
                  cantidadGravillaAjustada *
                  (1 + porcentajePerdidaGravilla / 100);
                this.costoGravilla = this.redondear(
                  (cantidadGravillaConPerdida * this.precioGravilla) /
                    this.ufValue
                );
              }

              if (aditivoBase) {
                this.precioAditivoBase = aditivoBase.precio;
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
                const cantidadAditivoBase = this.dosificacion.aditivo1 || 0;
                this.costoAditivoBase = this.redondear(
                  (cantidadAditivoBase * this.precioAditivoBase) / this.ufValue
                );
              }

              // 🔥 EJECUTAR CÁLCULO DE COSTOS
              this.calcularCostos();
              Swal.close();

              if (mostrarAlerta) {
                const successToast = Swal.mixin({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true,
                });

                successToast.fire({
                  icon: 'success',
                  title: 'Costeo completado',
                });
              }
              resolve();
            },
            error: (err) => {
              Swal.close();
              reject(err);
            },
          });
      } else {
        reject('No hay planta seleccionada');
      }
    });
  }

  costearProductoDirectoAntofagasta(producto: any): void {
    if (!this.proveedorSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Proveedor no seleccionado',
        text: 'Por favor, selecciona un proveedor',
      });
      return;
    }

    this.tipoBusqueda = 'producto';

    // Usar el precio directo del producto
    const precioProductoUF = producto.precio || 0;

    // Calcular costos adicionales
    this.actualizarPeajeEnUf();
    this.calcularSobreDistancia();

    const costoTransporte =
      this.peajeUf * this.viajes + this.sobreDistancia + this.movilizacion;

    // El costo final es el precio del producto más costos adicionales
    this.costoFinal = precioProductoUF;
    this.precioVenta =
      this.costoFinal +
      this.margenEnUf +
      this.otros +
      costoTransporte +
      this.ufLaboratorio;

    // Si no hay dosificación, crear una básica
    if (!this.dosificacion) {
      this.dosificacion = {
        idDosificacion: 0,
        idProducto: producto.id_producto || 0,
        idPlanta: this.plantaSeleccionada || 0,
        descripcion: `Producto: ${
          producto.nombre_producto || producto.nombre
        } - Proveedor: ${this.nombreProveedorSeleccionado}`,
        cemento: 0,
        aguaTotal: 0,
        arena: 0,
        gravilla: 0,
        aditivo1: 0,
        aditivo2: 0,
        aditivo3: 0,
        aditivo4: 0,
        aditivo5: 0,
        aditivo6: 0,
        aditivo7: 0,
        aditivo8: 0,
      };
    }

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: 'success',
      title: `"${
        producto.nombre_producto || producto.nombre
      }" costeado correctamente`,
    });

    console.log('Costeo Antofagasta:', {
      producto: producto.nombre_producto,
      precioBaseUF: precioProductoUF,
      costoFinal: this.costoFinal,
      precioVenta: this.precioVenta,
      dosificacion: this.dosificacion,
    });
  }

  limpiarSeleccionProducto(): void {
    this.productoSeleccionadoAntofagasta = null;
    this.filtroProducto = '';
    this.productosFiltrados = this.productosAntofagasta.filter(
      (producto) => producto.precio > 0
    );
    this.mostrarListaProductos = false;
    this.dosificacion = null;

    // Cancelar timeout si existe
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }
  }

  ocultarListaProductos(): void {
    // Usar timeout para dar tiempo a que se procese el clic
    this.blurTimeout = setTimeout(() => {
      this.mostrarListaProductos = false;
      this.blurTimeout = null;
    }, 150);
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

  costearProductoConMargenYOtros() {
    // Si es Antofagasta y hay producto seleccionado, recalcular
    if (this.plantaSeleccionada === 3 && this.productoSeleccionadoAntofagasta) {
      this.costearProductoDirectoAntofagasta(
        this.productoSeleccionadoAntofagasta
      );
      return;
    }

    // Para otras plantas, usar el método original con dosificación
    this.actualizarPeajeEnUf();
    this.calcularSobreDistancia();

    const costoTransporte =
      this.peajeUf * this.viajes + this.sobreDistancia + this.movilizacion;

    this.precioVenta =
      this.costoFinal +
      this.margenEnUf +
      this.otros +
      costoTransporte +
      this.ufLaboratorio;

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
    if (this.plantaSeleccionada === 3) {
      // Validaciones específicas para Antofagasta
      if (!this.productoSeleccionadoAntofagasta) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Debe seleccionar un producto para Antofagasta antes de generar la pre-cotización.',
        });
        return;
      }
    } else {
      // Validaciones para otras plantas
      if (!this.dosificacion) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Debe calcular el costeo antes de generar la pre-cotización.',
        });
        return;
      }
    }

    this.isGeneratingQuote = true;

    const costosAdicionales = {
      costoProduccion: this.costoFinal,
      peaje: this.peajeUf * this.viajes,
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
    if (this.plantaSeleccionada === 3 && this.productoSeleccionadoAntofagasta) {
      descripcionProducto = `${this.productoSeleccionadoAntofagasta.nombre_producto} - ${this.nombreProveedorSeleccionado}`;
    } else if (this.tipoBusqueda === 'producto' && this.idProducto) {
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
        this.plantaSeleccionada === 3
          ? `PC-ANT-${
              this.productoSeleccionadoAntofagasta?.id_producto || 'N/A'
            }`
          : this.tipoBusqueda === 'producto'
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



  obtenerPreciosMateriasPrimas(mostrarAlerta: boolean = true) {
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
              console.log(
                `Porcentaje de pérdida de Cemento: ${porcentajePerdidaCemento}`
              );

              // Obtener la cantidad de cemento desde la dosificación
              const cantidadCemento = this.dosificacion
                ? this.dosificacion.cemento || 0
                : 0; // Asumimos que la cantidad de cemento está en la dosificación

              // Log de la cantidad de cemento
              console.log(
                `Cantidad de Cemento (desde dosificación): ${cantidadCemento}`
              );

              // Ajustar por el porcentaje de pérdida
              const cantidadCementoConPerdida =
                cantidadCemento * (1 + porcentajePerdidaCemento / 100);
              console.log(
                `Cantidad de Cemento ajustada con pérdida: ${cantidadCementoConPerdida}`
              );

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
              console.log(
                `Porcentaje de pérdida de Arena: ${porcentajePerdidaArena}`
              );

              const cantidadArena = this.dosificacion?.arena ?? 0;

              console.log(
                `Cantidad de Arena (desde dosificación): ${cantidadArena}`
              );

              const cantidadArenaAjustada = cantidadArena / this.densidadArena;
              console.log(
                `Cantidad de Arena ajustada (por densidad): ${cantidadArenaAjustada}`
              );

              const cantidadArenaConPerdida =
                cantidadArenaAjustada * (1 + porcentajePerdidaArena / 100);
              console.log(
                `Cantidad de Arena ajustada con pérdida: ${cantidadArenaConPerdida}`
              );

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
              console.log(
                `Porcentaje de pérdida de Gravilla: ${porcentajePerdidaGravilla}`
              );

              // Obtener la cantidad de gravilla desde la dosificación
              const cantidadGravilla = this.dosificacion?.gravilla ?? 0; // Asumimos que la cantidad de gravilla está en la dosificación

              // Log de la cantidad de gravilla
              console.log(
                `Cantidad de Gravilla (desde dosificación): ${cantidadGravilla}`
              );

              // Dividir la cantidad de gravilla entre la densidad de la gravilla para ajustarla
              const cantidadGravillaAjustada =
                cantidadGravilla / this.densidadGravilla;
              console.log(
                `Cantidad de Gravilla ajustada (por densidad): ${cantidadGravillaAjustada}`
              );

              // Ajustar por el porcentaje de pérdida
              const cantidadGravillaConPerdida =
                cantidadGravillaAjustada *
                (1 + porcentajePerdidaGravilla / 100);
              console.log(
                `Cantidad de Gravilla ajustada con pérdida: ${cantidadGravillaConPerdida}`
              );

              // Calcular el costo final de la gravilla en función de su precio en la planta seleccionada
              this.costoGravilla = this.redondear(
                (cantidadGravillaConPerdida * this.precioGravilla) /
                  this.ufValue
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
              console.log(
                `Costo Aditivo Base calculado: ${this.costoAditivoBase}`
              );
            }

            this.calcularCostos();
            Swal.close();

            this.costearProductoConMargenYOtros();
            if (mostrarAlerta) {
              Swal.fire({
                icon: 'success',
                title: 'Costeo completado',
                text: 'Se ha calculado el costeo del producto correctamente.',
                timer: 1500,
                showConfirmButton: false,
              });
            }
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

      console.log('=== INICIANDO CÁLCULO DE COSTOS ===');
      console.log('Planta ID:', plantaId);
      console.log('Dosificación:', this.dosificacion);
      console.log('Valor UF:', this.ufValue);

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

              console.log('=== CÁLCULO DETALLADO GRAVILLA ===');
              console.log('- Cantidad dosificación:', gravilla, 'kg');
              console.log('- Densidad gravilla:', materiaPrima.densidad);
              console.log(
                '- Gravilla sin ajustar (kg/m³):',
                gravillaSinAjustar
              );
              console.log('- Porcentaje pérdida:', porcentajePerdida, '%');

              const gravillaConPerdida =
                gravillaSinAjustar * (1 + porcentajePerdida / 100);
              console.log('- Gravilla con pérdida:', gravillaConPerdida);

              // 🔥 CAMBIO IMPORTANTE: Usar el cálculo exacto en lugar de redondeos intermedios
              const calculoExacto =
                (gravillaConPerdida * materiaPrima.precio) / this.ufValue;
              console.log(
                '- Cálculo exacto (sin redondeos intermedios):',
                calculoExacto
              );

              // 🔥 USAR EL CÁLCULO EXACTO REDONDEADO para el costo final
              this.costoGravilla = this.redondear(calculoExacto);
              console.log(
                '- Costo gravilla final (usando cálculo exacto):',
                this.costoGravilla,
                'UF'
              );

              // Solo para tracking, no para cálculo
              this.gravillaAjustadaConPerdida =
                this.truncarADosDecimales(gravillaConPerdida);
              console.log(
                '- Gravilla ajustada (solo para visualización):',
                this.gravillaAjustadaConPerdida
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

            // Calcular costos de aditivos 2-10 CON LOGS
            console.log('=== CÁLCULO DE ADITIVOS ===');
            console.log('Precios de aditivos disponibles:');
            console.log('- precioAditivo2:', this.precioAditivo2);
            console.log('- precioAditivo3:', this.precioAditivo3);
            console.log('- precioAditivo4:', this.precioAditivo4);
            console.log('- precioAditivo5:', this.precioAditivo5);
            console.log('- precioAditivo6:', this.precioAditivo6);
            console.log('- precioAditivo7:', this.precioAditivo7);
            console.log('- precioAditivo8:', this.precioAditivo8);
            console.log('- precioAditivo9:', this.precioAditivo9);
            console.log('- precioAditivo10:', this.precioAditivo10);

            if (this.dosificacion) {
              console.log('Cantidades en dosificación:');
              console.log('- aditivo2:', this.dosificacion.aditivo2);
              console.log('- aditivo3:', this.dosificacion.aditivo3);
              console.log('- aditivo4:', this.dosificacion.aditivo4);
              console.log('- aditivo5:', this.dosificacion.aditivo5);
              console.log('- aditivo6:', this.dosificacion.aditivo6);
              console.log('- aditivo7:', this.dosificacion.aditivo7);
              console.log('- aditivo8:', this.dosificacion.aditivo8);
              console.log('- aditivo9:', this.dosificacion.aditivo9);
              console.log('- aditivo10:', this.dosificacion.aditivo10);

              // Calcular cada aditivo con log detallado
              this.costoAditivo2 = this.redondear(
                (this.precioAditivo2 / this.ufValue) *
                  (this.dosificacion.aditivo2 || 0)
              );
              console.log('Cálculo Aditivo 2:', {
                precioCLP: this.precioAditivo2,
                cantidad: this.dosificacion.aditivo2,
                precioUF: this.precioAditivo2 / this.ufValue,
                costoUF: this.costoAditivo2,
              });

              this.costoAditivo3 = this.redondear(
                (this.precioAditivo3 / this.ufValue) *
                  (this.dosificacion.aditivo3 || 0)
              );
              console.log('Cálculo Aditivo 3:', {
                precioCLP: this.precioAditivo3,
                cantidad: this.dosificacion.aditivo3,
                precioUF: this.precioAditivo3 / this.ufValue,
                costoUF: this.costoAditivo3,
              });

              this.costoAditivo4 = this.redondear(
                (this.precioAditivo4 / this.ufValue) *
                  (this.dosificacion.aditivo4 || 0)
              );
              console.log('Cálculo Aditivo 4:', {
                precioCLP: this.precioAditivo4,
                cantidad: this.dosificacion.aditivo4,
                precioUF: this.precioAditivo4 / this.ufValue,
                costoUF: this.costoAditivo4,
              });

              this.costoAditivo5 = this.redondear(
                (this.precioAditivo5 / this.ufValue) *
                  (this.dosificacion.aditivo5 || 0)
              );
              console.log('Cálculo Aditivo 5:', {
                precioCLP: this.precioAditivo5,
                cantidad: this.dosificacion.aditivo5,
                precioUF: this.precioAditivo5 / this.ufValue,
                costoUF: this.costoAditivo5,
              });

              this.costoAditivo6 = this.redondear(
                (this.precioAditivo6 / this.ufValue) *
                  (this.dosificacion.aditivo6 || 0)
              );
              console.log('Cálculo Aditivo 6:', {
                precioCLP: this.precioAditivo6,
                cantidad: this.dosificacion.aditivo6,
                precioUF: this.precioAditivo6 / this.ufValue,
                costoUF: this.costoAditivo6,
              });

              this.costoAditivo7 = this.redondear(
                (this.precioAditivo7 / this.ufValue) *
                  (this.dosificacion.aditivo7 || 0)
              );
              console.log('Cálculo Aditivo 7:', {
                precioCLP: this.precioAditivo7,
                cantidad: this.dosificacion.aditivo7,
                precioUF: this.precioAditivo7 / this.ufValue,
                costoUF: this.costoAditivo7,
              });

              this.costoAditivo8 = this.redondear(
                (this.precioAditivo8 / this.ufValue) *
                  (this.dosificacion.aditivo8 || 0)
              );
              console.log('Cálculo Aditivo 8:', {
                precioCLP: this.precioAditivo8,
                cantidad: this.dosificacion.aditivo8,
                precioUF: this.precioAditivo8 / this.ufValue,
                costoUF: this.costoAditivo8,
              });

              this.costoAditivo9 = this.redondear(
                (this.precioAditivo9 / this.ufValue) *
                  (this.dosificacion.aditivo9 || 0)
              );
              console.log('Cálculo Aditivo 9:', {
                precioCLP: this.precioAditivo9,
                cantidad: this.dosificacion.aditivo9,
                precioUF: this.precioAditivo9 / this.ufValue,
                costoUF: this.costoAditivo9,
              });

              this.costoAditivo10 = this.redondear(
                (this.precioAditivo10 / this.ufValue) *
                  (this.dosificacion.aditivo10 || 0)
              );
              console.log('Cálculo Aditivo 10:', {
                precioCLP: this.precioAditivo10,
                cantidad: this.dosificacion.aditivo10,
                precioUF: this.precioAditivo10 / this.ufValue,
                costoUF: this.costoAditivo10,
              });
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
              this.costoAditivo10;

            console.log('=== RESUMEN DE COSTOS ===');
            console.log('- Costo Cemento:', this.costoCemento, 'UF');
            console.log('- Costo Arena:', this.costoArena, 'UF');
            console.log('- Costo Gravilla:', this.costoGravilla, 'UF');
            console.log('- Costo Aditivo Base:', this.costoAditivoBase, 'UF');
            console.log('- Costo Aditivo 2:', this.costoAditivo2, 'UF');
            console.log('- Costo Aditivo 3:', this.costoAditivo3, 'UF');
            console.log('- Costo Aditivo 4:', this.costoAditivo4, 'UF');
            console.log('- Costo Aditivo 5:', this.costoAditivo5, 'UF');
            console.log('- Costo Aditivo 6:', this.costoAditivo6, 'UF');
            console.log('- Costo Aditivo 7:', this.costoAditivo7, 'UF');
            console.log('- Costo Aditivo 8:', this.costoAditivo8, 'UF');
            console.log('- Costo Aditivo 9:', this.costoAditivo9, 'UF');
            console.log('- Costo Aditivo 10:', this.costoAditivo10, 'UF');
            console.log('- COSTO TOTAL:', this.costoTotal, 'UF');
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

          this.precioVenta = this.redondear(
            this.costoFinal + this.margenEnUf + this.ufLaboratorio
          );
          this.utilidad = this.redondear(this.precioVenta - this.costoFinal);

          console.log('=== CÁLCULO FINAL ===');
          console.log('- Costo Agua:', this.costoAgua, 'UF');
          console.log('- Costo Final (producción):', this.costoFinal, 'UF');
          console.log('- Precio Venta:', this.precioVenta, 'UF');
          console.log('- Utilidad:', this.utilidad, 'UF');
        });
    } else {
      console.error('Dosificación o planta seleccionada no es válida.');
    }
  }

  redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }

  truncarADosDecimales(valor: number): number {
    return Math.floor(valor * 100) / 100;
  }

  buscarProducto(): void {
    this.tipoBusqueda = 'producto';

    if (this.idProducto && this.plantaSeleccionada !== null) {
      // Primero verificar si tenemos los costos generales cargados
      if (
        !this.costosGenerales ||
        Object.keys(this.costosGenerales).length === 0
      ) {
      } else {
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Información incompleta',
        text: 'Por favor, selecciona una planta e ingresa el ID del producto.',
      });
    }
  }

  buscarPorNombreComercial(nombreComercial: string, idPlanta: number): void {
    console.log('=== INICIANDO BÚSQUEDA POR NOMBRE COMERCIAL ===');
    console.log('Nombre comercial:', nombreComercial);
    console.log('Planta ID:', idPlanta);
    console.log('Planta seleccionada:', this.plantaSeleccionada);


    // Validaciones más estrictas
    if (!nombreComercial || nombreComercial.trim().length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Nombre comercial requerido',
        text: 'Por favor, ingresa un nombre comercial válido.',
      });
      return;
    }

    if (!idPlanta || idPlanta === null || idPlanta === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Planta no seleccionada',
        text: 'Por favor, selecciona una planta primero.',
      });
      return;
    }

    this.tipoBusqueda = 'nombreComercialText';

    // Verificar si los costos generales están cargados
    if (
      !this.costosGenerales ||
      Object.keys(this.costosGenerales).length === 0
    ) {
      console.log('Costos generales no cargados, cargando primero...');

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
          console.log('Costos cargados, ejecutando búsqueda...');
          this.ejecutarBusquedaPorNombreComercial(
            nombreComercial.trim(),
            idPlanta,
            true
          );
        },
        error: (err) => {
          Swal.close();
          console.error('Error al cargar costos:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los costos generales',
          });
        },
      });
    } else {
      console.log('Costos ya cargados, ejecutando búsqueda directamente...');
      this.ejecutarBusquedaPorNombreComercial(
        nombreComercial.trim(),
        idPlanta,
        true
      );
    }
  }

  seleccionarProductoOtraPlanta(producto: any): void {
    console.log('Seleccionando producto para planta normal:', producto);

    // Cancelar timeout si existe
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }

    this.productoSeleccionadoAntofagasta = producto;
    this.filtroProducto = producto.nombre_producto || producto.nombre;
    this.mostrarListaProductos = false;

    // Para otras plantas, usar el mismo flujo que "Buscar por Nombre Comercial"
    this.ejecutarBusquedaCompletaParaProducto(producto);
  }

  private ejecutarBusquedaCompletaParaProducto(producto: any): void {
    console.log('Ejecutando búsqueda completa para producto:', producto);

    // Toast de "Buscando dosificación..."
    const loadingToast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        Swal.showLoading();
      },
    });

    const toastInstance = loadingToast.fire({
      title: 'Buscando dosificación...',
    });

    // Buscar dosificación por ID del producto (igual que buscarPorNombreComercial)
    this.apiService
      .getDosificacionByProductoYPlanta(
        producto.id_producto,
        this.plantaSeleccionada!
      )
      .subscribe({
        next: (dosificacion) => {
          console.log('Dosificación encontrada:', dosificacion);
          this.dosificacion = dosificacion;

          // Cerrar toast de búsqueda
          Swal.close();

          // Toast de éxito
          const successToast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });

          successToast.fire({
            icon: 'success',
            title: `Dosificación encontrada`,
          });

          // Usar el valor de UF desde costos generales
          this.ufValue = this.costosGenerales['UF'] || 0;

          if (this.ufValue <= 0) {
            const warningToast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 4000,
            });
            warningToast.fire({
              icon: 'warning',
              title: 'Valor UF no disponible',
            });
          }

          // 🔥 EJECUTAR EL MISMO MÉTODO que usa "Buscar por Nombre Comercial"
          this.obtenerPreciosMateriasPrimasConToasts(true);
        },
        error: (error) => {
          console.error('Error en búsqueda por producto:', error);
          Swal.close();

          // Si no encuentra dosificación, usar valores por defecto (igual que antes)
          console.warn(
            'No se encontró dosificación específica, usando valores por defecto'
          );

          this.dosificacion = {
            idDosificacion: 0,
            idProducto: producto.id_producto || 0,
            idPlanta: this.plantaSeleccionada || 0,
            descripcion: `Producto: ${
              producto.nombre_producto || producto.nombre
            }`,
            cemento: 300,
            aguaTotal: 180,
            arena: 800,
            gravilla: 1000,
            aditivo1: 0,
            aditivo2: 0,
            aditivo3: 0,
            aditivo4: 0,
            aditivo5: 0,
            aditivo6: 0,
            aditivo7: 0,
            aditivo8: 0,
          };

          // 🔥 EJECUTAR EL MISMO MÉTODO que usa "Buscar por Nombre Comercial"
          this.obtenerPreciosMateriasPrimasConToasts(true);

          const infoToast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
          });

          infoToast.fire({
            icon: 'info',
            title: 'Usando dosificación estándar',
          });
        },
      });
  }

  private ejecutarBusquedaPorNombreComercial(
    nombreComercial: string,
    idPlanta: number,
    mostrarAlertaFinal: boolean = true
  ): void {
    console.log('Ejecutando búsqueda con:', { nombreComercial, idPlanta });

    Swal.fire({
      title: 'Buscando dosificación...',
      text: `Buscando "${nombreComercial}" en ${this.nombrePlantaSeleccionada}`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.apiService
      .getDosificacionByNombreComercial(nombreComercial, idPlanta)
      .subscribe({
        next: (dosificacion) => {
          console.log('Dosificación encontrada:', dosificacion);
          this.dosificacion = dosificacion;

          Swal.close();

          // Mostrar éxito con toast en lugar de alerta modal
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
          });

          Toast.fire({
            icon: 'success',
            title: `Dosificación encontrada para "${nombreComercial}"`,
          });

          this.ufValue = this.costosGenerales['UF'] || 0;

          if (this.ufValue <= 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Valor de UF no disponible',
              text: 'El valor de UF no está configurado en los costos generales.',
              timer: 2000,
            });
          }

          this.obtenerPreciosMateriasPrimas(mostrarAlertaFinal);
        },
        error: (error) => {
          console.error('Error en búsqueda por nombre comercial:', error);
          Swal.close();

          Swal.fire({
            icon: 'error',
            title: 'No se encontró dosificación',
            text: `No se encontró una dosificación para el nombre comercial "${nombreComercial}" en la planta ${this.nombrePlantaSeleccionada}.`,
            footer:
              'Verifica que el nombre comercial sea correcto y esté asociado a esta planta.',
          });
        },
      });
  }
}
