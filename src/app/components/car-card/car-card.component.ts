import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-car-card',
  imports: [NgIf, NgFor],
  templateUrl: './car-card.component.html',
  styleUrl: './car-card.component.css',
})
export class CarCardComponent {
  @Input() carImages: string[] = [];
  @Input() carName: string = '';

  currentSlideIndex = 0;
  readonly maxVisibleSlides = 5; // Максимум 5 фото + 1 индикатор "Еще X"

  // Для удобства в шаблоне
  get totalIndicators(): number {
    return Math.min(this.carImages.length, this.maxVisibleSlides);
  }

  onMouseMove(event: MouseEvent) {
    const element = event.currentTarget as HTMLElement;
    if (!element || this.carImages.length === 0) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percent = x / rect.width;

    // 0 → 0%, 1 → 20%, 2 → 40%, 3 → 60%, 4 → 80%
    this.currentSlideIndex = Math.min(
      Math.floor(percent * 5),
      this.carImages.length - 1
    );
  }

  resetSlide() {
    this.currentSlideIndex = 0;
  }

  getRemainingCount(): number {
    return this.carImages.length - this.maxVisibleSlides;
  }

  // Показывать ли надпись "Еще X" (для 5-го слайда, если фото больше 5)
  shouldShowRemaining(): boolean {
    return (
      this.carImages.length > this.maxVisibleSlides &&
      this.currentSlideIndex >= this.maxVisibleSlides - 1
    );
  }
}
