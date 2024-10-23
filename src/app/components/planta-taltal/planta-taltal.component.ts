import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';


@Component({
  selector: 'app-planta-taltal',
  templateUrl: './planta-taltal.component.html',
  styleUrls: ['./planta-taltal.component.css'],
})
export class PlantaTaltalComponent implements OnInit {
  materiasPrimas: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getMateriasPrimasTaltal().subscribe((data: any[]) => {
      this.materiasPrimas = data;
    });
  }
}
