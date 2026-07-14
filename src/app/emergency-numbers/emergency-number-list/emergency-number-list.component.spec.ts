import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyNumberListComponent } from './emergency-number-list.component';

describe('EmergencyNumberListComponent', () => {
  let component: EmergencyNumberListComponent;
  let fixture: ComponentFixture<EmergencyNumberListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergencyNumberListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmergencyNumberListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
