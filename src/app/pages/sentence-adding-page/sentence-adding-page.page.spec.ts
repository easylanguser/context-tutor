import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentenceAddingPagePage } from './sentence-adding-page.page';

describe('SentenceAddingPagePage', () => {
  let component: SentenceAddingPagePage;
  let fixture: ComponentFixture<SentenceAddingPagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentenceAddingPagePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentenceAddingPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
