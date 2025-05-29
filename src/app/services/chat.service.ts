import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatsSubject = new BehaviorSubject<any[]>([]);
  chats$ = this.chatsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private socketService: SocketService
  ) {
    this.loadChats();
    this.subscribeToNewMessages();
  }

  apiUrl = 'http://localhost:5555/chat';

  private loadChats() {
    this.http.get<any[]>(`${this.apiUrl}/chats`).subscribe(
      (res) => {
        this.chatsSubject.next(res);
      },
      (err) => {
        console.error('Ошибка загрузки чатов', err);
      }
    );
  }

  private subscribeToNewMessages() {
    this.socketService.onNewMessage().subscribe((message) => {
      this.updateChatListWithNewMessage(message);
    });
  }

  private updateChatListWithNewMessage(message: any) {
    const currentChats = this.chatsSubject.getValue();

    const findUserById = (userId: string) => {
      return {
        _id: userId,
        name: 'Test',
        surname: 'Test',
        avatar: 'static/avatar/default-avatar.jpeg',
      };
    };

    const updatedChats = currentChats.map((chat) => {
      if (chat._id === message.chatId) {
        const senderUser = findUserById(message.senderId);

        return {
          ...chat,
          lastMessage: {
            senderId: senderUser,
            content: message.content,
            sentAt: message.createdAt || new Date().toISOString(),
          },
        };
      }
      return chat;
    });

    this.chatsSubject.next(updatedChats);
  }

  sendMessageWithOutChatId(data: any) {
    this.http
      .post(`${this.apiUrl}/chats`, {
        advertisementId: data.advertisementId,
        buyerId: data.buyerId,
        sellerId: data.sellerId,
      })
      .subscribe(
        (res: any) => {
          this.http
            .post(`${this.apiUrl}/messages`, {
              chatId: res._id,
              senderId: data.senderId,
              recipientId: data.recipientId,
              content: data.content,
            })
            .subscribe(
              (r: any) => {
                console.log('Успешно!', r);
                this.router.navigate(['/chats', res._id]);
                this.loadChats();
              },
              (e: any) => {
                console.error(e);
              }
            );
        },
        (e: any) => {
          console.error(e);
        }
      );
  }

  sendMessageWithChatId(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages`, {
      chatId: data.chatId,
      senderId: data.senderId,
      recipientId: data.recipientId,
      content: data.content,
    });
  }

  getChat(chatId: string) {
    return this.http.get(`${this.apiUrl}/chats/${chatId}`);
  }

  getChats() {
    return this.chats$;
  }

  getChatMessages(chatId: string) {
    return this.http.get(`${this.apiUrl}/messages/${chatId}`);
  }
}
