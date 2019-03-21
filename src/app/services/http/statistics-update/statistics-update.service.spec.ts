import { TestBed } from '@angular/core/testing';

import { StatisticsUpdateService } from './statistics-update.service';

describe('StatisticsUpdateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StatisticsUpdateService = TestBed.get(StatisticsUpdateService);
    expect(service).toBeTruthy();
  });
});
