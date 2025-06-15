import { Component } from '@angular/core';
import { VideoSliderComponent } from '../../components/video-slider/video-slider.component';
import { CarsService } from '../../services/cars.service';
import { CarCardComponent } from '../../components/car-card/car-card.component';
import { FilterComponent } from '../../components/filter/filter.component';
import { NgFor, NgIf } from '@angular/common';
import { FavoritesService } from '../../services/favorites.service';
import { CarsEmptyComponent } from "../../components/cars-empty/cars-empty.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [VideoSliderComponent, FilterComponent, CarCardComponent, NgFor, NgIf, CarsEmptyComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  brand = '';
  priceMin: any = 0;
  priceMax: any = 0;
  cars = [];
  isLoading = true
  filterQuery = ""
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
    private favoriteService: FavoritesService,
    private router: Router
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

  onFilterChanged(filterCars: any) {
    this.cars = filterCars.cars
    this.filterQuery = filterCars.query
    console.log(this.filterQuery);
  }

  goTocatalog() {
    if (this.filterQuery) {
      this.router.navigate(['/catalog'], { queryParams: { param: this.filterQuery } });
    } else {
      this.router.navigate(['/catalog']);
    }
  }

  goToCompilation(type: string) {
    this.router.navigate(['/compilation', type]);
  }

  getCars() {
    this._carService.getCars().subscribe(
      (response: any) => {
        this.isLoading = true
        this.cars = response;
        this.isLoading = false
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
