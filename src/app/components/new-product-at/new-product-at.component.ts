import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-product-at',
  templateUrl: './new-product-at.component.html',
  styleUrls: ['./new-product-at.component.css'],
})
export class NewProductAtComponent implements OnInit {
  productoForm: FormGroup;
  familias: number[] = [];
  familiasNuevas: number[] = []; // Para las nuevas familias
  numeroFormula: number | undefined;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.productoForm = this.fb.group({
      familia: [''], // Valor inicial para la familia
      nomenclatura: [''], // Valor inicial para la nomenclatura
      nuevaFamilia: [false], // Inicialmente no hay nueva familia
      familiaSeleccionada: [''], // Para la nueva familia seleccionada
    });
  }

  ngOnInit(): void {
    this.cargarFamilias();
  }

  cargarFamilias(): void {
    this.apiService.getFamilias().subscribe(
      (data) => {
        this.familias = data;
        // Si no hay familias, agregar 1000 a la lista
        if (this.familias.length === 0) {
          this.familias.push(1000);
        }
        this.cargarFamiliasNuevas();
      },
      (error) => {
        console.error('Error al cargar las familias', error);
      }
    );
  }

  cargarFamiliasNuevas(): void {
    // Crear un rango amplio de familias (puedes ajustar según tus necesidades)
    const rangoCompleto = Array.from(
      { length: (80000 - 2000) / 1000 + 1 },
      (_, i) => 2000 + i * 1000
    );

    // Filtrar las familias nuevas que no están en las familias existentes
    this.familiasNuevas = rangoCompleto.filter(
      (familia) => !this.familias.includes(familia)
    );
  }


  onFamiliaChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const familiaId = Number(selectElement.value);

    if (!isNaN(familiaId)) {
      this.productoForm.patchValue({ familia: familiaId });

      // Comprobar si la familia está dentro del rango de consulta
      if (familiaId >= 1000 && familiaId <= 25000) {
        // Consulta al último número de fórmula para esta familia
        this.apiService.getUltimoNumeroFormula(familiaId).subscribe(
          (numero) => {
            this.numeroFormula = numero; // Asignar el siguiente número de fórmula
          },
          (error) => {
            console.error('Error al obtener el número de fórmula', error);
            this.numeroFormula = undefined; // Reseteo en caso de error
          }
        );
      }
    }
  }

  onNuevaFamiliaChange(event: Event): void {
    const checkboxElement = event.target as HTMLInputElement;
    if (checkboxElement.checked) {
      // Resetear el control de familia seleccionada si se marca el checkbox
      this.productoForm.patchValue({ familiaSeleccionada: '' });
      this.productoForm.get('familia')?.disable(); // Deshabilitar el control de familia
    } else {
      this.productoForm.get('familia')?.enable(); // Habilitar el control de familia si no está marcado
    }
  }

  onNuevaFamiliaSeleccionadaChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const familiaSeleccionada = Number(selectElement.value);
    if (!isNaN(familiaSeleccionada)) {
      this.apiService.getUltimoNumeroFormula(familiaSeleccionada).subscribe(
        (numero) => {
          this.numeroFormula = numero;
        },
        (error) => {
          console.error('Error al obtener el número de fórmula', error);
        }
      );
    }
  }

  guardarProducto(): void {
    // Verificar si el formulario es inválido o si numeroFormula no está definido
    if (this.productoForm.invalid || this.numeroFormula === undefined) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario inválido',
        text:
          this.numeroFormula === undefined
            ? 'El número de fórmula no está disponible. Selecciona una familia válida.'
            : 'Por favor, completa todos los campos requeridos.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    const familia = this.productoForm.value.nuevaFamilia
      ? this.productoForm.value.familiaSeleccionada
      : this.productoForm.value.familia;

    // Crear el nuevo producto, asegurando que numeroFormula sea un número
    const nuevoProducto = {
      idProducto: 0, // O `null`, si lo prefieres
      familia: familia,
      descripcionATecnica: this.productoForm.value.nomenclatura,
      numeroFormula: this.numeroFormula, // Este valor debe estar definido aquí
    };

    console.log('Nuevo producto a guardar:', nuevoProducto);

    this.apiService.createProducto(nuevoProducto).subscribe(
      () => {
        // Agregar nueva familia si es necesario
        if (this.productoForm.value.nuevaFamilia) {
          const nuevaFamilia = this.productoForm.value.familiaSeleccionada;
          if (!this.familias.includes(nuevaFamilia)) {
            this.familias.push(nuevaFamilia);
          }
        }

        // Habilitar de nuevo el control de familia
        this.productoForm.get('familia')?.enable();

        Swal.fire({
          icon: 'success',
          title: 'Producto guardado',
          text: 'El producto se ha guardado correctamente.',
          confirmButtonText: 'Aceptar',
        });
        this.productoForm.reset();
        this.numeroFormula = undefined; // Resetea el número de fórmula después de guardar
      },
      (error) => {
        console.error('Error al guardar el producto', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al guardar el producto',
          text:
            'No se pudo guardar el producto: ' +
            (error.error || 'Error desconocido'),
          confirmButtonText: 'Aceptar',
        });
      }
    );
  }

  resetearFormulario(): void {
    this.productoForm.reset({
      familia: '',
      nuevaFamilia: false,
      familiaSeleccionada: '',
      nomenclatura: '',
      numeroFormula: this.numeroFormula || '' // Valor inicial o vacío
    });
  }



}
