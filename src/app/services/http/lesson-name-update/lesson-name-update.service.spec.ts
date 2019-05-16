import { TestBed } from '@angular/core/testing';

import { LessonNameUpdateService } from './lesson-name-update.service';

describe('LessonNameUpdateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LessonNameUpdateService = TestBed.get(LessonNameUpdateService);
    expect(service).toBeTruthy();
  });
});
