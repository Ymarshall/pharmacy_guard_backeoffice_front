import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DutyProcessDialogComponent } from './duty-process-dialog.component';

describe('DutyProcessDialogComponent', () => {
  let component: DutyProcessDialogComponent;
  let fixture: ComponentFixture<DutyProcessDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DutyProcessDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DutyProcessDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
