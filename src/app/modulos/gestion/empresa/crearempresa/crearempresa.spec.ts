import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Crearempresa } from './crearempresa';

describe('Crearempresa', () => {
  let component: Crearempresa;
  let fixture: ComponentFixture<Crearempresa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Crearempresa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Crearempresa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
