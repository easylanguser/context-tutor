import { TestBed } from '@angular/core/testing';

import { AddSentenceService } from './add-sentence.service';

describe('AddSentenceService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: AddSentenceService = TestBed.get(AddSentenceService);
		expect(service).toBeTruthy();
	});
});
