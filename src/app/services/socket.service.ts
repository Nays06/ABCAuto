import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map, share, takeUntil } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  private readonly SERVER_URL = 'http://localhost:5555';
  private destroy$ = new Subject<void>();

  private userStatusSubject = new BehaviorSubject<{
    [userId: string]: boolean;
  }>({});
  public userStatus$ = this.userStatusSubject.asObservable();

  private newMessageNotificationSubject = new Subject<any>();
  public newMessageNotification$ = this.newMessageNotificationSubject
    .asObservable()
    .pipe(share());

  private joinedRooms = new Set<string>();
  private isConnected = false;

  private isNotificationSubscribed = false;

  getNewMessageNotifications() {
    if (!this.isNotificationSubscribed) {
      this.isNotificationSubscribed = true;
      return this.newMessageNotification$;
    }
    return this.newMessageNotification$;
  }

  constructor(private authService: AuthService) {
    this.initSocket();
  }

  public initSocket() {
    this.socket = io(this.SERVER_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Socket подключен');

      this.rejoinRooms();

      this.authService
        .getUserID()
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res: any) => {
            if (res.message === 'Успешно') {
              this.setUserOnline(res.id);
            }
          },
          (err: any) => {
            console.error('Ошибка получения ID пользователя:', err);
          }
        );
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Socket отключен');
    });

    this.socket.on('user_status', (data) => {
      const currentStatus = this.userStatusSubject.getValue();
      currentStatus[data.userId] = data.isOnline;
      this.userStatusSubject.next(currentStatus);
    });
  }

  private rejoinRooms() {
    if (this.isConnected) {
      this.joinedRooms.forEach((roomId) => {
        this.socket.emit('joinRoom', roomId);
      });

      this.authService
        .getUserID()
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          if (res.message === 'Успешно') {
            this.socket.emit('joinUserRoom', res.id);
          }
        });
    }
  }

  joinRoom(chatId: string) {
    this.joinedRooms.add(chatId);
    if (this.isConnected) {
      this.socket.emit('joinRoom', chatId);
      // console.log(`Присоединились к комнате: ${chatId}`);
    } else {
      this.socket.once('connect', () => {
        this.socket.emit('joinRoom', chatId);
      });
    }
  }

  leaveRoom(chatId: string) {
    this.joinedRooms.delete(chatId);
    if (this.isConnected) {
      this.socket.emit('leaveRoom', chatId);
      // console.log(`Покинули комнату: ${chatId}`);
    }
  }

  onNewChat(): Observable<any> {
    return new Observable((observer) => {
      const handler = (chat: any) => observer.next(chat);
      this.socket.on('newChat', handler);

      return () => {
        this.socket.off('newChat', handler);
      };
    });
  }

  sendMessage(message: any) {
    if (this.isConnected) {
      this.socket.emit('newMessage', message);
    }
  }

  onNewMessage(): Observable<any> {
    return new Observable((observer) => {
      const handler = (message: any) => {
        console.log('Получено новое сообщение:', message);
        observer.next(message);
        this.newMessageNotificationSubject.next(message);
      };
      this.socket.on('newMessage', handler);

      return () => {
        this.socket.off('newMessage', handler);
      };
    });
  }

  emitMessageRead(data: {
    chatId: string;
    messageId: string;
    recipientId: string;
  }) {
    if (this.isConnected) {
      this.socket.emit('messageRead', data);
    }
  }

  onMessageRead(): Observable<{ messageId: string; chatId: string }> {
    return new Observable((observer) => {
      const handler = (data: any) => observer.next(data);
      this.socket.on('messageRead', handler);

      return () => {
        this.socket.off('messageRead', handler);
      };
    });
  }

  setUserOnline(userId: string) {
    if (this.isConnected) {
      this.socket.emit('user_online', userId);
      this.socket.emit('joinUserRoom', userId);
    } else {
      this.socket.once('connect', () => {
        this.socket.emit('user_online', userId);
        this.socket.emit('joinUserRoom', userId);
      });
    }
  }

  onUserStatusChange(): Observable<{ userId: string; isOnline: boolean }> {
    return new Observable((observer) => {
      const handler = (data: any) => observer.next(data);
      this.socket.on('user_status', handler);

      return () => {
        this.socket.off('user_status', handler);
      };
    });
  }

  getUserStatus(userId: string): Observable<boolean> {
    return this.userStatus$.pipe(
      map((statusMap) => statusMap[userId] || false)
    );
  }

  requestUserStatus(userId: string) {
    if (this.isConnected) {
      this.socket.emit('check_user_status', userId);
    } else {
      this.socket.once('connect', () => {
        this.socket.emit('check_user_status', userId);
      });
    }
  }

  requestAllUserStatuses() {
    if (this.isConnected) {
      this.socket.emit('request_all_statuses');
    } else {
      this.socket.once('connect', () => {
        this.socket.emit('request_all_statuses');
      });
    }
  }

  disconnect() {
    this.destroy$.next();
    this.destroy$.complete();
    this.joinedRooms.clear();
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket.connected;
  }
}
