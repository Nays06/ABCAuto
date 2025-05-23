import { Component } from '@angular/core';
import { FilterComponent } from '../../components/filter/filter.component';
import { CarCardComponent } from '../../components/car-card/car-card.component';
import { CarsService } from '../../services/cars.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-catalog',
  imports: [FilterComponent, CarCardComponent, NgFor],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent {
  brand: any = '';
  priceMin: any = 0;
  priceMax: any = 0;
  driveType = ""
  bodyType = ""
  cars = []

  private _carService: CarsService;

  constructor(CarsService: CarsService) {
    this._carService = CarsService;
  }
  
  ngOnInit() {
    this.getCars();
  }

  onFilterChanged(filterValues: any) {
    console.log(filterValues);
    
    this.brand = filterValues.brand;
    this.priceMin = filterValues.priceRange.min;
    this.priceMax = filterValues.priceRange.max;
    this.driveType = filterValues.driveType
    this.bodyType = filterValues.bodyType
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
