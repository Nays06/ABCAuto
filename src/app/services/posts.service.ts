import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  constructor(private http: HttpClient) { }
  apiUrl = 'http://localhost:5555/post';

  addPost(post: object) {
    return this.http.post(`${this.apiUrl}/`, post)
  }

  getPosts() {
    return this.http.get(`${this.apiUrl}/`)
  }

  deletePost(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }
}
