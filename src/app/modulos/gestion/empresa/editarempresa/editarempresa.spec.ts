import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Editarempresa } from './editarempresa';

describe('Editarempresa', () => {
  let component: Editarempresa;
  let fixture: ComponentFixture<Editarempresa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Editarempresa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Editarempresa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
