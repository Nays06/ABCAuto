import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private avatarSubject = new BehaviorSubject<string | null>(null);
  currentAvatar$ = this.avatarSubject.asObservable();
  private balance = new BehaviorSubject<number>(0);
  public balance$ = this.balance.asObservable();

  updateBalance(balance: number) {
    this.balance.next(balance);
  }

  constructor(private http: HttpClient) {}

  apiURL = 'http://localhost:5555/auth';

  registerUser(formData: FormData) {
    return this.http.post(`${this.apiURL}/registration`, formData);
  }

  loginUser(userData: Object) {
    return this.http.post(`${this.apiURL}/login`, userData, {
      withCredentials: true,
    });
  }

  userProfile(userId: string = '') {
    return this.http.get(`${this.apiURL}/profile/${userId}`);
  }

  userAvatar() {
    return this.http.get(`${this.apiURL}/avatar`);
  }

  updateAvatar(avatarUrl: string) {
    this.avatarSubject.next(avatarUrl);
  }

  loadUserAvatar() {
    this.userAvatar().subscribe(
      (res: any) => {
        this.updateAvatar(res.avatar);
      },
      (err) => {
        console.error(err);
        this.updateAvatar('');
      }
    );
  }

  getUserID() {
    return this.http.get(`${this.apiURL}/id`);
  }

  refreshToken() {
    return this.http.get(`${this.apiURL}/refresh`, { withCredentials: true });
  }

  logout() {
    return this.http
      .post(`${this.apiURL}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          localStorage.removeItem('token');
        })
      );
  }

  getBalance() {
    return this.http.get(`${this.apiURL}/balance`);
  }

  setBalance(balance: number) {
    return this.http.post(`${this.apiURL}/balance`, { balance });
  }
}
