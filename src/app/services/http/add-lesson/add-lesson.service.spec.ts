import { TestBed } from '@angular/core/testing';

import { AddLessonService } from './add-lesson.service';

describe('AddLessonService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: AddLessonService = TestBed.get(AddLessonService);
		expect(service).toBeTruthy();
	});
});
