import { Component } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-chat-list',
  imports: [NgFor],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css',
})
export class ChatListComponent {
  chats: any = [];

  constructor(private chatService: ChatService, private router: Router) {}

  ngOnInit(): void {
    this.chatService.getChats().subscribe(
      (res) => {
        this.chats = res;
      },
      (err) => {
        console.error('Ошибка загрузки чатов', err);
      }
    );
  }

  openChat(chatId: string): void {
    this.router.navigate(['/chats', chatId]);
  }
}