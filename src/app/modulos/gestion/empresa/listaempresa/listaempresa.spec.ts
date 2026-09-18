import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listaempresa } from './listaempresa';

describe('Listaempresa', () => {
  let component: Listaempresa;
  let fixture: ComponentFixture<Listaempresa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listaempresa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listaempresa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
