import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CosteoProductoComponent } from './costeo-producto.component';

describe('CosteoProductoComponent', () => {
  let component: CosteoProductoComponent;
  let fixture: ComponentFixture<CosteoProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CosteoProductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CosteoProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
