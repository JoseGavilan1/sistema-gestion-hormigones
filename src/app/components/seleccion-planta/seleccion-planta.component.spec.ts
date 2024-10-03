import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionPlantaComponent } from './seleccion-planta.component';

describe('SeleccionPlantaComponent', () => {
  let component: SeleccionPlantaComponent;
  let fixture: ComponentFixture<SeleccionPlantaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeleccionPlantaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionPlantaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
