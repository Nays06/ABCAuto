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
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-edit-car',
  imports: [NgIf, NgClass, ReactiveFormsModule, NgSelectComponent],
  templateUrl: './edit-car.component.html',
  styleUrl: './edit-car.component.css',
})
export class EditCarComponent {
  id: any = '';
  car: any = {};
  carForm!: FormGroup;
  submitted = false;
  currentYear = new Date().getFullYear();
  transmissionTypes = [
    { id: 1, name: 'Automatic' },
    { id: 2, name: 'Manual' },
    { id: 3, name: 'CVT' },
    { id: 4, name: 'Single-Speed' },
    { id: 5, name: 'Dual Clutch' },
    { id: 6, name: 'Automated Manual' },
    { id: 7, name: 'Multitronic' },
  ];
  driveTypes = [
    { name: 'AWD' },
    { name: 'FWD' },
    { name: '4WD' },
    { name: 'RWD' },
  ];
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
  colors = [
    { id: 1, name: 'Белый' },
    { id: 2, name: 'Чёрный' },
    { id: 3, name: 'Серебристый' },
    { id: 4, name: 'Серый' },
    { id: 5, name: 'Красный' },
    { id: 6, name: 'Синий' },
    { id: 7, name: 'Голубой' },
    { id: 8, name: 'Зелёный' },
    { id: 9, name: 'Коричневый' },
    { id: 10, name: 'Жёлтый' },
    { id: 11, name: 'Оранжевый' },
    { id: 12, name: 'Бежевый' },
  ];
  countries = [
    { id: 1, name: 'Россия' },
    { id: 2, name: 'Германия' },
    { id: 3, name: 'Япония' },
    { id: 4, name: 'США' },
    { id: 5, name: 'Китай' },
    { id: 6, name: 'Корея' },
    { id: 7, name: 'Франция' },
    { id: 8, name: 'Италия' },
    { id: 9, name: 'Великобритания' },
    { id: 10, name: 'Швеция' },
  ];
  engines = [
    { id: 1, name: 'Electric' },

    { id: 2, name: '1.0L Turbo I3' },
    { id: 3, name: '1.2L Turbo I4' },
    { id: 4, name: '1.3L Turbo I4' },
    { id: 5, name: '1.4L Turbo I4' },
    { id: 6, name: '1.5L I4' },
    { id: 7, name: '1.5L Turbo I4' },
    { id: 8, name: '1.6L I4' },
    { id: 9, name: '1.6L Turbo I4' },
    { id: 10, name: '1.8L Turbo I4' },
    { id: 11, name: '2.0L I4' },
    { id: 12, name: '2.0L Turbo I4' },
    { id: 13, name: '2.4L Turbo I4' },
    { id: 14, name: '2.5L I4' },
    { id: 15, name: '2.5L Turbo I4' },
    { id: 16, name: '2.7L I4' },

    { id: 17, name: '3.0L I6' },
    { id: 18, name: '3.0L Turbo I6' },
    { id: 19, name: '3.5L V6' },
    { id: 20, name: '3.5L Twin-Turbo V6' },
    { id: 21, name: '3.6L V6' },
    { id: 22, name: '3.8L Twin-Turbo V6' },

    { id: 23, name: '4.0L Twin-Turbo V8' },
    { id: 24, name: '5.0L V8' },
    { id: 25, name: '5.0L Twin-Turbo V8' },
    { id: 26, name: '5.3L V8' },
    { id: 27, name: '5.6L V8' },
    { id: 28, name: '5.7L V8' },
    { id: 29, name: '6.2L V8' },

    { id: 30, name: '5.2L V10' },
    { id: 31, name: '6.0L Twin-Turbo V12' },
    { id: 32, name: '6.7L V12' },
    { id: 33, name: '8.0L Quad-Turbo W16' },

    { id: 34, name: '2.2L I4 Diesel' },
    { id: 35, name: '3.0L V6 Diesel' },

    { id: 36, name: '1.8L I4 Hybrid' },
    { id: 37, name: '1.5L Turbo I4 Hybrid (PHEV)' },
  ];
  years = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => ({
    id: i,
    name: (1900 + i).toString(),
  })).reverse();
  fuelTypes = [
    { name: 'Бензин' },
    { name: 'Дизель' },
    { name: 'Гибрид' },
    { name: 'Электрический' },
    { name: 'Газ' },
  ];

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
          this.car = res.carData;
          this.carForm.patchValue(this.car);
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

    const selectFields = [
      'year',
      'engine',
      'transmission',
      'fuelType',
      'country',
      'driveType',
      'bodyType',
      'color',
    ];

    Object.keys(formValue).forEach((key) => {
      if (
        selectFields.includes(key) &&
        formValue[key] &&
        typeof formValue[key] === 'object'
      ) {
        formData.append(key, formValue[key].name || '');
      } else if (
        key === 'mileage' ||
        key === 'price' ||
        key === 'horsepower'
      ) {
        formData.append(
          key,
          formValue[key] !== null ? formValue[key].toString() : ''
        );
      } else {
        formData.append(key, formValue[key] !== null ? formValue[key] : '');
      }
    });

    console.log(formData)
    console.log(formValue)

    this.carService.editCarData(this.car._id, formData).subscribe({
      next: (response) => {
        alert('Автомобиль успешно изменен!');
        this.onReset();
        this.router.navigate(['/car', this.car._id]);
      },
      error: (err) => {
        console.error('Ошибка при изменении автомобиля:', err);
        alert(
          err.error?.message || 'Произошла ошибка при изменении автомобиля'
        );
      },
    });
  }

  onReset(): void {
    this.submitted = false;
    this.carForm.patchValue(this.car);
  }
}
