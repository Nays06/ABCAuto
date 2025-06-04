import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { SocketService } from '../../services/socket.service';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
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
  private destroy$ = new Subject<void>();
  private joinedChatRooms = new Set<string>();

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService
      .getUserID()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.currentUserId = res.id;
      });

    this.chatService
      .getChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          this.chats = res;
          console.log(this.chats);
          this.setupChatsStatus();
          this.joinChatRooms();
        },
        (err) => {
          console.error('Ошибка загрузки чатов', err);
        }
      );

    this.socketService
      .onMessageRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ messageId, chatId }) => {
        this.chats.map((chat) => {
          if (chatId === chat._id) {
            chat.lastMessage.isRead = true;
          }
        });
      });

    this.socketService
      .onNewMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        const chatIndex = this.chats.findIndex(
          (chat) => chat._id === message.chatId
        );
        if (chatIndex !== -1) {
          this.chats[chatIndex].lastMessage = {
            content: message.content,
            createdAt: message.createdAt,
            isRead: false,
            senderId: {
              _id: message.senderId,
              name:
                this.chats[chatIndex].buyerId._id !== this.currentUserId
                  ? this.chats[chatIndex].buyerId.name
                  : this.chats[chatIndex].sellerId.name,
              surname:
                this.chats[chatIndex].buyerId._id !== this.currentUserId
                  ? this.chats[chatIndex].buyerId.surname
                  : this.chats[chatIndex].sellerId.surname,
            },
          };

          const chat = this.chats.splice(chatIndex, 1)[0];
          this.chats.unshift(chat);
        }
      });
  }

  private joinChatRooms(): void {
    this.chats.forEach((chat) => {
      if (!this.joinedChatRooms.has(chat._id)) {
        this.socketService.joinRoom(chat._id);
        this.joinedChatRooms.add(chat._id);
      }
    });
  }

  setupChatsStatus() {
    this.chats.forEach((chat) => {
      const otherUserId =
        chat.buyerId._id === this.currentUserId
          ? chat.sellerId._id
          : chat.buyerId._id;

      this.socketService
        .getUserStatus(otherUserId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (isOnline) => {
            chat.isOnline = isOnline;
            console.log(`Статус пользователя ${otherUserId}:`, isOnline);
          },
          error: (err) => {
            console.error(`Ошибка получения статуса для ${otherUserId}:`, err);
          },
        });

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
    this.joinedChatRooms.forEach((chatId) => {
      this.socketService.leaveRoom(chatId);
    });
    this.joinedChatRooms.clear();

    this.destroy$.next();
    this.destroy$.complete();
  }

  openChat(chatId: string): void {
    this.router.navigate(['/chats', chatId]);
  }
}
