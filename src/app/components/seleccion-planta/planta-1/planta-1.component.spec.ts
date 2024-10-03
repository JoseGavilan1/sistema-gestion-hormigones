import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planta1Component } from './planta-1.component';

describe('Planta1Component', () => {
  let component: Planta1Component;
  let fixture: ComponentFixture<Planta1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Planta1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planta1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
