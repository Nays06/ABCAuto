import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private readonly SERVER_URL = 'http://localhost:5555';

  constructor() {
    this.socket = io(this.SERVER_URL, {
      transports: ['websocket'],
    });
  }

  joinRoom(chatId: string) {
    this.socket.emit('joinRoom', chatId);
  }

  sendMessage(message: any) {
    this.socket.emit('newMessage', message);
  }

  onNewMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('newMessage', (message) => {
        observer.next(message);
      });
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
