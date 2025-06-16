import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent {
  // Almacenamos los productos extraídos del archivo
  products: any[] = [];

  constructor(private apiService: ApiService) {}

  // Método para manejar la carga del archivo Excel
  onFileChange(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];  // Leer la primera hoja
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });  // Convertir la hoja a JSON

      this.processData(jsonData);
    };

    reader.readAsBinaryString(file);
  }

  // Procesar los datos extraídos del Excel
  processData(data: any): void {
  this.products = data.map((row: any) => {
    const productNumber = row[1];  // Asegúrate de que esta columna contenga el número de producto
    let nombreComercial = row[3];  // Asegúrate de que esta columna contenga el nombre comercial

    // Validación básica
    if (!productNumber || !nombreComercial) {
      alert('Datos incompletos en el archivo Excel.');
      return null;
    }

    // Si nombreComercial es nulo o vacío, asignamos un valor predeterminado
    if (!nombreComercial) {
      nombreComercial = "Sin nombre comercial"; // O cualquier valor predeterminado
    }

    return { productNumber, nombreComercial };  // Almacenar los productos válidos
  }).filter((product: null) => product !== null);  // Filtrar productos inválidos

  console.log('Datos procesados', this.products);  // Para revisar si los datos son correctos
}



  // Método que se ejecuta al hacer clic en el botón de carga
  onUpload(): void {
  if (this.products.length === 0) {
    alert('No hay datos para cargar. Asegúrate de cargar un archivo Excel primero.');
    return;
  }

  // Filtrar los productos que existen en la base de datos
  this.apiService.getProductoByNumeroFormula(this.products[0].productNumber).subscribe(product => {
    // Solo proceder con aquellos productos que existen en la base de datos
    const validProducts = this.products.filter(p => {
      return product && product.numeroFormula === p.productNumber;
    });
    this.updateProducts(validProducts);
  });
}

  // Actualizar los productos en la base de datos a través de la API
  updateProducts(products: any[]): void {
  products.forEach(product => {
    this.apiService.updateProductDescription(product.productNumber, product.nombreComercial)
      .subscribe(
        response => {
          console.log('Producto actualizado:', response);
          alert(`Producto con número de fórmula ${product.productNumber} actualizado correctamente.`);
        },
        error => {
          console.error('Error al actualizar producto:', error);
          alert('Ocurrió un error al actualizar algunos productos.');
        }
      );
  });
}

}
