import { Component } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  imports: [NgFor, FormsModule, NgIf, DatePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  id: any = '';
  chat: any = [];
  message = ""
  hovered: boolean = false;
  currentUserId: string = "";


  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit(): Promise<void> {
    window.scrollTo(0, 0);

    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      await this.chatService.getChat(this.id).subscribe(
        (res: any) => {
          this.chat = res
          console.log(res);
        },
        (err: any) => {
          console.error(err);
        }
      );
    }

    this.authService.getUserID().subscribe(
      (r: any) => {
        this.currentUserId = r.id
      }
    )
  }

  sendMessage() {
    console.log(this.message.trim());
    this.chatService.sendMessageWithChatId({ chatId: this.chat[0].chatId, senderId: this.currentUserId, recipientId: (this.currentUserId === this.chat[0].senderId ? this.chat[0].recipientId : this.chat[0].senderId ), content: this.message.trim() }).subscribe(
      (r: any) => {
        console.log("Учпешно!", r);
        this.chat.push(r)
        this.message = ""
      },
      (e: any) => {
        console.error(e);
      }
    )
  }
}
