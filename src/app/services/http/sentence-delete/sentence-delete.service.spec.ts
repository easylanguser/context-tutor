import { TestBed } from '@angular/core/testing';

import { SentenceDeleteService } from './sentence-delete.service';

describe('SentenceDeleteService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: SentenceDeleteService = TestBed.get(SentenceDeleteService);
		expect(service).toBeTruthy();
	});
});
