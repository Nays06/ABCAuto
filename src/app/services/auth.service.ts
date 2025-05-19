import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private avatarSubject = new BehaviorSubject<string | null>(null);
  currentAvatar$ = this.avatarSubject.asObservable();

  constructor(private http: HttpClient) {}

  apiURL = "http://localhost:5555/auth"
  
  registerUser(formData: FormData) {
    return this.http.post(`${this.apiURL}/registration`, formData);
  }

  loginUser(userData: Object) {
    return this.http.post(`${this.apiURL}/login`, userData);
  }

  userProfile() {
    return this.http.get(`${this.apiURL}/profile`);
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
      (err) => console.error('Ошибка загрузки аватарки:', err)
    );
  }

  getUserID() {
    return this.http.get(`${this.apiURL}/id`);
  }
}