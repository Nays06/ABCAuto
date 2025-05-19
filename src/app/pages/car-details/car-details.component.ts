import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarsService } from '../../services/cars.service';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-car-details',
  imports: [NgIf, NgFor, MatIconModule],
  templateUrl: './car-details.component.html',
  styleUrl: './car-details.component.css',
})
export class CarDetailsComponent {
  constructor(
    private route: ActivatedRoute,
    private carService: CarsService,
    private authService: AuthService,
    private router: Router
  ) {}

  id: any = '';
  car: any = {};
  currentImageIndex = 0;
  isCurrentUserCar: boolean = false;

  async ngOnInit(): Promise<void> {
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      await this.carService.getCarDetails(this.id).subscribe(
        (res: any) => {
          this.car = res.data;

          this.authService.getUserID().subscribe(
            (res: any) => {
              if (res.message === 'Успешно') {
                this.isCurrentUserCar = res.id === this.car.sellerId;
              }
            },
            (err: any) => {
              console.error(err);
            }
          );
        },
        (err: any) => {
          console.error(err);
        }
      );
    }
  }

  changeMainImage(index: number): void {
    this.currentImageIndex = index;
  }

  formatPrice(price: number): string {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  goToEdit() {
    this.router.navigate(['/car/edit', this.car._id]);
  }

  deleteCar() {
    const needToDeleteCar = confirm(
      'Вы действительно хотите удалить этот автомобиль?'
    );

    if (needToDeleteCar) {
      this.carService.deleteCar(this.car._id).subscribe(
        (res: any) => {
          alert('Автомобиль успешно удален!');
          this.router.navigate(['/']);
        },
        (err: any) => {
          alert('Произошла ошибка при удалении автомобиля, попробуйте позже');
          console.log(err);
        }
      );
    }
  }
}
