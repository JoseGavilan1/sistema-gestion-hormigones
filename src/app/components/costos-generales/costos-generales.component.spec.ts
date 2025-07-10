import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostosGeneralesComponent } from './costos-generales.component';

describe('CostosGeneralesComponent', () => {
  let component: CostosGeneralesComponent;
  let fixture: ComponentFixture<CostosGeneralesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CostosGeneralesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostosGeneralesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
