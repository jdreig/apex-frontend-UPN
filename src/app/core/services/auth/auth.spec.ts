import { TestBed } from '@angular/core/testing';

import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should persist and read the user session values correctly', () => {
    service.setUserSession({
      success: true,
      mensaje: 'OK',
      idusuario: 7,
      nombres: 'Ana',
      apellidos: 'García',
      rol: 'Administrador',
      empresa: 'Apex',
      idTipoRol: 1,
    });

    expect(service.getUserId()).toBe(7);
    expect(service.getTipoId()).toBe(1);
    expect(service.getRolId()).toBe(1);
    expect(service.getUser()).toEqual({ nombres: 'Ana', apellidos: 'García' });
  });
});
