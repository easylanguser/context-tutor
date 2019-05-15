import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLessonTitlePage } from './edit-lesson-title.page';

describe('EditLessonTitlePage', () => {
  let component: EditLessonTitlePage;
  let fixture: ComponentFixture<EditLessonTitlePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLessonTitlePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLessonTitlePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
