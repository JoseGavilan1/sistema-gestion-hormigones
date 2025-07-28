import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../../services/api/api.service';
import { Producto } from '../../models/producto.model';
import Swal from 'sweetalert2';
import { Dosificacion } from '../../models/dosificacion.model';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-carga-maestro',
  templateUrl: './carga-maestro.component.html',
  styleUrls: ['./carga-maestro.component.css'],
})
export class CargaMaestroComponent {
  dosificacion: any = {};
  planta: number = 1;
  productos: Producto[] = [];
  busqueda: string = '';
  productosFiltrados: Producto[] = [];
  comprobandoDosificaciones: boolean = false;
  actualizandoDosificaciones: boolean = false;
  procesoCompleto: boolean = false;
  mostrarAlertaDosificacion: boolean = false;
  dosificaciones: Dosificacion[] = [];
  dosificacionesCreadas = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.productosFiltrados = [...this.productos];
    this.cargarDosificaciones();
  }

  plantasMap: { [key: number]: string } = {
    1: 'Taltal',
    2: 'Mejillones',
    3: 'Antofagasta',
    4: 'María Elena',
    5: 'Calama',
    6: 'Tocopilla',
  };

  nombrePlantaSeleccionada(): string {
    return this.plantasMap[this.planta] || 'N/A';
  }

  cargarDosificaciones() {
    this.apiService
      .getDosificacionByProducto(this.dosificacion.idProducto)
      .subscribe(
        (response) => {
          this.dosificacion = response;
        },
        (error) => {
          console.error('Error al obtener dosificaciones', error);
        }
      );
  }

  buscarProducto() {
    this.productosFiltrados = this.productos.filter((producto) =>
      this.busqueda
        ? producto.numeroFormula.toString().includes(this.busqueda)
        : true
    );
  }

  seleccionarPlanta(idPlanta: number): void {
    this.planta = idPlanta; // Actualiza la planta seleccionada
    this.resetearEstado(); // Resetea el estado del componente
    console.log(`Planta seleccionada: ${this.plantasMap[idPlanta]}`);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log('Productos cargados desde Excel:', excelData);
        this.crearProductosDesdeExcel(excelData);
        this.crearDosificacionesDesdeExcel(excelData);
        this.productosFiltrados = [...this.productos];
        this.dosificaciones = excelData.slice(1).map((row: any) => {
          return {
            numeroFormula: row[0],
            cemento: row[2],
            aguaTotal: row[3],
            arena: row[4],
            gravilla: row[5],
            aditivo1: row[6],
            aditivo2: row[7],
            aditivo3: row[8],
            aditivo4: row[9],
            aditivo5: row[10],
            aditivo6: row[11],
            aditivo7: row[12],
            aditivo8: row[13],
            descripcion: row[14],
            idProducto: row[0],
            idDosificacion: 0,
            idPlanta: this.planta,
          };
        });
      };
      reader.readAsArrayBuffer(file);
    }
  }

  async crearProductosDesdeExcel(excelData: any[]) {
    this.productos = [];
    for (let i = 1; i < excelData.length; i++) {
      const fila = excelData[i];
      if (fila.length < 1) continue;

      const numeroFormula = fila[0];
      const nomenclatura = fila[1];
      const familia = Math.floor(numeroFormula / 1000) * 1000;

      const producto: Producto = {
        numeroFormula: numeroFormula,
        familia: familia,
        descripcionATecnica: nomenclatura,
        idProducto: 0,
      };

      this.productos.push(producto);
    }

    console.log('Productos cargados:', this.productos);
  }

  async crearDosificacionesDesdeExcel(excelData: any[]) {
    this.dosificacion = [];

    for (let i = 1; i < excelData.length; i++) {
      const fila = excelData[i];
      if (fila.length < 1) continue;

      const producto = this.productos.find((p) => p.numeroFormula === fila[0]);
      if (producto) {
        const dosificacion = {
          idProducto: producto.idProducto,
          numeroFormula: producto.numeroFormula,
          planta: this.planta,
          cantidad: fila[2] || 0,
          fecha: fila[3] || new Date(),
        };

        this.dosificacion.push(dosificacion);
      }
    }

    console.log('Dosificaciones preparadas:', this.dosificacion);
  }

  async insertarProductos() {
    if (this.productosFiltrados.length === 0) {
      Swal.fire('No hay productos para insertar.');
      return;
    }

    Swal.fire({
      title: 'Insertando productos...',
      html: `<div class="custom-spinner"></div><br><span class="loading-text">Por favor, espere...</span>`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      customClass: { popup: 'custom-popup' },
    });

    let productosCreados = 0;
    let productosExistentes: Producto[] = [];

    for (const producto of this.productosFiltrados) {
      try {
        const existingProducto = await this.apiService
          .getProductoByNumeroFormula(producto.numeroFormula)
          .toPromise();
        if (existingProducto) {
          productosExistentes.push(existingProducto);
        } else {
          await this.apiService.createProducto(producto).toPromise();
          productosCreados++;
        }
      } catch (error) {
        console.error('Error al insertar producto:', producto, error);
      }
    }

    Swal.close();

    if (productosExistentes.length > 0) {
      await Swal.fire({
        title: 'Algunos productos ya existen',
        text: '¿Deseas omitir productos ya ingresados e ingresar nuevos?',
        icon: 'warning',
        html: productosExistentes
          .map(
            (p) =>
              `<div>Producto ${p.numeroFormula}: ${p.descripcionATecnica}</div>`
          )
          .join(''),
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Omitir productos ya ingresados e ingresar nuevos',
      }).then(async (result) => {
        if (result.isConfirmed) {
          await this.actualizarProductos(productosExistentes);
          productosCreados = productosExistentes.length;
        }
      });
    }

    Swal.fire(
      'Finalizado',
      `${productosCreados} productos fueron creados correctamente y ${productosExistentes.length} fueron omitidos.`,
      'success'
    );
  }

  actualizarProductos(productosExistentes: Producto[]) {
    throw new Error('Method not implemented.');
  }

  async insertarDosificaciones() {
    if (this.dosificaciones.length === 0) {
      Swal.fire('No hay dosificaciones para insertar.');
      return;
    }

    Swal.fire({
      title: 'Insertando dosificaciones...',
      html: `<div class="custom-spinner"></div><br><span class="loading-text">Por favor, espere...</span>`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      customClass: { popup: 'custom-popup' },
    });

    let creadasCorrectamente = 0;
    let omitidas = 0;

    for (const dosificacion of this.dosificaciones) {
      // Validar idProducto e idPlanta antes de proceder
      if (!dosificacion.idProducto || !dosificacion.idPlanta) {
        console.error(
          `Datos inválidos: idProducto=${dosificacion.idProducto}, idPlanta=${dosificacion.idPlanta}`
        );
        omitidas++;
        continue;
      }

      try {
        // Verificar si la dosificación existe
        const existeDosificacion = await this.apiService
          .getDosificacionByProductoYPlanta(
            dosificacion.idProducto,
            dosificacion.idPlanta
          )
          .toPromise();

        if (existeDosificacion) {
          console.log(
            `Dosificación omitida: Producto ${dosificacion.idProducto}, Planta ${dosificacion.idPlanta}`
          );
          omitidas++;
          continue; // Omitir si ya existe
        }
      } catch (error: any) {
        // Manejar específicamente el error 404 (dosificación no encontrada)
        if (error.status !== 404) {
          console.error('Error al verificar dosificación:', error);
          omitidas++;
          continue; // Omitir si ocurre otro tipo de error
        }
      }

      try {
        // Crear dosificación si no existe
        await this.apiService.createDosificacion(dosificacion).toPromise();
        creadasCorrectamente++;
      } catch (error) {
        console.error('Error al insertar dosificación:', error);
        omitidas++;
      }
    }

    Swal.close();

    Swal.fire(
      'Finalizado',
      `${creadasCorrectamente} dosificaciones fueron creadas correctamente y ${omitidas} omitidas.`,
      'success'
    );
  }

  mostrarAlertaDosificacionesExistentes(dosificaciones: any[]) {
    Swal.fire({
      title: 'Algunas dosificaciones ya existen',
      text: 'Las siguientes dosificaciones ya existen en la base de datos. ¿Deseas actualizarlas?',
      icon: 'warning',
      html: dosificaciones
        .map(
          (d) => `<div>Producto ${d.numeroFormula} - Planta ${d.planta}</div>`
        )
        .join(''),
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Omitir',
    }).then((result) => {
      if (result.isConfirmed) {
        this.actualizarDosificaciones(dosificaciones);
      } else {
        console.log('Omitir dosificaciones existentes');
      }
    });
  }

  async actualizarDosificaciones(dosificacionesParaActualizar: any[]) {
    for (const dosificacion of dosificacionesParaActualizar) {
      try {
        await this.apiService
          .updateDosificacionPorNumeroFormula(
            dosificacion.numeroFormula,
            dosificacion
          )
          .toPromise();
        console.log(
          `Dosificación actualizada: Producto ${dosificacion.numeroFormula}`
        );
      } catch (error) {
        console.error('Error al actualizar dosificación:', dosificacion, error);
      }
    }
  }

  mostrarAlertaProductosExistentes(productos: Producto[]) {
    Swal.fire({
      title: 'Algunos productos ya existen',
      text: 'Los siguientes productos ya existen en la base de datos. ¿Deseas actualizarlos?',
      icon: 'warning',
      html: productos
        .map(
          (p) =>
            `<div>Producto ${p.numeroFormula}: ${p.descripcionATecnica}</div>`
        )
        .join(''),
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Omitir',
    }).then((result) => {
      if (result.isConfirmed) {
      } else {
        console.log('Omitir productos existentes');
      }
    });
  }
 
  resetearEstado(): void {
    this.dosificacion = {};
    this.productos = [];
    this.busqueda = '';
    this.productosFiltrados = [];
    this.dosificaciones = [];
    this.comprobandoDosificaciones = false;
    this.actualizandoDosificaciones = false;
    this.procesoCompleto = false;
    this.mostrarAlertaDosificacion = false;
    this.dosificacionesCreadas = 0;

    // Limpia el input del archivo cargado
    const inputFile = document.getElementById('formFileSm') as HTMLInputElement;
    if (inputFile) {
      inputFile.value = ''; // Resetea el valor del input
    }
  }
}
