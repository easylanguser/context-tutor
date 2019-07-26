import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LongPressChooserComponent } from './long-press-chooser.component';

describe('LongPressChooserComponent', () => {
  let component: LongPressChooserComponent;
  let fixture: ComponentFixture<LongPressChooserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LongPressChooserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongPressChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
