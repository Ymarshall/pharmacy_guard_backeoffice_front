import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssuranceFormComponent } from './assurance-form.component';

describe('AssuranceFormComponent', () => {
  let component: AssuranceFormComponent;
  let fixture: ComponentFixture<AssuranceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssuranceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssuranceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
