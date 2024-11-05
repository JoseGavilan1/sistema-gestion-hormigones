import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../../services/api/api.service';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-carga-maestro',
  templateUrl: './carga-maestro.component.html',
  styleUrls: ['./carga-maestro.component.css']
})
export class CargaMaestroComponent {
  dosificacion: any = {};
  idProducto: number = 1000; // Número de fórmula especificado
  planta: number = 1;
  productos: Producto[] = [];

  constructor(private apiService: ApiService) {}

  seleccionarPlanta(idPlanta: number) {
    this.planta = idPlanta;
    this.dosificacion.IdPlanta = idPlanta;
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

        // Procesar cada fila del Excel y agregar los productos a la lista temporal
        this.crearProductosDesdeExcel(excelData);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  crearProductosDesdeExcel(excelData: any[]) {
    this.productos = []; // Limpiar la lista de productos previamente cargados

    for (let i = 1; i < excelData.length; i++) {
        const fila = excelData[i];
        if (fila.length < 2) continue; // Asegura que haya datos en las columnas necesarias

        const numeroFormula = fila[0];
        const nomenclatura = fila[1];

        // Calcular familia a partir del número de fórmula
        const familia = Math.floor(numeroFormula / 1000) * 1000;

        const producto: Producto = {
          numeroFormula: numeroFormula,
          familia: familia, // Usa el valor calculado
          descripcionATecnica: nomenclatura,
          insertDate: new Date(),
          idProducto: 0
        };

        this.productos.push(producto);
    }
}


  visualizarProductos() {
    if (this.productos.length > 0) {
      console.log("Productos a insertar:", this.productos);
    } else {
      alert("No hay productos cargados para visualizar.");
    }
  }



  extractDosificacionData(excelData: any[]) {
    // Encuentra la fila correspondiente a la fórmula
    const formulaRow = excelData.find(row => row[0] === this.idProducto);
    if (formulaRow) {
      this.dosificacion = {
        IdProducto: formulaRow[0],
        Cemento: formulaRow[2],
        AguaTotal: formulaRow[3],
        Arena: formulaRow[4],
        Gravilla: formulaRow[5],
        Aditivo1: formulaRow[6],
        Aditivo2: formulaRow[7],
        Aditivo3: formulaRow[8],
        Aditivo4: formulaRow[9],
        Aditivo5: formulaRow[10],
        Descripcion: formulaRow[11],
        IdPlanta: this.planta
      };
      this.cargarDosificacion();
    } else {
      alert('La fórmula número ' + this.idProducto + ' no se encuentra en el archivo.');
    }
  }

  cargarDosificacion() {
    this.apiService.obtenerDosificacion(this.dosificacion.IdProducto).subscribe(
      existingDosificacion => {
        if (existingDosificacion) {
          this.actualizarDosificacion(existingDosificacion.idDosificacion);
        } else {
          this.crearDosificacion();
        }
      },
      error => {
        if (error.status === 404) {
          this.crearDosificacion();
        } else {
          alert('Error al verificar la existencia de la dosificación');
        }
      }
    );
  }

  crearDosificacion() {
    this.apiService.crearDosificacion(this.dosificacion).subscribe(
      () => {
        alert('Dosificación creada correctamente');
      },
      error => {
        alert('Error al crear la dosificación');
      }
    );
  }

  actualizarDosificacion(idDosificacion: number) {
    this.apiService.actualizarDosificacion(idDosificacion, this.dosificacion).subscribe(
      () => {
        alert('Dosificación actualizada correctamente');
      },
      error => {
        alert('Error al actualizar la dosificación');
      }
    );
  }

  insertarProductos() {
    this.apiService.createMultipleProductos(this.productos).subscribe(
      () => {
        alert('Productos insertados exitosamente');
        this.productos = []; // Limpia la lista de productos después de la inserción
      },
      (error) => {
        console.error('Error al insertar productos:', error);
        alert('Error al insertar productos');
      }
    );
  }
}
