import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-car-card',
  imports: [NgIf, NgFor],
  templateUrl: './car-card.component.html',
  styleUrl: './car-card.component.css',
})
export class CarCardComponent {
  @Input() car: any = {};
  @Input() favorites: any = [];
  isFavorite: boolean = false;

  constructor(
    private toast: HotToastService,
    private router: Router,
    private favoriteService: FavoritesService
  ) {}

  ngOnInit() {
    this.isFavorite = this.favorites?.some((fav: any) => fav.carId.toString() === this.car._id.toString());

  }

  showToast() {
    this.toast.error(this.car._id);
    this.router.navigate(['/car', this.car._id]);
  }

  currentSlideIndex = 0;
  readonly maxVisibleSlides = 5;

  get totalIndicators(): number {
    return Math.min(this.car.images.length, this.maxVisibleSlides);
  }

  onMouseMove(event: MouseEvent) {
    const element = event.currentTarget as HTMLElement;
    if (!element || this.car.images.length === 0) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percent = x / rect.width;

    this.currentSlideIndex = Math.min(
      Math.floor(
        percent * (this.car.images.length >= 5 ? 5 : this.car.images.length)
      ),
      this.car.images.length - 1
    );
  }

  resetSlide() {
    this.currentSlideIndex = 0;
  }

  getRemainingCount(): number {
    return this.car.images.length - this.maxVisibleSlides;
  }

  shouldShowRemaining(): boolean {
    return (
      this.car.images.length > this.maxVisibleSlides &&
      this.currentSlideIndex >= this.maxVisibleSlides - 1
    );
  }

  getImageSrc(): string {
    let imageIndex = this.currentSlideIndex;

    if (this.shouldShowRemaining()) {
      imageIndex = this.maxVisibleSlides - 1;
    }

    const imagePath = this.car.images[imageIndex];
    return imagePath.slice(0, imagePath.indexOf('\\')) === 'uploads'
      ? `http://localhost:5555/${imagePath}`
      : imagePath;
  }

  formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  toggleFavorite(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isFavorite) {
      this.favoriteService.addToFavorite(this.car._id).subscribe(
        (res: any) => {
          this.isFavorite = true;
          this.favoriteService.incrementCount();
        },
        (err: any) => {
          console.error(err);
          if(err.error.message === "Нет доступа") {
            this.toast.error("Для выполнение этого действия нужно быть авторизованным");
          }
        }
      );
    } else {
      this.favoriteService.removeFromFavorites(this.car._id).subscribe(
        (res: any) => {
          this.isFavorite = false;
          this.favoriteService.decrementCount();
        },
        (err: any) => {
          console.error(err);
        }
      );
    }
  }
}
