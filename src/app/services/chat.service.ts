import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private http: HttpClient) { }
  apiUrl = 'http://localhost:5555/chat';

  sendMessage(data: any) {
    console.log(data);
    
    this.http.post(`${this.apiUrl}/chats`, { advertisementId: data.advertisementId, buyerId: data.buyerId, sellerId: data.sellerId }).subscribe(
      (r: any) => {
        this.http.post(`${this.apiUrl}/messages`, { chatId: r._id, senderId: data.senderId, recipientId: data.recipientId, content: data.content }).subscribe(
          (r: any) => {
            console.log("Учпешно!", r);
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
}
