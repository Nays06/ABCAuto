import { Component } from '@angular/core';
import { FilterComponent } from '../../components/filter/filter.component';
import { CarCardComponent } from '../../components/car-card/car-card.component';
import { CarsService } from '../../services/cars.service';
import { NgFor } from '@angular/common';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-catalog',
  imports: [FilterComponent, CarCardComponent, NgFor],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent {
  cars = []
  allFavorites = [];

  private _carService: CarsService;

  constructor(CarsService: CarsService, private favoriteService: FavoritesService) {
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
    this.cars = filterCars
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
