import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedLessonsListModal } from './shared-lessons-list.modal';

describe('SharedLessonsListComponent', () => {
  let component: SharedLessonsListModal;
  let fixture: ComponentFixture<SharedLessonsListModal>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedLessonsListModal ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedLessonsListModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
