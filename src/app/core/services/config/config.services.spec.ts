import { TestBed } from '@angular/core/testing';

import { ConfigServices } from './config.services';

describe('ConfigServices', () => {
  let service: ConfigServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
