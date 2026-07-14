import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DutyVerificationDialogComponent } from './duty-verification-dialog.component';

describe('DutyVerificationDialogComponent', () => {
  let component: DutyVerificationDialogComponent;
  let fixture: ComponentFixture<DutyVerificationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DutyVerificationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DutyVerificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
