import { Component } from '@angular/core';
import { VideoSliderComponent } from '../../components/video-slider/video-slider.component';
import { CarsService } from '../../services/cars.service';
import { CarCardComponent } from '../../components/car-card/car-card.component';
import { FilterComponent } from '../../components/filter/filter.component';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FavoritesService } from '../../services/favorites.service';
import { CarsEmptyComponent } from "../../components/cars-empty/cars-empty.component";
import { Router } from '@angular/router';
import { PostsService } from '../../services/posts.service';

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
  posts: any = []
  allFavorites = [];

  private _carService: CarsService;

  constructor(
    CarsService: CarsService,
    private favoriteService: FavoritesService,
    private router: Router,
    private postsService: PostsService
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

    this.postsService.getPosts().subscribe(
      (res: any) => {
        this.posts = res
      }
    )
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
    this._carService.getCars("?available=true").subscribe(
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

  formatDate(dateString: Date): string {
    const monthNames = [
      'янв',
      'фев',
      'мар',
      'апр',
      'мая',
      'июн',
      'июл',
      'авг',
      'сен',
      'окт',
      'ноя',
      'дек',
    ];
    const date = new Date(dateString)
    const mskDate = new Date(date.getTime());
    // const inputDate = this.getMskDateWithoutTime(mskDate);
    // date = new Date(date.getTime() + 3 * 60 * 60 * 1000)
    return `${mskDate.getDate()} ${monthNames[mskDate.getMonth()]} ${mskDate.getFullYear()}`;
  }
}
