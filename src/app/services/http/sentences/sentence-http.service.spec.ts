import { TestBed } from '@angular/core/testing';

import { SentenceHttpService } from './sentence-http.service';

describe('SentenceHttpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SentenceHttpService = TestBed.get(SentenceHttpService);
    expect(service).toBeTruthy();
  });
});
