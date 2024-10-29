import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewProductAtComponent } from './new-product-at.component';

describe('NewProductAtComponent', () => {
  let component: NewProductAtComponent;
  let fixture: ComponentFixture<NewProductAtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewProductAtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewProductAtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
