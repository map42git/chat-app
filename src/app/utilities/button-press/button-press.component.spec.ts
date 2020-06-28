import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonPressComponent } from './button-press.component';

describe('ButtonPressComponent', () => {
  let component: ButtonPressComponent;
  let fixture: ComponentFixture<ButtonPressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonPressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonPressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
