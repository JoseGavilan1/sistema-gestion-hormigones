import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantaTaltalComponent } from './planta-taltal.component';

describe('Planta1Component', () => {
  let component: PlantaTaltalComponent;
  let fixture: ComponentFixture<PlantaTaltalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlantaTaltalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantaTaltalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
