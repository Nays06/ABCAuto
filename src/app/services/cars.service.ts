import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CarsService {

  constructor(private http: HttpClient) { }
  apiUrl = "http://localhost:5555/cars"

  getBrands(){
    return this.http.get(`${this.apiUrl}/brands`)
  }

  getCars(params: string = ""){
    return this.http.get(`${this.apiUrl}/cars${params}`)
  }

  addCar(newCar: any) {
    return this.http.post(`${this.apiUrl}/add`, newCar)
  }

  getCarDetails(id: String) {
    return this.http.get(`${this.apiUrl}/car/${id}`)
  }
  
  editCarData(id: String, data: any) {
    return this.http.patch(`${this.apiUrl}/car/${id}`, data)
  }
  
  deleteCar(id: String) {
    return this.http.delete(`${this.apiUrl}/car/${id}`)
  }
}
