import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantaMejillonesComponent } from './planta-mejillones.component';

describe('PlantaMejillonesComponent', () => {
  let component: PlantaMejillonesComponent;
  let fixture: ComponentFixture<PlantaMejillonesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlantaMejillonesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantaMejillonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
