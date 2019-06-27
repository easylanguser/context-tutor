import { TestBed } from '@angular/core/testing';

import { StatisticHttpService } from './statistic-http.service';

describe('StatisticHttpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StatisticHttpService = TestBed.get(StatisticHttpService);
    expect(service).toBeTruthy();
  });
});
