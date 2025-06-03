import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-review-modal',
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './review-modal.component.html',
  styleUrls: ['./review-modal.component.css'],
})
export class ReviewModalComponent {
  @Input() isOpen: boolean = false;
  @Input() data: { seller: any; car: any } = {
    seller: {},
    car: {},
  };
  @Output() close = new EventEmitter<void>();

  rating: number = 0;
  comment: string = '';

  constructor(private reviewService: ReviewService, private toast: HotToastService) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isOpen) {
      this.closeModal();
    }
  }

  setRating(star: number): void {
    this.rating = star;
  }

  closeModal(): void {
    this.rating = 0
    this.comment = ""
    this.close.emit();
  }

  submitReview(): void {
    if (this.rating && this.comment.length >= 10) {
      this.reviewService.addReview({
        seller: this.data.seller._id,
        car: this.data.car._id,
        rating: this.rating,
        comment: this.comment,
      }).subscribe(
        (res: any) => {
          this.toast.success(res.message)
        },
        (err: any) => {
          this.toast.error(err.error.message)
          console.error(err);
        }
      )
      this.closeModal();
    }
  }
}
