import { TestBed } from '@angular/core/testing';

import { Ticketagenteservice } from './ticketagenteservice';

describe('Ticketagenteservice', () => {
  let service: Ticketagenteservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ticketagenteservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
