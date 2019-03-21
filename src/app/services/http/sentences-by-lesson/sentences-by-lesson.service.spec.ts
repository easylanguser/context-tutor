import { TestBed } from '@angular/core/testing';

import { SentencesByLessonService } from './sentences-by-lesson.service';

describe('SentencesByLessonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SentencesByLessonService = TestBed.get(SentencesByLessonService);
    expect(service).toBeTruthy();
  });
});
