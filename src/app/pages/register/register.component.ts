import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-register',
  imports: [RouterLink, NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  cars: any[] = [];
  emojiCars = [
    '🚗',
    '🚕',
    '🚙',
    '🏎️',
    '🚓',
    '🚚',
    '🚑',
    '🚒',
    '🚛',
    '🚜',
    '🏍️',
    '🛵',
    '🚲',
    '🛴',
    '🚎',
    '🛺',
    '🚌',
    '🚐',
    '🦽',
    '🦼',
    '🚄',
    '🚅',
    '🚂',
    '🛫',
    '🚁',
    '🚀',
    '🛸',
    '🚤',
  ];
  authForm: FormGroup;
  error: string = '';
  regError: string = '';
  fileTouched = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private route: Router, private socketService: SocketService) {
    this.authForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        surname: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        repeatPassword: ['', Validators.required],
        avatar: [null],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  fileValidator(control: AbstractControl): ValidationErrors | null {
    const file = control.value;
    if (!file) return null;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return { invalidType: true };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { invalidSize: true };
    }

    return null;
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const repeatPassword = formGroup.get('repeatPassword')?.value;
    return password === repeatPassword ? null : { mismatch: true };
  }

  onFileSelected(event: Event): void {
    this.fileTouched = true;
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      const control = this.authForm.get('avatar');

      control?.setErrors(null);
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        control?.setErrors({ invalidType: true });
      } else if (file.size > 2 * 1024 * 1024) {
        control?.setErrors({ invalidSize: true });
      } else {
        control?.setValue(file);
      }
    }
  }

  register() {
    this.regError = ""
    if (this.authForm.valid) {
      const formData = new FormData();
      formData.append('name', this.authForm.value.name);
      formData.append('surname', this.authForm.value.surname);
      formData.append('email', this.authForm.value.email);
      formData.append('password', this.authForm.value.password);
      formData.append('avatar', this.authForm.value.avatar);

      this.authService.registerUser(formData).subscribe({
        next: (res: any) => {
          localStorage.setItem("token", res.token)
          this.authService.loadUserAvatar();
              this.authService.getUserID().subscribe(
      (res: any) => {
        if(res.message === "Успешно") {
          this.socketService.setUserOnline(res.id)
        }
      },
      (err: any) => {
        console.error(err);
      }
    )

          this.route.navigateByUrl("/profile")
        },
        error: (e) => {
          this.regError = e.error?.message || 'Ошибка регистрации';
          console.error('HTTP error:', e);
        },
      });
    } else {
      this.authForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.generateRandomCars();
  }

  generateRandomCars() {
    const carCount = 100 + Math.floor(Math.random() * 10);
    this.cars = [];

    for (let i = 0; i < carCount; i++) {
      const randomEmoji =
        this.emojiCars[Math.floor(Math.random() * this.emojiCars.length)];
      const randomSpeed = 5 + Math.random() * 20;
      const randomDelay = -1 * Math.random() * 20;
      const randomY = Math.random() * 96;
      const randomDirection = Math.random() > 0.5 ? 'right' : 'left';
      const randomSize = 20 + Math.random() * 30;
      const randomOpacity = 0.5 + Math.random() * 0.5;

      this.cars.push({
        emoji: randomEmoji,
        speed: randomSpeed,
        delay: randomDelay,
        y: randomY,
        direction: randomDirection,
        size: randomSize,
        opacity: randomOpacity,
      });
    }
  }

  getCarAnimation(car: any): string {
    const animationName =
      car.direction === 'right' ? 'driveRight' : 'driveLeft';
    return `${animationName} ${car.speed}s linear ${car.delay}s infinite`;
  }
}
