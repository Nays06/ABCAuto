import { Injectable } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';
import { Router } from '@angular/router';

export interface MessageNotification {
  chatId: string;
  senderId: string;
  senderName?: string;
  content: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private isNotificationsEnabled = true;
  private soundEnabled = true;

  constructor(private toast: HotToastService, private router: Router) {
    this.requestNotificationPermission();
  }

  private async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Разрешение на уведомления:', permission);
    }
  }

  showMessageNotification(notification: MessageNotification) {
    if (!this.isNotificationsEnabled) return;

    const content =
      notification.content.length > 50
        ? notification.content.substring(0, 50) + '...'
        : notification.content;

    const senderName = notification.senderName || 'Пользователь';

    const toastRef = this.toast.success(`${senderName}: ${content}`, {
      duration: 5000,
      position: 'bottom-right',
      style: {
        border: '1px solid #4ade80',
        padding: '12px',
        color: '#1f2937',
        cursor: 'pointer',
      },
      iconTheme: {
        primary: '#4ade80',
        secondary: '#ffffff',
      },
    });

    this.showBrowserNotification(senderName, content, notification.chatId);

    if (this.soundEnabled) {
      this.playNotificationSound();
    }
  }

  private showBrowserNotification(
    senderName: string,
    content: string,
    chatId: string
  ) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(
        `Новое сообщение от ${senderName}`,
        {
          body: content,
          icon: '/assets/icons/message-icon.png',
          badge: '/assets/icons/app-badge.png',
          tag: `chat-${chatId}`,
          requireInteraction: false,
          silent: false,
        }
      );

      notification.onclick = () => {
        window.focus();
        this.router.navigate(['/chats', chatId]);
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    }
  }

  private playNotificationSound() {
    try {
      const audio = new Audio('./assets/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch((err) => {
        console.log('Не удалось воспроизвести звук уведомления:', err);
      });
    } catch (err) {
      console.log('Звук уведомления недоступен:', err);
    }
  }

  enableNotifications() {
    this.isNotificationsEnabled = true;
  }

  disableNotifications() {
    this.isNotificationsEnabled = false;
  }

  enableSound() {
    this.soundEnabled = true;
  }

  disableSound() {
    this.soundEnabled = false;
  }

  getNotificationSettings() {
    return {
      enabled: this.isNotificationsEnabled,
      sound: this.soundEnabled,
    };
  }
}
