import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsEmptyComponent } from './cars-empty.component';

describe('CarsEmptyComponent', () => {
  let component: CarsEmptyComponent;
  let fixture: ComponentFixture<CarsEmptyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsEmptyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarsEmptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
