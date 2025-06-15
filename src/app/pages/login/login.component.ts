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
import { ChatService } from '../../services/chat.service';
import { FavoritesService } from '../../services/favorites.service';
import { HotToastService } from '@ngxpert/hot-toast';

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
  currentUserId: any = '';
  private joinedChatRooms = new Set<string>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: Router,
    private socketService: SocketService,
    private favoriteService: FavoritesService,
    private router: Router,
    private chatService: ChatService,
    private toast: HotToastService
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
                this.currentUserId = res.id;
                this.socketService.setUserOnline(this.currentUserId);
                this.socketService.initSocket();
                this.setupMessageNotifications();
                this.joinChatRooms();
                
                this.favoriteService.getFavorites().subscribe(
                  (res: any) => {
                    this.favoriteService.setCount(res.favorites.length);
                  },
                  (err) => {
                    console.error(err);
                  }
                );
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

  private setupMessageNotifications() {
    this.socketService.newMessageNotification$.subscribe((message) => {
      if (message.senderId !== this.currentUserId) {
        const isInChatWindow = this.router.url.includes(
          `/chats/${message.chatId}`
        );

        if (!isInChatWindow) {
          this.showMessageNotification(message);
        }
      }
    });
  }

  private showMessageNotification(message: any) {
    console.log('Новое сообщение:', message);

    const senderName = message.senderName || 'Новое сообщение';
    const content =
      message.content.length > 50
        ? message.content.substring(0, 50) + '...'
        : message.content;

    this.toast.show(`${senderName}: ${content}`, {
      duration: 5000,
      icon: '💬',
      position: 'bottom-right',
      style: {
        border: '1px solid var(--primary-color)',
        padding: '12px',
        color: '#1f2937',
        cursor: 'pointer',
      },
      iconTheme: {
        primary: 'var(--primary-color)',
        secondary: '#ffffff',
      },
    });

    this.playNotificationSound();
  }

  private playNotificationSound() {
    try {
      const audio = new Audio('./assets/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch((err) => {
        console.log('Не удалось воспроизвести звук уведомления:', err);
      });
    } catch (err) {
      console.log('Звук уведомления недоступен:', err);
    }
  }

private joinChatRooms() {
  this.chatService.getChats().subscribe(
    (res: any) => {
      res.forEach((chat: any) => {
        if (!this.joinedChatRooms.has(chat._id)) {
          this.socketService.joinRoom(chat._id);
          this.joinedChatRooms.add(chat._id);
        }
      });
    },
    (err) => {
      console.error(
        'Ошибка загрузки чатов для присоединения к комнатам',
        err
      );
    }
  );
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
