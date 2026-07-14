import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DutyPeriodListComponent } from './duty-period-list.component';

describe('DutyPeriodListComponent', () => {
  let component: DutyPeriodListComponent;
  let fixture: ComponentFixture<DutyPeriodListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DutyPeriodListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DutyPeriodListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
