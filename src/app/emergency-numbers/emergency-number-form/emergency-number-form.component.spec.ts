import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyNumberFormComponent } from './emergency-number-form.component';

describe('EmergencyNumberFormComponent', () => {
  let component: EmergencyNumberFormComponent;
  let fixture: ComponentFixture<EmergencyNumberFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergencyNumberFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmergencyNumberFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
