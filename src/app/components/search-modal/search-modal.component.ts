import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-search-modal',
  imports: [FormsModule, ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.css',
})
export class SearchModalComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() searchSubmitted = new EventEmitter<string>();

  searchForm: any;

  currentYear = new Date().getFullYear();
  bodyTypes = [
    { name: 'SUV' },
    { name: 'Sedan' },
    { name: 'Coupe' },
    { name: 'Pickup' },
    { name: 'Crossover' },
    { name: 'Hatchback' },
    { name: 'Wagon' },
    { name: 'Van' },
    { name: 'Truck' },
    { name: 'Convertible' },
  ];
  driveTypes = [
    { name: 'AWD' },
    { name: 'FWD' },
    { name: '4WD' },
    { name: 'RWD' },
  ];

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      brand: [''],
      model: [''],
      yearFrom: [
        '',
        [Validators.min(1900), Validators.max(new Date().getFullYear())],
      ],
      yearTo: [
        '',
        [Validators.min(1900), Validators.max(new Date().getFullYear())],
      ],
      priceFrom: ['', Validators.min(0)],
      priceTo: ['', Validators.min(0)],
      fuelType: [''],
      driveType: [''],
      bodyType: [''],
    });

    this.setupCrossFieldValidation();
  }

  @HostListener('document:keydown.escape')
  private setupCrossFieldValidation(): void {
    this.searchForm.get('yearFrom')?.valueChanges.subscribe(() => {
      this.validateYearRange();
    });

    this.searchForm.get('yearTo')?.valueChanges.subscribe(() => {
      this.validateYearRange();
    });

    this.searchForm.get('priceFrom')?.valueChanges.subscribe(() => {
      this.validatePriceRange();
    });

    this.searchForm.get('priceTo')?.valueChanges.subscribe(() => {
      this.validatePriceRange();
    });
  }

  private validateYearRange(): void {
    const yearFrom = this.searchForm.get('yearFrom')?.value;
    const yearTo = this.searchForm.get('yearTo')?.value;
    const yearToControl = this.searchForm.get('yearTo');

    if (yearFrom && yearTo && yearFrom > yearTo) {
      yearToControl?.setErrors({ minYear: true });
    } else {
      if (yearToControl?.errors?.minYear) {
        delete yearToControl.errors.minYear;
        if (Object.keys(yearToControl.errors).length === 0) {
          yearToControl.setErrors(null);
        } else {
          yearToControl.updateValueAndValidity();
        }
      }
    }
  }

  private validatePriceRange(): void {
    const priceFrom = this.searchForm.get('priceFrom')?.value;
    const priceTo = this.searchForm.get('priceTo')?.value;

    if (priceFrom && priceTo && priceFrom > priceTo) {
      this.searchForm.get('priceTo')?.setErrors({ minPrice: true });
    } else {
      this.searchForm.get('priceTo')?.setErrors(null);
    }
  }

  handleEscape() {
    this.close();
  }

  close(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    this.validateYearRange();
    this.validatePriceRange();

    if (this.searchForm.valid) {
      const queryParams = this.buildQueryParams();
      this.searchSubmitted.emit(queryParams);
      this.close();
    } else {
      this.searchForm.markAllAsTouched();
    }
  }

  private buildQueryParams(): string {
    const params = new URLSearchParams();
    const formValue = this.searchForm.value;

    if (formValue.brand) params.append('brand', formValue.brand);
    if (formValue.model) params.append('model', formValue.model);
    if (formValue.yearFrom) params.append('yearFrom', formValue.yearFrom);
    if (formValue.yearTo) params.append('yearTo', formValue.yearTo);

    if (formValue.priceFrom || formValue.priceTo) {
      const priceFrom = formValue.priceFrom || '0';
      const priceTo = formValue.priceTo || '1000000';
      params.append('price', `${priceFrom}-${priceTo}`);
    }

    if (formValue.fuelType) params.append('fuelType', formValue.fuelType);
    if (formValue.driveType) params.append('driveType', formValue.driveType);
    if (formValue.bodyType) params.append('bodyType', formValue.bodyType);

    return params.toString();
  }
}
