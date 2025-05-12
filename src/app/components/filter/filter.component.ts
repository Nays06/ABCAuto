// filter.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarsService } from '../../services/cars.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-filter',
  imports: [FormsModule, NgFor],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent {
  brands: any[] = [];
  filterValues = {
    brand: '',
    priceRange: { min: 0, max: 1000000 }
  };

  
  private _carService: CarsService;

  constructor(CarsService: CarsService) {
    this._carService = CarsService;
  }

  @Output() filterChanged = new EventEmitter<any>();

  selectBrand(brand: any){
    this.filterValues.brand = brand
    this.applyFilter()
  }

  applyFilter() {
    this.filterChanged.emit(this.filterValues);
  }

  resetFilter() {
    this.filterValues = {
      brand: '',
      priceRange: { min: 0, max: 1000 }
    };
    this.filterChanged.emit(this.filterValues);
  }

  log(){
    console.log(123);
    
  }

  ngOnInit() {
    this.getBrands();
  }

  getBrands() {
    this._carService.getBrands().subscribe(
      (response: any) => {
        this.brands = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }
}