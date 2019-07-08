import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareLessonModal } from './share-lesson.modal';

describe('ShareLessonModal', () => {
  let component: ShareLessonModal;
  let fixture: ComponentFixture<ShareLessonModal>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareLessonModal ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareLessonModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
