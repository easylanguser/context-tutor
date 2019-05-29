import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentenceAddingPage } from './sentence-adding.page';

describe('SentenceAddingPage', () => {
  let component: SentenceAddingPage;
  let fixture: ComponentFixture<SentenceAddingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentenceAddingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentenceAddingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
