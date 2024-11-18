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
  mostrarAlertaDosificacion: boolean = false; // Añadir esta línea
  dosificaciones: Dosificacion[] = [];
  dosificacionesCreadas = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.productosFiltrados = [...this.productos];
    this.cargarDosificaciones();
  }

  cargarDosificaciones() {
    this.apiService.getDosificacionByProducto(this.dosificacion.idProducto).subscribe(
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

    console.log('Productos cargados:', this.productos); // Verifica que todos los productos se han cargado
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

    // Reemplazamos Promise.all por un for loop para insertar de manera secuencial
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
      title: 'Insertando o actualizando dosificaciones...',
      html: `<div class="custom-spinner"></div><br><span class="loading-text">Por favor, espere...</span>`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      customClass: { popup: 'custom-popup' },
    });

    let creadasCorrectamente = 0;
    let actualizadasCorrectamente = 0;
    let omitidas = 0;

    // Usamos un for loop para insertar las dosificaciones de manera secuencial
    for (const dosificacion of this.dosificaciones) {
      console.log('Enviando dosificación:', dosificacion); // Depuración: Verifica qué dosificación se está enviando

      try {
        // Validar y asignar valores predeterminados para campos opcionales
        dosificacion.cemento = dosificacion.cemento ?? 0;
        dosificacion.aguaTotal = dosificacion.aguaTotal ?? 0;
        dosificacion.arena = dosificacion.arena ?? 0;
        dosificacion.gravilla = dosificacion.gravilla ?? 0;
        dosificacion.aditivo1 = dosificacion.aditivo1 ?? 0;
        dosificacion.aditivo2 = dosificacion.aditivo2 ?? 0;
        dosificacion.aditivo3 = dosificacion.aditivo3 ?? 0;
        dosificacion.aditivo4 = dosificacion.aditivo4 ?? 0;
        dosificacion.aditivo5 = dosificacion.aditivo5 ?? 0;
        dosificacion.descripcion = dosificacion.descripcion ?? ''; // Descripción no puede ser undefined
        dosificacion.idPlanta = dosificacion.idPlanta ?? 1;
        dosificacion.idProducto = dosificacion.idProducto ?? 0;

        // Verificar si el objeto `producto` está correctamente estructurado
        const producto = {
          numeroFormula: dosificacion.idProducto, // Asegúrate de usar los valores correctos
          familia: 0, // Si es necesario asignar familia aquí
          descripcionATecnica: dosificacion.descripcion, // Asegúrate de pasar la descripción correcta
          insertDate: new Date().toISOString(), // Asignar la fecha actual si es necesario
        };

        // Construir el objeto para el `POST` en el formato correcto
        const dosificacionPayload = {
          idDosificacion: dosificacion.idDosificacion ?? 0,
          idProducto: dosificacion.idProducto,
          cemento: dosificacion.cemento,
          aguaTotal: dosificacion.aguaTotal,
          arena: dosificacion.arena,
          gravilla: dosificacion.gravilla,
          aditivo1: dosificacion.aditivo1,
          aditivo2: dosificacion.aditivo2,
          aditivo3: dosificacion.aditivo3,
          aditivo4: dosificacion.aditivo4,
          aditivo5: dosificacion.aditivo5,
          nombreAditivo2: dosificacion.nombreAditivo2 ?? 'string',
          nombreAditivo3: dosificacion.nombreAditivo3 ?? 'string',
          nombreAditivo4: dosificacion.nombreAditivo4 ?? 'string',
          nombreAditivo5: dosificacion.nombreAditivo5 ?? 'string',
          descripcion: dosificacion.descripcion ?? 'string',
          idPlanta: dosificacion.idPlanta,
          producto: producto, // Asegúrate de incluir el objeto `producto` con todos los campos
        };

        // Realizar la solicitud POST
        await this.apiService.createDosificacion(dosificacionPayload).toPromise();
        creadasCorrectamente++;
      } catch (error: unknown) {
        console.error('Error al insertar dosificación:', error);
        omitidas++;
      }
    }

    Swal.close();

    // Mostrar el resultado final
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
