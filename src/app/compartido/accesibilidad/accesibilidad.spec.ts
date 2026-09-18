import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Accesibilidad } from './accesibilidad';

describe('Accesibilidad', () => {
  let component: Accesibilidad;
  let fixture: ComponentFixture<Accesibilidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accesibilidad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Accesibilidad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
