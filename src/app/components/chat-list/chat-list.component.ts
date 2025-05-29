import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { SocketService } from '../../services/socket.service';
import { Router } from '@angular/router';
import { NgFor } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-list',
  imports: [NgFor],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css',
})
export class ChatListComponent implements OnInit, OnDestroy {
  chats: any[] = [];
  private subscription!: Subscription;

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.chatService.getChats().subscribe(
      (res) => {
        this.chats = res;

        this.chats.forEach((chat) => {
          this.socketService.joinRoom(chat._id);
        });
      },
      (err) => {
        console.error('Ошибка загрузки чатов', err);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openChat(chatId: string): void {
    this.router.navigate(['/chats', chatId]);
  }
}
