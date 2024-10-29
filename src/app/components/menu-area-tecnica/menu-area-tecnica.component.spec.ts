import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuAreaTecnicaComponent } from './menu-area-tecnica.component';

describe('MenuAreaTecnicaComponent', () => {
  let component: MenuAreaTecnicaComponent;
  let fixture: ComponentFixture<MenuAreaTecnicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuAreaTecnicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuAreaTecnicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
