import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketService } from './socket.service';
import { HotToastService } from '@ngxpert/hot-toast';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatsSubject = new BehaviorSubject<any[]>([]);
  chats$ = this.chatsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private socketService: SocketService,
    private toast: HotToastService
  ) {
    this.loadChats();
    this.subscribeToNewMessages();
    this.subscribeToNewChats();
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

  private subscribeToNewChats() {
    this.socketService.onNewChat().subscribe((newChat) => {
      this.addNewChatToList(newChat);
    });
  }

  private addNewChatToList(newChat: any) {
    const currentChats = this.chatsSubject.getValue();
    if (!currentChats.find((c) => c._id === newChat._id)) {
      setTimeout(() => {
        this.http.get<any[]>(`${this.apiUrl}/chats`).subscribe(
          (res: any) => {
            const thisChat = res.find((chat: any) => chat._id === newChat._id);
            console.log('thisChat', thisChat);

            currentChats.unshift(thisChat);
            this.chatsSubject.next(currentChats);
          },
          (err) => {
            console.error('Ошибка загрузки чатов', err);
          }
        );
      }, 200);
    }
  }

  private updateChatListWithNewMessage(message: any) {
    const currentChats = this.chatsSubject.getValue();
    const chatExists = currentChats.some((chat) => chat._id === message.chatId);
    if (!chatExists) {
      console.warn('Чат с chatId', message.chatId, 'не найден в списке чатов');
      return;
    }
    const updatedChats = currentChats.map((chat) => {
      if (chat._id === message.chatId) {
        return {
          ...chat,
          lastMessage: {
            senderId:
              chat.buyerId._id === message.senderId
                ? {
                    _id: chat.buyerId._id,
                    name: chat.buyerId.name,
                    surname: chat.buyerId.surname,
                    avatar: chat.buyerId.avatar,
                  }
                : {
                    _id: chat.sellerId._id,
                    name: chat.sellerId.name,
                    surname: chat.sellerId.surname,
                    avatar: chat.sellerId.avatar,
                  },
            content: message.content,
            createdAt: message.createdAt || new Date().toISOString(),
          },
        };
      }
      return chat;
    });

    updatedChats.sort((a, b) => {
      const dateA = new Date(a.lastMessage?.createdAt || 0);
      const dateB = new Date(b.lastMessage?.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    this.chatsSubject.next(updatedChats);
  }

  markMessagesAsRead(chatId: string, messageIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages/read`, {
      chatId,
      messageIds,
    });
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
          console.error("2", e);
          if(e.status === 401) {
            this.toast.error("Для выполнения этого действия нужно быть авторизованным")
          }
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
