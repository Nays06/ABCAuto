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
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-add-car',
  imports: [NgIf, NgClass, NgFor, ReactiveFormsModule, NgSelectModule],
  templateUrl: './add-car.component.html',
  styleUrls: ['./add-car.component.css'],
})
export class AddCarComponent implements OnInit {
  carForm!: FormGroup;
  submitted = false;
  currentYear = new Date().getFullYear();
  previewUrls: string[] = [];
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

  readonly MAX_IMAGE_SIZE = 3 * 1024 * 1024;
  readonly MAX_IMAGE_COUNT = 10;

  constructor(
    private formBuilder: FormBuilder,
    private carService: CarsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.initializeForm();
  }

  initializeForm(): void {
    this.carForm = this.formBuilder.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: [
        null,
        [
          Validators.required,
          Validators.min(1900),
          Validators.max(this.currentYear),
        ],
      ],
      engine: [null, Validators.required],
      transmission: [null, Validators.required],
      mileage: ['', [Validators.required, Validators.min(0)]],
      fuelType: [null, Validators.required],
      horsepower: [''],
      country: [null],
      driveType: [null],
      bodyType: [null],
      color: [null, Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      images: [
        [],
        [
          Validators.required,
          this.imageCountValidator(),
          this.imageSizeValidator(),
        ],
      ],
    });
  }

  private imageCountValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const files = control.value as File[];
      if (files && files.length > this.MAX_IMAGE_COUNT) {
        return { maxImageCount: { value: control.value } };
      }
      return null;
    };
  }

  private imageSizeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const files = control.value as File[];
      if (files) {
        for (const file of files) {
          if (file.size > this.MAX_IMAGE_SIZE) {
            return { maxImageSize: { value: control.value } };
          }
        }
      }
      return null;
    };
  }

  get f() {
    return this.carForm.controls;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length) {
      const files = Array.from(input.files);

      if (files.length > this.MAX_IMAGE_COUNT) {
        this.carForm.get('images')?.setErrors({ maxImageCount: true });
        return;
      }

      for (const file of files) {
        if (file.size > this.MAX_IMAGE_SIZE) {
          this.carForm.get('images')?.setErrors({ maxImageSize: true });
          return;
        }
      }

      this.previewUrls = [];
      this.carForm.patchValue({ images: files });

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.previewUrls.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    this.previewUrls.splice(index, 1);

    const filesControl = this.carForm.get('images');
    if (filesControl) {
      const currentFiles = filesControl.value as File[];
      const newFiles = currentFiles.filter((_, i) => i !== index);
      filesControl.setValue(newFiles);

      if (newFiles.length <= this.MAX_IMAGE_COUNT) {
        const errors = filesControl.errors;
        if (errors && errors['maxImageCount']) {
          delete errors['maxImageCount'];
          filesControl.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
    }
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
      'color'
    ];

    Object.keys(formValue).forEach((key) => {
      if (key !== 'images') {
        if (
          selectFields.includes(key) &&
          formValue[key] &&
          typeof formValue[key] === 'object'
        ) {
          formData.append(key, formValue[key].name);
        } else {
          formData.append(key, formValue[key] !== null ? formValue[key] : '');
        }
      }
    });

    const imageFiles: File[] = this.carForm.get('images')?.value || [];
    imageFiles.forEach((file, index) => {
      formData.append('image[]', file);
    });

    console.log(formValue);
    
    console.log(formData);
    

    this.carService.addCar(formData).subscribe({
      next: (response: any) => {
        alert('Автомобиль успешно добавлен!');
        this.onReset();
        this.router.navigate(['/car', response.car._id]);
      },
      error: (err) => {
        console.error('Ошибка при добавлении автомобиля:', err);
        alert('Произошла ошибка при добавлении автомобиля');
      },
    });
  }

  onReset(): void {
    this.submitted = false;
    this.previewUrls = [];
    this.initializeForm();
  }
}
