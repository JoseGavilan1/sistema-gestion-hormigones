import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MateriaPrima } from '../../models/materia-prima.model';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-editar-precios-materias-primas',
  templateUrl: './editar-precios-materias-primas.component.html',
  styleUrls: ['./editar-precios-materias-primas.component.css'],
})
export class EditarPreciosMateriasPrimasComponent implements OnInit {
  materiasPrimas: MateriaPrima[] = [];
  selectedPlanta: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.selectedPlanta = this.route.snapshot.paramMap.get('planta') || '';

    if (history.state && history.state.materiasPrimas) {
      this.materiasPrimas = history.state.materiasPrimas;
    } else {
      this.apiService.getMateriasPrimas(this.selectedPlanta).subscribe(
        (data: MateriaPrima[]) =>
          (this.materiasPrimas = data.map((mp) => ({
            ...mp,
            precio: mp.precio, // Asegúrate de que precio sea un número
          })) as MateriaPrima[]), // Añade el tipo aquí
        (error) => console.error('Error al cargar materias primas:', error)
      );
    }
  }

  guardarCambios(): void {
    // Asegúrate de que `precio` sea un número
    this.materiasPrimas.forEach(mp => {
      // Solo convierte si precio puede ser una cadena (si es que viene de un input)
      if (typeof mp.precio === 'string') {
        mp.precio = parseFloat(mp.precio); // Convertir a número si es necesario
      }
    });

    this.apiService.actualizarPrecios(this.selectedPlanta, this.materiasPrimas).subscribe(
      response => {
        console.log('Precios actualizados:', response);
        this.router.navigate(['/']);  // Vuelve a la tabla después de guardar
      },
      error => console.error('Error al guardar cambios:', error)
    );
  }

  cancelar(): void {
    this.router.navigate(['/materias-primas'], {
      state: { planta: this.selectedPlanta },
    });
  }
}
