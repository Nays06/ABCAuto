import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarsService } from '../../services/cars.service';
import { Location, NgFor } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-filter',
  imports: [FormsModule, NgFor, NgSelectModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent {
  brands: any[] = [];
  filterValues: any = {
    brand: null,
    priceRange: { min: 0, max: 1000000 },
    driveType: { name: '' },
    bodyType: { name: '' },
  };
  filterQuery = '';
  driveTypes = [
    { name: 'AWD' },
    { name: 'FWD' },
    { name: '4WD' },
    { name: 'RWD' },
  ];
  bodyTypes = [
    { name: 'SUV' },
    { name: 'Sedan' },
    { name: 'Coupe' },
    { name: 'Pickup' },
    { name: 'Crossover' },
    { name: 'Hatchback' },
    { name: 'Wagon' },
    { name: 'Van' },
    { name: 'Truck' },
    { name: 'Convertible' },
  ];
  cars: any = [];

  get bodyTypeModel() {
    return this.filterValues?.bodyType?.name || null;
  }

  set bodyTypeModel(value: any) {
    this.filterValues.bodyType = value;
  }

  get driveTypeModel() {
    return this.filterValues?.driveType?.name || null;
  }

  set driveTypeModel(value: any) {
    this.filterValues.driveType = value;
  }

  log() {
    this._carService.getCars(this.filterQuery).subscribe(
      (res: any) => {
        this.cars = res;
        this.filteredCars.emit({ cars: this.cars, query: this.filterQuery });
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  private _carService: CarsService;

  constructor(CarsService: CarsService, private route: ActivatedRoute, private location: Location) {
    this._carService = CarsService;
  }

  @Output() filteredCars = new EventEmitter<any>();

  selectBrand(brand: any) {
    if (this.filterValues.brand !== brand) {
      this.filterValues.brand = brand;
    } else {
      this.filterValues.brand = null;
    }
    this.buildFilterQuery();
  }

  applyFilter() {
    this.buildFilterQuery();
  }

  resetFilter() {
    this.filterValues = {
      brand: null,
      priceRange: { min: 0, max: 1000 },
      driveType: { name: '' },
      bodyType: { name: '' },
    };
    this.buildFilterQuery();
    this.filteredCars.emit(this.filterValues);
  }

  ngOnInit() {
    this.getBrands();
    this.buildFilterQuery();

    this.route.queryParams.subscribe((params) => {
      const queryParams = params['param']
      if (queryParams) {
        const params = new URLSearchParams(queryParams.substring(1));
        this.filterValues.brand = params.get('brand') || null
        this.filterValues.driveType = params.get('driveType') ? { name: params.get('driveType') } : null
        this.filterValues.bodyType = params.get('bodyType') ? { name: params.get('bodyType') } : null

        const priceParam = params.get('price');
        if (priceParam && priceParam.includes('-')) {
          const [min, max] = priceParam.split('-').map(Number);
          this.filterValues.priceRange = { min, max };
        }

        this._carService.getCars(queryParams + "&limit=24").subscribe(
          (res: any) => {
            this.cars = res;
            this.filteredCars.emit(this.cars);
            this.clearQueryParams()
          },
          (err: any) => {
            console.error(err);
          }
        );
      }
    });
  }

  clearQueryParams() {
    console.log("careref");
    
  const pathWithoutParams = this.location.path().split('?')[0];
  this.location.replaceState(pathWithoutParams);
}


  getBrands() {
    this._carService.getBrands().subscribe(
      (response: any) => {
        this.brands = response;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  private buildFilterQuery() {
    const queryParts = [];

    if (this.filterValues.brand) {
      queryParts.push(`brand=${encodeURIComponent(this.filterValues.brand)}`);
    }

    if (
      (this.filterValues.priceRange.min !== 0 ||
        this.filterValues.priceRange.max !== 0) &&
      (this.filterValues.priceRange.min || this.filterValues.priceRange.max)
    ) {
      queryParts.push(
        `price=${this.filterValues.priceRange.min}-${this.filterValues.priceRange.max}`
      );
    }

    if (this.filterValues?.driveType?.name) {
      queryParts.push(
        `driveType=${encodeURIComponent(this.filterValues.driveType.name)}`
      );
    }

    if (this.filterValues?.bodyType?.name) {
      queryParts.push(
        `bodyType=${encodeURIComponent(this.filterValues.bodyType.name)}`
      );
    }

    this.filterQuery = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  }
}
