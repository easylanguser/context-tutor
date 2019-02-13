import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLessonPage } from './edit-lesson.page';

describe('EditLessonPage', () => {
  let component: EditLessonPage;
  let fixture: ComponentFixture<EditLessonPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLessonPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLessonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
