import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { CarCardComponent } from '../../components/car-card/car-card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, NgFor, NgIf, CarCardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  user: any = {};
  allFavorites = [];
  otherUserId: any = '';
  isUserOnline: boolean = false;
  private statusSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private favoriteService: FavoritesService,
    private socketService: SocketService
  ) {
    this.socketService.requestAllUserStatuses();
  }

  goToAddCar() {
    this.router.navigate(['/car/add']);
  }

  checkAuthAndRedirect(): void {
    const token = localStorage.getItem('token');
    const isValid = token ? this.isTokenValid(token) : false;

    if (!isValid) {
      this.router.navigate(['/register']);
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      const decoded = JSON.parse(atob(payloadBase64));
      const exp = decoded.exp;

      return Date.now() < exp * 1000;
    } catch (e) {
      return false;
    }
  }

  ngOnInit(): void {
    this.otherUserId = this.route.snapshot.paramMap.get('id');

    this.authService.getUserID().subscribe((res: any) => {
      if (res.id === this.otherUserId) {
        this.router.navigate(['/profile']);
      }
    });

    this.checkAuthAndRedirect();

    this.statusSubscription = this.socketService
      .getUserStatus(this.otherUserId)
      .subscribe({
        next: (isOnline) => {
          console.log('Статус пользователя:', isOnline);
          this.isUserOnline = isOnline;
        },
        error: (err) => {
          console.error('Ошибка получения статуса:', err);
        },
      });

    this.socketService.requestUserStatus(this.otherUserId);

    this.authService
      .userProfile(this.otherUserId ? this.otherUserId : '')
      .subscribe(
        (res: any) => {
          this.user = res.data;
          this.user.registrationDate = this.formatRussianDate(
            this.user.registrationDate
          );
        },
        (err: any) => {
          console.error(err);
          if(this.otherUserId) {
            if (err.error.isNotExists) {
              this.router.navigate(['/profile']);
            }
          } else {
            if (err.error.isNotExists) {
              this.router.navigate(['/register']);
            }
          }
        }
      );

    this.favoriteService.getFavorites().subscribe(
      (res: any) => {
        this.allFavorites = res.favorites;
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  ngOnDestroy() {
    this.statusSubscription.unsubscribe();
  }

  formatRussianDate(dateString: any) {
    const date = new Date(dateString);
    const day = date.getDate();
    const year = date.getFullYear();
    const monthNominative = date.toLocaleString('ru-RU', { month: 'long' });
    const monthGenitive = this.getGenitiveMonth(monthNominative);

    return `${day} ${monthGenitive} ${year}`;
  }

  getGenitiveMonth(month: String) {
    const months: any = {
      январь: 'января',
      февраль: 'февраля',
      март: 'марта',
      апрель: 'апреля',
      май: 'мая',
      июнь: 'июня',
      июль: 'июля',
      август: 'августа',
      сентябрь: 'сентября',
      октябрь: 'октября',
      ноябрь: 'ноября',
      декабрь: 'декабря',
    };

    return months[month.toLowerCase()] || month;
  }
}
