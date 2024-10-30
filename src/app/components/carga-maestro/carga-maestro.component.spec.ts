import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargaMaestroComponent } from './carga-maestro.component';

describe('CargaMaestroComponent', () => {
  let component: CargaMaestroComponent;
  let fixture: ComponentFixture<CargaMaestroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CargaMaestroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargaMaestroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
