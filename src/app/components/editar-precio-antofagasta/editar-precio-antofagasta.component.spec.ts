import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPrecioAntofagastaComponent } from './editar-precio-antofagasta.component';

describe('EditarPrecioAntofagastaComponent', () => {
  let component: EditarPrecioAntofagastaComponent;
  let fixture: ComponentFixture<EditarPrecioAntofagastaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarPrecioAntofagastaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPrecioAntofagastaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
