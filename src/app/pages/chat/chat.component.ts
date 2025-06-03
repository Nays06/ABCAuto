import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-chat',
  imports: [NgFor, FormsModule, NgIf],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
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

  async ngOnInit(): Promise<void> {
    window.scrollTo(0, 0);

    this.chatId = this.route.snapshot.paramMap.get('id');
    if (this.chatId) {
      await this.chatService.getChat(this.chatId).subscribe(
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

    this.authService.getUserID().subscribe((r: any) => {
      this.currentUserId = r.id;
    });

    this.socketService.joinRoom(this.chatId);
    this.socketService.onNewMessage().subscribe((msg) => {
      this.chatMessages.push(msg);
      this.scrollToBottom()
    });
  }

  sendMessage() {
    console.log(this.message.trim());
    this.chatService
      .sendMessageWithChatId({
        chatId: this.chat._id,
        senderId: this.currentUserId,
        recipientId:
          this.currentUserId === this.chat.sellerId
            ? this.chat.buyerId
            : this.chat.sellerId,
        content: this.message.trim(),
      })
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
