import { Component } from '@angular/core';
import { VideoSliderComponent } from "../../components/video-slider/video-slider.component";
import { CarsService } from '../../services/cars.service';
import { OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import cars from './cars_with_images3.json'
import { CarCardComponent } from "../../components/car-card/car-card.component";

@Component({
  selector: 'app-home',
  imports: [VideoSliderComponent, NgFor, CarCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private _carService: CarsService;
  brands: any[] = []
  cars: any = cars

  constructor(CarsService: CarsService) {
    this._carService = CarsService
  }

  ngOnInit(){
    this.getBrands()
  }

  getBrands(){
    this._carService.getBrands()
    .subscribe(
          (response: any) => {
            console.log('Успешно'); 
            this.brands = response
          },
          error => {
            console.log(error);
          }
        );
  }
}
