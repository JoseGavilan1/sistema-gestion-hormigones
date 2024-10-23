import { Component } from '@angular/core';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-planta-mejillones',
  templateUrl: './planta-mejillones.component.html',
  styleUrl: './planta-mejillones.component.css'
})
export class PlantaMejillonesComponent {
  materiasPrimas: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getMateriasPrimasMejillones().subscribe((data: any[]) => {
      this.materiasPrimas = data;
    });
  }
}
