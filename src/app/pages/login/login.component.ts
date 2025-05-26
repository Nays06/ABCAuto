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
  selector: 'app-login',
  imports: [RouterLink, NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
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
  logError: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: Router,
    private socketService: SocketService
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  login() {
    this.logError = '';
    if (this.authForm.valid) {
      this.authService.loginUser(this.authForm.value).subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.token);
          this.authService.loadUserAvatar();
          this.authService.getUserID().subscribe(
            (res: any) => {
              if (res.message === 'Успешно') {
                this.socketService.setUserOnline(res.id);
              }
            },
            (err: any) => {
              console.error(err);
            }
          );

          this.route.navigateByUrl('/profile');
        },
        error: (e) => {
          this.logError = e.error?.message || 'Ошибка входа';
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
    const carCount = 50 + Math.floor(Math.random() * 10);
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
