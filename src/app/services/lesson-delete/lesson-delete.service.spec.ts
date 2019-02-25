import { TestBed } from '@angular/core/testing';

import { LessonDeleteService } from './lesson-delete.service';

describe('LessonDeleteService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: LessonDeleteService = TestBed.get(LessonDeleteService);
		expect(service).toBeTruthy();
	});
});
