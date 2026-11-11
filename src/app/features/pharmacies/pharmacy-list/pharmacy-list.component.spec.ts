import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyListComponent } from './pharmacy-list.component';
import { pageProviders } from '../../../testing/page-providers';

describe('PharmacyListComponent', () => {
  let fixture: ComponentFixture<PharmacyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyListComponent],
      providers: pageProviders
    }).compileComponents();
    fixture = TestBed.createComponent(PharmacyListComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
