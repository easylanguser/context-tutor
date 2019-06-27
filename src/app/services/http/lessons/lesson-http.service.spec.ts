import { TestBed } from '@angular/core/testing';

import { LessonHttpService } from './lesson-http.service';

describe('LessonHttpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LessonHttpService = TestBed.get(LessonHttpService);
    expect(service).toBeTruthy();
  });
});
