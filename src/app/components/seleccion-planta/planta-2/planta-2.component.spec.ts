import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planta2Component } from './planta-2.component';

describe('Planta2Component', () => {
  let component: Planta2Component;
  let fixture: ComponentFixture<Planta2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Planta2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planta2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
