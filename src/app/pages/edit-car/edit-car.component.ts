import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CarsService } from '../../services/cars.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-car',
  imports: [NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './edit-car.component.html',
  styleUrl: './edit-car.component.css'
})
export class EditCarComponent {
  id: any = '';
  car: any = {};
  carForm!: FormGroup;
  submitted = false;
  currentYear = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private carService: CarsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    window.scrollTo(0, 0);
    this.initializeForm();
    
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      await this.carService.getCarDetails(this.id).subscribe(
        (res: any) => {
          this.car = res.data;
          this.carForm.patchValue(this.car)
        },
        (err: any) => {
          console.error(err);
        }
      );
    }
  }

  initializeForm(): void {
    this.carForm = this.formBuilder.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: [
        '',
        [
          Validators.required,
          Validators.min(1900),
          Validators.max(this.currentYear),
        ],
      ],
      engine: ['', Validators.required],
      transmission: ['', Validators.required],
      mileage: ['', [Validators.required, Validators.min(0)]],
      fuelType: ['', Validators.required],
      horsepower: [''],
      country: [''],
      driveType: [''],
      bodyType: [''],
      color: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
    });
  }

  get f() {
    return this.carForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.carForm.invalid) {
      return;
    }

    const formData = new FormData();

    const formValue = this.carForm.value;
    Object.keys(formValue).forEach((key) => {
        formData.append(key, formValue[key]);
    });

    this.carService.editCarData(this.car._id, this.carForm.value).subscribe({
      next: (response) => {
        alert('Автомобиль успешно изменен!');
        this.onReset();
        this.router.navigate(['/car', this.car._id])
      },
      error: (err) => {
        console.error('Ошибка при изменении автомобиля:', err);
        alert(err.error.message ||'Произошла ошибка при изменении автомобиля');
      },
    });
  }

  onReset(): void {
    this.submitted = false;
    this.carForm.patchValue(this.car)
  }
}
