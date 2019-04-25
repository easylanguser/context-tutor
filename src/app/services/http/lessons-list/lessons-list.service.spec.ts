import { TestBed } from '@angular/core/testing';

import { LessonsListService } from './lessons-list.service';

describe('LessonsListService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: LessonsListService = TestBed.get(LessonsListService);
		expect(service).toBeTruthy();
	});
});
