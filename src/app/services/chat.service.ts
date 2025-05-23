import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private http: HttpClient, private router: Router) { }
  apiUrl = 'http://localhost:5555/chat';

  sendMessageWithOutChatId(data: any) {
    return this.http.post(`${this.apiUrl}/chats`, { advertisementId: data.advertisementId, buyerId: data.buyerId, sellerId: data.sellerId }).subscribe(
      (res: any) => {
        this.http.post(`${this.apiUrl}/messages`, { chatId: res._id, senderId: data.senderId, recipientId: data.recipientId, content: data.content }).subscribe(
          (r: any) => {
            console.log("Учпешно!", r);
            this.router.navigate(['/chat', res._id]);
          },
          (e: any) => {
            console.error(e);
          }
        )
      },
      (e: any) => {
        console.error(e);
      }
    )
  }

  sendMessageWithChatId(data: any) {
    return this.http.post(`${this.apiUrl}/messages`, { chatId: data.chatId, senderId: data.senderId, recipientId: data.recipientId, content: data.content })
  }

  getChat(chatId: string) {
    return this.http.get(`${this.apiUrl}/chats/${chatId}`)
  }

  getChats() {
    return this.http.get(`${this.apiUrl}/chats`)
  }

  getChatMessages(chatId: String) {
    return this.http.get(`${this.apiUrl}/messages/${chatId}`)
  }
}
