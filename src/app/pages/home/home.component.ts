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
  car = {
    brand: 'Toyota',
    model: 'Camry',
    country: 'Japan',
    year: 2023,
    engine: '2.5L I4',
    transmission: '8-speed automatic',
    mileage: 12450,
    fuelType: 'Gasoline',
    bodyType: 'Sedan',
    driveType: 'FWD',
    horsepower: 203,
    color: 'white',
    price: 2790360,
    images: [
      "https://di-uploads-pod7.dealerinspire.com/toyotachulavista/uploads/2022/11/2023_Toyota_Camry_exterior_side_white.png",
      "https://autoimage.capitalone.com/stock-media/chrome/2023-Toyota-Camry-SE-040-cc_2023TOC020024_01_2100_040.png?width=640&height=480",
      "https://vehicle-images.dealerinspire.com/71a1-110007313/4T1F11AK8PU808883/4160c08445f7ad9a3b38f758ca3e95ad.jpg",
      "https://www.clickheretesting.com/GreenvilleToyota/research/2023/camry/images/mlp-img-perf.webp",
      "https://file.kelleybluebookimages.com/kbb/base/evox/CP/52443/2023-Toyota-Camry-front_52443_032_2400x1800_089_nologo.png",
      "https://www.pepperstoyota.com/blogs/4162/wp-content/uploads/2023/11/camry1.jpg",
      "https://static.overfuel.com/photos/60/108489/image-1.webp",
      "https://i.ytimg.com/vi/q7l_d-vDjxw/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgYChVMA8=&rs=AOn4CLCsJEpXHSljQfa_w55g8rKLGTr6bg",
      "https://hips.hearstapps.com/hmg-prod/images/c-009-1500x1000-1652720748.jpg?crop=1.00xw:0.920xh;0,0&resize=980:*",
      "https://di-uploads-pod18.dealerinspire.com/toyotaofsmithfield/uploads/2022/08/22-camry-model.png"
    ]
  }

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
