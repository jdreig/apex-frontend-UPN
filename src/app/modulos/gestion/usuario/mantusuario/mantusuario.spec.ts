import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mantusuario } from './mantusuario';

describe('Mantusuario', () => {
  let component: Mantusuario;
  let fixture: ComponentFixture<Mantusuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mantusuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mantusuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
