import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLessonPage } from './add-lesson.page';

describe('AddLessonPage', () => {
	let component: AddLessonPage;
	let fixture: ComponentFixture<AddLessonPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AddLessonPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AddLessonPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
