import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareAddingChoicePagePage } from './share-adding-choice-page.page';

describe('ShareAddingChoicePagePage', () => {
  let component: ShareAddingChoicePagePage;
  let fixture: ComponentFixture<ShareAddingChoicePagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareAddingChoicePagePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareAddingChoicePagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
