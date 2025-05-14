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

@Component({
  selector: 'app-add-car',
  imports: [NgIf, NgClass, NgFor, ReactiveFormsModule],
  templateUrl: './add-car.component.html',
  styleUrls: ['./add-car.component.css'],
})
export class AddCarComponent implements OnInit {
  carForm!: FormGroup;
  submitted = false;
  currentYear = new Date().getFullYear();
  previewUrls: string[] = [];

  readonly MAX_IMAGE_SIZE = 3 * 1024 * 1024;
  readonly MAX_IMAGE_COUNT = 10;

  constructor(
    private formBuilder: FormBuilder,
    private carService: CarsService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
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
      color: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
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

    // Создаем FormData для отправки
    const formData = new FormData();

    // Добавляем простые поля
    const formValue = this.carForm.value;
    Object.keys(formValue).forEach((key) => {
      if (key !== 'images') {
        formData.append(key, formValue[key]);
      }
    });

    // Добавляем файлы
    const imageFiles: File[] = this.carForm.get('images')?.value || [];
    imageFiles.forEach((file, index) => {
      formData.append('image[]', file);
      // или formData.append(`images[${index}]`, file, file.name);
      // в зависимости от ожидаемого формата сервера
    });

    // Теперь можно отправлять formData
    this.carService.addCar(formData).subscribe({
      next: (response) => {
        alert('Автомобиль успешно добавлен!');
        this.onReset();
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
