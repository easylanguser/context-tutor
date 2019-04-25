import { TestBed } from '@angular/core/testing';

import { AddLessonFileService } from './add-lesson-file.service';

describe('AddLessonFileService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: AddLessonFileService = TestBed.get(AddLessonFileService);
		expect(service).toBeTruthy();
	});
});
