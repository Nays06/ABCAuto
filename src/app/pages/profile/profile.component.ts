import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { CarCardComponent } from '../../components/car-card/car-card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, NgFor, CarCardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  user: any = {};

  constructor(private authService: AuthService, private router: Router) {}

  goToAddCar() {
    this.router.navigate(['/addCar']);
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

  ngOnInit() {
    this.checkAuthAndRedirect();
    this.authService.userProfile().subscribe(
      (res: any) => {
        console.log(res);
        this.user = res.data;
        this.user.registrationDate = this.formatRussianDate(
          this.user.registrationDate
        );
      },
      (err: any) => {
        console.error(err);
      }
    );
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
