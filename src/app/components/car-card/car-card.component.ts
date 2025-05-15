import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-car-card',
  imports: [NgIf, NgFor],
  templateUrl: './car-card.component.html',
  styleUrl: './car-card.component.css',
})
export class CarCardComponent {
  @Input() car: any = {};

  constructor(private toast: HotToastService) {}

  showToast() {
    this.toast.error('123123');
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

  formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}
