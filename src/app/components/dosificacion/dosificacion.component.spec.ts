import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DosificacionComponent } from './dosificacion.component';

describe('DosificacionComponent', () => {
  let component: DosificacionComponent;
  let fixture: ComponentFixture<DosificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DosificacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DosificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
