import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DutyPeriodDetailComponent } from './duty-period-detail.component';

describe('DutyPeriodDetailComponent', () => {
  let component: DutyPeriodDetailComponent;
  let fixture: ComponentFixture<DutyPeriodDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DutyPeriodDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DutyPeriodDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
