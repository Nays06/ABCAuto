import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  private readonly SERVER_URL = 'http://localhost:5555';

  private userStatusSubject = new BehaviorSubject<{
    [userId: string]: boolean;
  }>({});
  public userStatus$ = this.userStatusSubject.asObservable();

  constructor() {
    this.socket = io(this.SERVER_URL, {
      transports: ['websocket'],
    });

    this.socket.on('user_status', (data) => {
      const currentStatus = this.userStatusSubject.getValue();
      currentStatus[data.userId] = data.isOnline;
      this.userStatusSubject.next(currentStatus);
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

  setUserOnline(userId: string) {
    this.socket.emit('user_online', userId);
  }

  onUserStatusChange() {
    return new Observable<{ userId: string; isOnline: boolean }>((observer) => {
      this.socket.on('user_status', (data) => {
        observer.next(data);
      });
    });
  }

  getUserStatus(userId: string): Observable<boolean> {
    return this.userStatus$.pipe(
      map((statusMap) => statusMap[userId] || false)
    );
  }

  requestUserStatus(userId: string) {
    if (this.socket.connected) {
      this.socket.emit('check_user_status', userId);
    } else {
      this.socket.once('connect', () => {
        this.socket.emit('check_user_status', userId);
      });
    }
  }

  requestAllUserStatuses() {
    if (this.socket.connected) {
      this.socket.emit('request_all_statuses');
    } else {
      this.socket.once('connect', () => {
        this.socket.emit('request_all_statuses');
      });
    }
  }
}
