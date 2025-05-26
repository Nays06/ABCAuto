import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  constructor(private http: HttpClient) {}
  apiUrl = 'http://localhost:5555/favorites';

  getFavorites() {
    return this.http.get(`${this.apiUrl}/`);
  }

  addToFavorite(carId: any) {
    return this.http.post(`${this.apiUrl}/`, { carId });
  }

  removeFromFavorites(carId: String) {
    return this.http.delete(`${this.apiUrl}/${carId}`);
  }

  getFavoriteCars() {
    return this.http.get(`${this.apiUrl}/cars`);
  }

  private favoritesCount = new BehaviorSubject<number>(0);

  public favoritesCount$ = this.favoritesCount.asObservable();

  incrementCount() {
    this.favoritesCount.next(this.favoritesCount.value + 1);
  }

  decrementCount() {
    if (this.favoritesCount.value > 0) {
      this.favoritesCount.next(this.favoritesCount.value - 1);
    }
  }

  setCount(count: number) {
    this.favoritesCount.next(count);
  }
}
