import { TestBed } from '@angular/core/testing';
import { LessonsDataService } from './lessons-data.service';

describe('LessonsDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LessonsDataService = TestBed.get(LessonsDataService);
    expect(service).toBeTruthy();
  });
});
