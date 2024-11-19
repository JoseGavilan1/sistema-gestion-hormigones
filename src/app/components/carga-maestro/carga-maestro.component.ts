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

  seleccionarPlanta(idPlanta: number) {
    this.planta = idPlanta;
    this.dosificacion.idPlanta = idPlanta;
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
            descripcion: row[11],
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
      title: 'Insertando o actualizando dosificaciones...',
      html: `<div class="custom-spinner"></div><br><span class="loading-text">Por favor, espere...</span>`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      customClass: { popup: 'custom-popup' },
    });

    let creadasCorrectamente = 0;
    let actualizadasCorrectamente = 0;
    let omitidas = 0;

    for (const dosificacion of this.dosificaciones) {
      console.log('Enviando dosificación:', dosificacion);

      try {
        dosificacion.cemento = dosificacion.cemento ?? 0;
        dosificacion.aguaTotal = dosificacion.aguaTotal ?? 0;
        dosificacion.arena = dosificacion.arena ?? 0;
        dosificacion.gravilla = dosificacion.gravilla ?? 0;
        dosificacion.aditivo1 = dosificacion.aditivo1 ?? 0;
        dosificacion.aditivo2 = dosificacion.aditivo2 ?? 0;
        dosificacion.aditivo3 = dosificacion.aditivo3 ?? 0;
        dosificacion.aditivo4 = dosificacion.aditivo4 ?? 0;
        dosificacion.aditivo5 = dosificacion.aditivo5 ?? 0;
        dosificacion.descripcion = dosificacion.descripcion ?? '';
        dosificacion.idPlanta = dosificacion.idPlanta ?? 1;
        dosificacion.idProducto = dosificacion.idProducto ?? 0;

        const producto = {
          numeroFormula: dosificacion.idProducto,
          familia: 0,
          descripcionATecnica: dosificacion.descripcion,
          insertDate: new Date().toISOString(),
        };

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
          producto: producto,
        };

        await this.apiService
          .createDosificacion(dosificacionPayload)
          .toPromise();
        creadasCorrectamente++;
      } catch (error: unknown) {
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
}
