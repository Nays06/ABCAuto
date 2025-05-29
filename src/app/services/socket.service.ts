import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

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

  constructor(private authService: AuthService) {
    this.socket = io(this.SERVER_URL, {
      transports: ['websocket'],
    });

    this.socket.on('user_status', (data) => {
      const currentStatus = this.userStatusSubject.getValue();
      currentStatus[data.userId] = data.isOnline;
      this.userStatusSubject.next(currentStatus);
    });

    authService.getUserID().subscribe(
      (res: any) => {
        console.log(res);
        
        this.socket.emit('joinUserRoom', res.id);
      },
      (err: any) => {
        console.error(err);
      }
    )
  }

  joinRoom(chatId: string) {
    this.socket.emit('joinRoom', chatId);
  }

  onNewChat(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('newChat', (chat) => {
        observer.next(chat);
      });
    });
  }

  sendMessage(message: any) {
    this.socket.emit('newMessage', message);
  }

onNewMessage(): Observable<any> {
  return new Observable((observer) => {
    this.socket.on('newMessage', (message) => {
      console.log('Получено новое сообщение:', message);
      observer.next(message);
    });
  });
}

emitMessageRead(data: { chatId: string; messageId: string; recipientId: string }) {
    this.socket.emit('messageRead', data);
  }

  onMessageRead(): Observable<{ messageId: string; chatId: string }> {
    return new Observable((observer) => {
      this.socket.on('messageRead', (data) => {
        observer.next(data);
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
