import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DutyListComponent } from './duty-list.component';

describe('DutyListComponent', () => {
  let component: DutyListComponent;
  let fixture: ComponentFixture<DutyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DutyListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DutyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
