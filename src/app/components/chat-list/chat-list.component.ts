import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { SocketService } from '../../services/socket.service';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat-list',
  imports: [NgFor, NgIf],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css',
})
export class ChatListComponent implements OnInit, OnDestroy {
  chats: any[] = [];
  currentUserId = '';
  private subscription!: Subscription;
  statusSubscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUserID().subscribe((res: any) => {
      this.currentUserId = res.id;
    });

    this.subscription = this.chatService.getChats().subscribe(
      (res) => {
        this.chats = res;
        console.log(this.chats);
        this.setupChatsStatus();

        this.chats.forEach((chat) => {
          this.socketService.joinRoom(chat._id);
        });
      },
      (err) => {
        console.error('Ошибка загрузки чатов', err);
      }
    );

    this.socketService.onMessageRead().subscribe(({ messageId, chatId }) => {
      this.chats.map((chat) => {
        if (chatId === chat._id) {
          chat.lastMessage.isRead = true;
        }
      });
    });
  }

  setupChatsStatus() {
    this.statusSubscriptions.forEach((sub) => sub.unsubscribe());
    this.statusSubscriptions = [];

    this.chats.forEach((chat) => {
      const otherUserId =
        chat.buyerId._id === this.currentUserId
          ? chat.sellerId._id
          : chat.buyerId._id;

      const statusSub = this.socketService
        .getUserStatus(otherUserId)
        .subscribe({
          next: (isOnline) => {
            chat.isOnline = isOnline;
            console.log(`Статус пользователя ${otherUserId}:`, isOnline);
          },
          error: (err) => {
            console.error(`Ошибка получения статуса для ${otherUserId}:`, err);
          },
        });

      this.statusSubscriptions.push(statusSub);
      this.socketService.requestUserStatus(otherUserId);
    });
  }

  formatPrice(price: number): string {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  formatMskDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const mskDate = new Date(date.getTime());

    const today = this.getMskDateWithoutTime(new Date());

    const inputDate = this.getMskDateWithoutTime(mskDate);

    if (inputDate.getTime() === today.getTime()) {
      return this.formatTime(mskDate);
    } else {
      return this.formatShortDate(inputDate);
    }
  }

  private getMskDateWithoutTime(date: Date): Date {
    const mskDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
    mskDate.setHours(0, 0, 0, 0);
    return mskDate;
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  private formatShortDate(date: Date): string {
    const monthNames = [
      'янв',
      'фев',
      'мар',
      'апр',
      'мая',
      'июн',
      'июл',
      'авг',
      'сен',
      'окт',
      'ноя',
      'дек',
    ];
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.statusSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  openChat(chatId: string): void {
    this.router.navigate(['/chats', chatId]);
  }
}
