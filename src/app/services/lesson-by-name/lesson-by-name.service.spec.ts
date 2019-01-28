import { TestBed } from '@angular/core/testing';

import { LessonByNameService } from './lesson-by-name.service';

describe('LessonByNameService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LessonByNameService = TestBed.get(LessonByNameService);
    expect(service).toBeTruthy();
  });
});
