import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareAddingChoicePage } from './share-adding-choice.page';

describe('ShareAddingChoicePage', () => {
  let component: ShareAddingChoicePage;
  let fixture: ComponentFixture<ShareAddingChoicePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareAddingChoicePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareAddingChoicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
