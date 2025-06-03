import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HackSystemComponent } from './hack-system.component';

describe('HackSystemComponent', () => {
  let component: HackSystemComponent;
  let fixture: ComponentFixture<HackSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HackSystemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HackSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
