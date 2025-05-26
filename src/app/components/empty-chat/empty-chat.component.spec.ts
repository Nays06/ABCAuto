import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyChatComponent } from './empty-chat.component';

describe('EmptyChatComponent', () => {
  let component: EmptyChatComponent;
  let fixture: ComponentFixture<EmptyChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptyChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
