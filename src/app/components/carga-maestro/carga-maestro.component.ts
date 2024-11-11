import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../../services/api/api.service';
import { Producto } from '../../models/producto.model';
import Swal from 'sweetalert2';
import { Dosificacion } from '../../models/dosificacion.model';

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
  mostrarAlertaDosificacion: boolean = false; // Añadir esta línea
  dosificaciones: Dosificacion[] = [];
  dosificacionesCreadas = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.productosFiltrados = [...this.productos];
    this.cargarDosificaciones();
  }

  cargarDosificaciones() {
    this.apiService.obtenerDosificacion(this.dosificacion.idProducto).subscribe(
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

  seleccionarPlanta(idPlanta: number) {
    this.planta = idPlanta;
    this.dosificacion.idPlanta = idPlanta; // Asigna el idPlanta a la dosificación
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

        console.log('Productos cargados desde Excel:', excelData); // Verifica que los datos son correctos
        this.crearProductosDesdeExcel(excelData);
        this.crearDosificacionesDesdeExcel(excelData);
        this.productosFiltrados = [...this.productos];
        this.dosificaciones = excelData.slice(1).map((row: any) => {
          return {
            // Esto debe ser asignado correctamente según el producto
            numeroFormula: row[0], // Columna A
            cemento: row[2], // Columna C
            aguaTotal: row[3], // Columna D
            arena: row[4], // Columna E
            gravilla: row[5], // Columna F
            aditivo1: row[6], // Columna G
            aditivo2: row[7], // Columna H
            aditivo3: row[8], // Columna I
            aditivo4: row[9], // Columna J
            aditivo5: row[10], // Columna K
            descripcion: row[11],
            idProducto: row[0], // Asignamos el numeroFormula a idProducto
            idDosificacion: 0, // Columna L
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
  }

  async crearDosificacionesDesdeExcel(excelData: any[]) {
    // Limpiamos las dosificaciones cargadas previamente
    this.dosificacion = [];

    // Iteramos sobre los datos de Excel y preparamos las dosificaciones
    for (let i = 1; i < excelData.length; i++) {
      const fila = excelData[i];
      if (fila.length < 1) continue;

      const producto = this.productos.find((p) => p.numeroFormula === fila[0]);
      if (producto) {
        // Aquí puedes añadir la lógica para crear las dosificaciones
        const dosificacion = {
          idProducto: producto.idProducto,
          numeroFormula: producto.numeroFormula,
          planta: this.planta,
          // Asegúrate de extraer los datos correctos para la dosificación
          // De acuerdo a la estructura del archivo Excel
          cantidad: fila[2] || 0, // Suponiendo que la cantidad esté en la columna 3
          fecha: fila[3] || new Date(), // Suponiendo que la fecha esté en la columna 4
        };

        // Añadimos la dosificación a la lista
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

    const promesas = this.productosFiltrados.map(async (producto) => {
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
    });

    await Promise.all(promesas);
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
      title: 'Insertando o actualizando dosificaciones...',
      html: `<div class="custom-spinner"></div><br><span class="loading-text">Por favor, espere...</span>`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      customClass: { popup: 'custom-popup' },
    });

    let creadasCorrectamente = 0;
    let actualizadasCorrectamente = 0;
    let omitidas = 0;
    let dosificacionesExistentes: any[] = [];

    // Creamos un array de promesas para insertar o actualizar las dosificaciones
    const promesas = this.dosificaciones.map(async (dosificacion) => {
      try {
        // Verificar si la dosificación ya existe
        const existingDosificacion = await this.apiService
          .getDosificacionByProducto(dosificacion.idProducto)
          .toPromise();

        if (existingDosificacion) {
          // Si existe, actualizamos la dosificación
          console.log('Actualizando dosificación:', dosificacion);
          await this.apiService
            .updateDosificacionPorNumeroFormula(
              dosificacion.idProducto,
              dosificacion
            )
            .toPromise();

          actualizadasCorrectamente++; // Contamos como actualizada
        } else {
          // Si no existe, creamos la nueva dosificación
          console.log('Creando dosificación:', dosificacion);
          await this.apiService.createDosificacion(dosificacion).toPromise();
          creadasCorrectamente++;
        }
      } catch (error: any) {
        // Verificamos si el error es un 404 (no encontrado)
        if (error.status === 404) {
          // Si es un 404, es porque la dosificación no existe, entonces la insertamos
          console.log('Dosificación no encontrada, insertando:', dosificacion);
          try {
            await this.apiService.createDosificacion(dosificacion).toPromise();
            creadasCorrectamente++; // Contamos como creada
          } catch (insertError) {
            console.error('Error al insertar dosificación:', insertError);
            omitidas++; // Si ocurre un error al insertar, omitimos
          }
        } else {
          console.error('Error al insertar o actualizar dosificación:', dosificacion, error);
          omitidas++; // Si hay otro error, omitimos
        }
      }
    });

    // Esperamos que todas las promesas se resuelvan
    await Promise.all(promesas);

    Swal.close(); // Cerramos el spinner

    // Si hay dosificaciones existentes, mostramos la alerta de actualización
    if (dosificacionesExistentes.length > 0) {
      await Swal.fire({
        title: 'Algunas dosificaciones ya existen',
        text: 'Las siguientes dosificaciones ya existen en la base de datos. ¿Deseas actualizar estas dosificaciones?',
        icon: 'warning',
        html: dosificacionesExistentes
          .map(
            (d) =>
              `<div>Dosificación para producto ${d.numeroFormula}: ${d.descripcion}</div>`
          )
          .join(''),
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Omitir actualizaciones',
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Si se confirma, se actualizan las dosificaciones
          for (let dosificacion of dosificacionesExistentes) {
            await this.apiService
              .updateDosificacionPorNumeroFormula(
                dosificacion.numeroFormula,
                dosificacion
              )
              .toPromise();
          }
        }
      });
    }

    // Alerta de resumen
    Swal.fire(
      'Finalizado',
      `${creadasCorrectamente} dosificaciones fueron creadas correctamente, ${actualizadasCorrectamente} fueron actualizadas y ${omitidas} omitidas.`,
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
        // Aquí puedes implementar la actualización de las dosificaciones si se confirma
        this.actualizarDosificaciones(dosificaciones);
      } else {
        console.log('Omitir dosificaciones existentes');
      }
    });
  }

  async actualizarDosificaciones(dosificacionesParaActualizar: any[]) {
    // Iterar sobre las dosificaciones proporcionadas y actualizarlas por numeroFormula
    for (const dosificacion of dosificacionesParaActualizar) {
      try {
        // Aquí actualizamos utilizando numeroFormula
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
        // Implementar actualización de productos si se confirma
      } else {
        console.log('Omitir productos existentes');
      }
    });
  }
}
