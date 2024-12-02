import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Producto } from '../../models/producto.model';
import { Dosificacion } from '../../models/dosificacion.model';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dosificacion',
  templateUrl: './dosificacion.component.html',
  styleUrls: ['./dosificacion.component.css'],
})
export class DosificacionComponent implements OnInit {

  showScrollToTop: boolean = false;


  plantasMap: { [key: number]: string } = {
    1: 'Planta Taltal',
    2: 'Planta Mejillones',
    3: 'Planta Antofagasta',
    4: 'Planta Maria Elena',
    5: 'Planta Calama',
    6: 'Planta Tocopilla'
  };


  dosificaciones: Dosificacion[] = [];
  isLoading: boolean = false; // Indica si las dosificaciones están cargando
  filtroIdProducto: string = ''; // Almacena el valor del input de búsqueda
  totalDosificaciones: number = 0;


  faSave = faSave;
  faTimes = faTimes;
  isUpdating = false;
  isCheckingExisting = false; // Nueva variable para controlar la verificación inicial
  ultimoProducto: Producto | null = null;
  dosificacion: Dosificacion = {
    idDosificacion: 0,
    idProducto: 0,
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
    idPlanta: 1, // Valor predeterminado
    descripcion: 'N/A',
  };

  listaAditivos: string[] = [
    'Viscocrete',
    'Darafill',
    'Sikafiber force-48',
    'Sika aer',
    'Sika wt240',
    'Delvo',
    'SIKA 100',
    'PERLAS',
    'SIKA CNI',
    'BARCHIP54',
    'EUCON CIA',
  ];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.cargarUltimoProducto();
    this.cargarDosificaciones();
    window.addEventListener('scroll', this.checkScroll.bind(this));
  }

  resetFormulario(): void {
    this.dosificacion = {
      idDosificacion: 0,
      idProducto: 0,
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
      idPlanta: 1, // Valor predeterminado
      descripcion: 'N/A',
    };
  }


  checkScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showScrollToTop = scrollPosition > 200; // Mostrar botón si el scroll es mayor a 200px
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Desplazamiento suave
    });
  }

  cargarDosificaciones(): void {
    this.isLoading = true;
    this.apiService.getDosificaciones().subscribe(
      (data) => {
        this.dosificaciones = data;
        this.totalDosificaciones = this.dosificaciones.length;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar las dosificaciones:', error);
        this.isLoading = false;
      }
    );
  }

  buscarDosificacion(): void {
    const filtro = this.filtroIdProducto.trim();

    if (filtro === '') {
      // Si no hay filtro, recarga todas las dosificaciones
      this.cargarDosificaciones();
    } else {
      // Filtra las dosificaciones por el ID de Producto
      this.dosificaciones = this.dosificaciones.filter((d) =>
        d.idProducto.toString().includes(filtro)
      );
    }
  }


  seleccionarDosificacion(dosificacion: Dosificacion): void {
    this.dosificacion = { ...dosificacion }; // Carga los datos en el formulario
    this.isUpdating = true; // Cambia el estado para habilitar la actualización

    this.ultimoProducto = {
      idProducto: dosificacion.idProducto, // Usa el idProducto como identificador
      numeroFormula: dosificacion.idProducto, // Usa el idProducto como número de fórmula
      descripcionATecnica: dosificacion.descripcion, // Usa la descripción de la dosificación
      familia: 0, // Valor predeterminado o asignar uno válido si lo tienes
      insertDate: undefined // Asigna null o un valor por defecto si es necesario
    };
  }


  cargarUltimoProducto(): void {
    this.apiService.getUltimoProducto().subscribe(
      (producto) => {
        if (producto) {
          this.ultimoProducto = producto;
          this.dosificacion.idProducto = producto.numeroFormula; // Asigna el número de fórmula
          console.log('Último producto cargado:', producto); // Depuración
        } else {
          console.error('No se encontró un último producto válido.');
        }
      },
      (error) => {
        console.error('Error al cargar el último producto:', error);
      }
    );
  }


  onSubmit(): void {
    // Inicializar valores predeterminados para los campos opcionales
    this.dosificacion = {
      ...this.dosificacion,
      nombreAditivo2: this.dosificacion.nombreAditivo2 || '',
      aditivo2: this.dosificacion.aditivo2 || 0,
      nombreAditivo3: this.dosificacion.nombreAditivo3 || '',
      aditivo3: this.dosificacion.aditivo3 || 0,
      nombreAditivo4: this.dosificacion.nombreAditivo4 || '',
      aditivo4: this.dosificacion.aditivo4 || 0,
      nombreAditivo5: this.dosificacion.nombreAditivo5 || '',
      aditivo5: this.dosificacion.aditivo5 || 0,
      nombreAditivo6: this.dosificacion.nombreAditivo6 || '',
      aditivo6: this.dosificacion.aditivo6 || 0,
      nombreAditivo7: this.dosificacion.nombreAditivo7 || '',
      aditivo7: this.dosificacion.aditivo7 || 0,
      nombreAditivo8: this.dosificacion.nombreAditivo8 || '',
      aditivo8: this.dosificacion.aditivo8 || 0,
    };

    console.log('Datos enviados al backend:', this.dosificacion);

    if (this.isUpdating) {
      // Lógica de actualización existente
      this.apiService
        .actualizarDosificacion(this.dosificacion.idProducto, this.dosificacion)
        .subscribe(
          () => {
            Swal.fire({
              title: '¡Actualización exitosa!',
              text: 'La dosificación se ha actualizado correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            });
            this.isUpdating = false;
            this.isCheckingExisting = false;
          },
          (error) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar la dosificación.',
              icon: 'error',
              confirmButtonText: 'Cerrar',
            });
          }
        );
    } else if (!this.isCheckingExisting) {
      // Lógica para registrar una nueva dosificación
      this.isCheckingExisting = true;

      this.apiService
        .getDosificacionByProductoYPlanta(
          this.dosificacion.idProducto,
          this.dosificacion.idPlanta
        )
        .subscribe(
          (existingDosificacion) => {
            Swal.fire({
              title: 'Dosificación existente',
              text: '¿Deseas actualizar la dosificación existente o ingresar un nuevo producto?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Actualizar Dosificación',
              cancelButtonText: 'Ingresar Nuevo Producto',
            }).then((result) => {
              if (result.isConfirmed) {
                this.dosificacion = existingDosificacion;
                this.isUpdating = true;
              } else {
                this.router.navigate(['/nuevo-producto-at']);
              }
              this.isCheckingExisting = false;
            });
          },
          (error) => {
            if (error.status === 404) {
              this.apiService.createDosificacion(this.dosificacion).subscribe(
                () => {
                  Swal.fire({
                    title: '¡Dosificación registrada!',
                    text: 'La dosificación se ha registrado correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                  });
                },
                (err) => {
                  Swal.fire({
                    title: 'Error',
                    text: 'No se pudo registrar la dosificación.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                  });
                }
              );
            }
            this.isCheckingExisting = false;
          }
        );
    }
  }

}
