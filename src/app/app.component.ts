import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { FavoritesService } from './services/favorites.service';
import { AuthService } from './services/auth.service';
import { SocketService } from './services/socket.service';
import { ChatService } from './services/chat.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  hideHeaderFooter = false;
  currentUserId = '';
  private destroy$ = new Subject<void>();
  private joinedChatRooms = new Set<string>();

  constructor(
    private favoriteService: FavoritesService,
    private authService: AuthService,
    private socketService: SocketService,
    private chatService: ChatService,
    private router: Router,
    private toast: HotToastService
  ) {
    this.favoriteService
      .getFavorites()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          favoriteService.setCount(res.favorites.length);
        },
        (err) => {
          console.error(err);
        }
      );

    this.authService
      .getBalance()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.authService.updateBalance(res);
      });

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.hideHeaderFooter = this.router.url.includes('hack');
      }
    });
  }

  ngOnInit() {
    this.authService
      .getUserID()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          if (res.message === 'Успешно') {
            this.currentUserId = res.id;
            this.socketService.setUserOnline(res.id);
            this.setupMessageNotifications();
            this.joinChatRooms();
          }
        },
        (err: any) => {
          console.error(err);
        }
      );
  }

  private joinChatRooms(): void {
    this.chatService
      .getChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
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

  private setupMessageNotifications() {
    this.socketService.newMessageNotification$
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
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

  ngOnDestroy() {
    this.joinedChatRooms.forEach((chatId) => {
      this.socketService.leaveRoom(chatId);
    });
    this.joinedChatRooms.clear();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
