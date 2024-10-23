import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPreciosMateriasPrimasComponent } from './editar-precios-materias-primas.component';

describe('EditarPreciosMateriasPrimasComponent', () => {
  let component: EditarPreciosMateriasPrimasComponent;
  let fixture: ComponentFixture<EditarPreciosMateriasPrimasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarPreciosMateriasPrimasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPreciosMateriasPrimasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
