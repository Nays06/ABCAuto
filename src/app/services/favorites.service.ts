import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
}
