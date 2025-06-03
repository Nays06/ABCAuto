import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  constructor(private http: HttpClient) { }
  apiUrl = 'http://localhost:5555/review';

  addReview(review: object) {
    return this.http.post(`${this.apiUrl}/`, review)
  }
}
