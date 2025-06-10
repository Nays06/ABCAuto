import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chat-window',
  imports: [NgFor, FormsModule, NgIf],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css',
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  chatId: any = '';
  chat: any = {};
  chatMessages: any = [];
  message = '';
  hovered: boolean = false;
  currentUserId: string = '';
  private destroy$ = new Subject<void>();

  @ViewChild('messagesContainer')
  private messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: HotToastService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (params) => {
        const newChatId = params.get('id')!;

        if (this.chatId && this.chatId !== newChatId) {
          this.socketService.leaveRoom(this.chatId);
        }

        this.chatId = newChatId;

        if (this.chatId) {
          await this.loadChat(this.chatId);
          this.markMessagesAsRead();
          this.socketService.joinRoom(this.chatId);
        }
      });

    this.authService
      .getUserID()
      .pipe(takeUntil(this.destroy$))
      .subscribe((r: any) => {
        this.currentUserId = r.id;
      });

    this.socketService
      .onNewMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe((msg) => {
        if (msg.chatId === this.chatId) {
          this.chatMessages.push(msg);
          this.scrollToBottom();

          if (msg.senderId !== this.currentUserId) {
            this.markMessagesAsRead();
          }
        }
      });

    this.socketService
      .onMessageRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ messageId, chatId }) => {
        if (chatId === this.chatId) {
          const message = this.chatMessages.find(
            (m: any) => m._id === messageId
          );
          if (message) {
            message.isRead = true;
          }
        }
      });
  }

  async loadChat(chatId: string): Promise<void> {
    window.scrollTo(0, 0);

    this.chatService
      .getChat(chatId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          this.chat = res.chatInfo;
          this.chatMessages = res.chatMessages;
          console.log(res);
          this.scrollToBottom(false);
          this.markMessagesAsRead();
        },
        (err: any) => {
          console.error(err);
          this.toast.error(err.error.message);
          this.router.navigate(['/chats']);
        }
      );
  }

  markMessagesAsRead() {
    const unreadMessages = this.chatMessages.filter(
      (msg: any) => !msg.isRead && msg.senderId !== this.currentUserId
    );

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map((msg: any) => msg._id);

      this.chatService
        .markMessagesAsRead(this.chatId, messageIds)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          () => {
            unreadMessages.forEach((msg: any) => (msg.isRead = true));

            messageIds.forEach((messageId: string) => {
              this.socketService.emitMessageRead({
                chatId: this.chatId,
                messageId,
                recipientId:
                  this.currentUserId === this.chat.sellerId
                    ? this.chat.buyerId
                    : this.chat.sellerId,
              });
            });
          },
          (err: any) => {
            console.error('Ошибка при отметке сообщений как прочитанных', err);
          }
        );
    }
  }

  sendMessage() {
    if (this.message.trim()) {
      const messageData = {
        chatId: this.chat._id,
        senderId: this.currentUserId,
        recipientId:
          this.currentUserId === this.chat.sellerId
            ? this.chat.buyerId
            : this.chat.sellerId,
        content: this.message.trim(),
      };

      this.chatService
        .sendMessageWithChatId(messageData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (r: any) => {
            console.log('Успешно!', r);
            this.message = '';
            this.scrollToBottom();
          },
          (e: any) => {
            console.error('Ошибка отправки сообщения', e);
          }
        );
    }
  }

  formateTime(time: any) {
    const mskTime = new Date(time).toLocaleTimeString('ru-RU', {
      timeZone: 'Europe/Moscow',
      hour: '2-digit',
      minute: '2-digit',
    });

    return mskTime;
  }

  scrollToBottom(animation: boolean = true) {
    try {
      setTimeout(() => {
        if (this.messagesContainer?.nativeElement) {
          if (animation) {
            this.messagesContainer.nativeElement.scrollTo({
              top: this.messagesContainer.nativeElement.scrollHeight,
              behavior: 'smooth',
            });
          } else {
            this.messagesContainer.nativeElement.scrollTop =
              this.messagesContainer.nativeElement.scrollHeight;
          }
        }
      }, 10);
    } catch (err) {
      console.error(err);
    }
  }

  ngOnDestroy() {
    if (this.chatId) {
      this.socketService.leaveRoom(this.chatId);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
