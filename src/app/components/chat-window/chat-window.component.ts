import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-chat-window',
  imports: [NgFor, FormsModule, NgIf],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent {
  chatId: any = '';
  chat: any = {};
  chatMessages: any = [];
  message = '';
  hovered: boolean = false;
  currentUserId: string = '';
  @ViewChild('messagesContainer')
  private messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private socketService: SocketService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params) => {
      this.chatId = params.get('id')!;

      if (this.chatId) {
        await this.loadChat(this.chatId);

        this.socketService.joinRoom(this.chatId);
      }
    });

    this.authService.getUserID().subscribe((r: any) => {
      this.currentUserId = r.id;
    });

    this.socketService.onNewMessage().subscribe((msg) => {
      if (msg.chatId === this.chatId) {
        this.chatMessages.push(msg);
        this.scrollToBottom();
      }
    });
  }

  async loadChat(chatId: string): Promise<void> {
    window.scrollTo(0, 0);

    this.chatService.getChat(chatId).subscribe(
      (res: any) => {
        this.chat = res.chatInfo;
        this.chatMessages = res.chatMessages;
        console.log(res);

        this.scrollToBottom(false);
      },
      (err: any) => {
        console.error(err);
      }
    );
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

    this.chatService.sendMessageWithChatId(messageData).subscribe(
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
        if (animation) {
          this.messagesContainer.nativeElement.scrollTo({
            top: this.messagesContainer.nativeElement.scrollHeight,
            behavior: 'smooth',
          });
        } else {
          this.messagesContainer.nativeElement.scrollTop =
            this.messagesContainer.nativeElement.scrollHeight;
        }
      }, 10);
    } catch (err) {
      console.error(err);
    }
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }
}
