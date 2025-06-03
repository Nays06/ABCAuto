import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompilationComponent } from './compilation.component';

describe('CompilationComponent', () => {
  let component: CompilationComponent;
  let fixture: ComponentFixture<CompilationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompilationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompilationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
