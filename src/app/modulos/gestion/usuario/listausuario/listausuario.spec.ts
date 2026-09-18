import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listausuario } from './listausuario';

describe('Listausuario', () => {
  let component: Listausuario;
  let fixture: ComponentFixture<Listausuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listausuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listausuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
