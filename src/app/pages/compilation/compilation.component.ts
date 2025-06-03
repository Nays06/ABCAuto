import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarsService } from '../../services/cars.service';
import { NgFor, NgIf } from '@angular/common';
import { FavoritesService } from '../../services/favorites.service';
import { CarCardComponent } from '../../components/car-card/car-card.component';
import { CarsEmptyComponent } from '../../components/cars-empty/cars-empty.component';

@Component({
  selector: 'app-compilation',
  imports: [NgIf, NgFor, CarCardComponent, CarsEmptyComponent],
  templateUrl: './compilation.component.html',
  styleUrl: './compilation.component.css',
})
export class CompilationComponent {
  type: any = '';
  cars = [];
  isLoading = true;
  allFavorites = [];
  compilations = [
    {
      title: 'Семейные автомобили',
      compilation: 'family',
      description:
        'Просторные салоны, повышенная безопасность и комфорт для поездок с детьми. В подборке: минивэны, внедорожники и универсалы с большим багажником.',
    },
    {
      title: 'Автомобили для путешествий',
      compilation: 'journey',
      description:
        'Надёжные автомобили для дальних дорог: полный привод, увеличенный клиренс и системы помощи водителю. Идеально для отпуска и поездок за город.',
    },
    {
      title: 'Городские автомобили',
      compilation: 'city',
      description:
        'Компактные, манёвренные и экономичные модели для повседневных поездок. Лёгкий паркинг, небольшой расход топлива и стильный дизайн.',
    },
  ];
  currentCompilation: any = {}

  constructor(
    private route: ActivatedRoute,
    private carService: CarsService,
    private favoriteService: FavoritesService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.type = this.route.snapshot.paramMap.get('type');

    if (this.type) {
      this.currentCompilation = this.compilations.find(el => el.compilation === this.type)

      console.log(this.currentCompilation);

      if (!this.currentCompilation) {
        this.router.navigate(['/compilation', 'family'])

        this.type = 'family'
        this.currentCompilation = this.compilations.find(el => el.compilation === this.type)
      }

      await this.carService
        .getCars(`?compilation=${this.type}&limit=52`)
        .subscribe(
          (res: any) => {
            this.isLoading = true;
            this.cars = res;
            this.isLoading = false;
          },
          (err: any) => {
            console.error(err);
          }
        );
    }

    this.favoriteService.getFavorites().subscribe(
      (res: any) => {
        this.allFavorites = res.favorites;
      },
      (err: any) => {
        console.error(err);
      }
    );
  }
}
