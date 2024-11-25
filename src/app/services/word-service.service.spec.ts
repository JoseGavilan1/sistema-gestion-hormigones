import { TestBed } from '@angular/core/testing';

import { WordServiceService } from './word-service.service';

describe('WordServiceService', () => {
  let service: WordServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WordServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
