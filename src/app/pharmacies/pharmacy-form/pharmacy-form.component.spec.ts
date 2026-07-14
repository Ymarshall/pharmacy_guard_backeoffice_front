import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyFormComponent } from './pharmacy-form.component';

describe('PharmacyFormComponent', () => {
  let component: PharmacyFormComponent;
  let fixture: ComponentFixture<PharmacyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
