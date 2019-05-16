import { TestBed } from '@angular/core/testing';

import { SentenceResetService } from './sentence-reset.service';

describe('SentenceResetService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SentenceResetService = TestBed.get(SentenceResetService);
    expect(service).toBeTruthy();
  });
});
