import { TestBed } from '@angular/core/testing';

import { Loadingservice } from './loadingservice';

describe('Loadingservice', () => {
  let service: Loadingservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Loadingservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
