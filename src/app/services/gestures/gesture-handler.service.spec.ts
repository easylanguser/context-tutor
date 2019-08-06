import { TestBed } from '@angular/core/testing';

import { GestureHandlerService } from './gesture-handler.service';

describe('GestureHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GestureHandlerService = TestBed.get(GestureHandlerService);
    expect(service).toBeTruthy();
  });
});
