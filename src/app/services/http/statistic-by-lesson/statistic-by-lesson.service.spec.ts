import { TestBed } from '@angular/core/testing';

import { StatisticByLessonService } from './statistic-by-lesson.service';

describe('StatisticByLessonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StatisticByLessonService = TestBed.get(StatisticByLessonService);
    expect(service).toBeTruthy();
  });
});
