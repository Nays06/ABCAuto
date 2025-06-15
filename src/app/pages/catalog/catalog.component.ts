import { Component } from '@angular/core';
import { FilterComponent } from '../../components/filter/filter.component';
import { CarCardComponent } from '../../components/car-card/car-card.component';
import { CarsService } from '../../services/cars.service';
import { NgFor, NgIf } from '@angular/common';
import { FavoritesService } from '../../services/favorites.service';
import { CarsEmptyComponent } from "../../components/cars-empty/cars-empty.component";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-catalog',
  imports: [FilterComponent, CarCardComponent, NgFor, NgIf, CarsEmptyComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent {
  cars = []
  allFavorites = [];
  isLoading = true

  private _carService: CarsService;

  constructor(CarsService: CarsService, private favoriteService: FavoritesService, private route: ActivatedRoute) {
    this._carService = CarsService;
  }
  
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const queryParams = params['param']
      if (!queryParams) {
        this.getCars();
      }
    });
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
    this.isLoading = true
    this.cars = filterCars.cars
    this.isLoading = false
  }

  getCars() {
    this._carService.getCars("?limit=24").subscribe(
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
