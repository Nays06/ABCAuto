import { Component } from '@angular/core';
import { VideoSliderComponent } from '../../components/video-slider/video-slider.component';
import { CarsService } from '../../services/cars.service';
import { CarCardComponent } from '../../components/car-card/car-card.component';
import { FilterComponent } from '../../components/filter/filter.component';
import { NgFor } from '@angular/common';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-home',
  imports: [VideoSliderComponent, FilterComponent, CarCardComponent, NgFor],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  brand = '';
  priceMin: any = 0;
  priceMax: any = 0;
  cars = [];
  compilations = [
    {
      imgSrc: './assets/img/pages/home/compilation1.jpg',
      title: 'Семейные автомобили',
      compilation: 'family',
    },
    {
      imgSrc: './assets/img/pages/home/compilation2.jpg',
      title: 'Автомобили для путешествий',
      compilation: 'journey',
    },
    {
      imgSrc: './assets/img/pages/home/compilation3.jpg',
      title: 'Городские автомобили',
      compilation: 'city',
    },
  ];
  allFavorites = [];

  private _carService: CarsService;

  constructor(
    CarsService: CarsService,
    private favoriteService: FavoritesService
  ) {
    this._carService = CarsService;
  }

  ngOnInit() {
    this.getCars();

    this.favoriteService.getFavorites().subscribe(
      (res: any) => {
        this.allFavorites = res.favorites;
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  onFilterChanged(filterValues: any) {
    this.brand = filterValues.brand;
    this.priceMin = filterValues.priceRange.min;
    this.priceMax = filterValues.priceRange.max;
  }

  getCars() {
    this._carService.getCars().subscribe(
      (response: any) => {
        this.cars = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
