import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CosteoProductoMejillonesComponent } from './costeo-producto-mejillones.component';

describe('CosteoProductoMejillonesComponent', () => {
  let component: CosteoProductoMejillonesComponent;
  let fixture: ComponentFixture<CosteoProductoMejillonesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CosteoProductoMejillonesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CosteoProductoMejillonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
