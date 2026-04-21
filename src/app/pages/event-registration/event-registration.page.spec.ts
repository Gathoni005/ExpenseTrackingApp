import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventRegistrationPage } from './event-registration.page';

describe('EventRegistrationPage', () => {
  let component: EventRegistrationPage;
  let fixture: ComponentFixture<EventRegistrationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventRegistrationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
