import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planta3Component } from './planta-3.component';

describe('Planta3Component', () => {
  let component: Planta3Component;
  let fixture: ComponentFixture<Planta3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Planta3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planta3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
