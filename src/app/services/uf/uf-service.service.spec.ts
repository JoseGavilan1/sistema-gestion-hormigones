import { TestBed } from '@angular/core/testing';

import { UfServiceService } from './uf-service.service';

describe('UfServiceService', () => {
  let service: UfServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UfServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
