import {
  Component,
  Directive,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarsService } from '../../services/cars.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { ReviewModalComponent } from '../../components/review-modal/review-modal.component';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';

@Directive({
  selector: 'textarea[autoResize]',
  standalone: true,
})
export class AutoResizeTextareaDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input') onInput() {
    this.resize();
  }

  ngOnInit() {
    this.el.nativeElement.style.height = '41px';
    this.resize();
  }

  public resize() {
    const textarea = this.el.nativeElement;
    textarea.style.height = '41px';
    textarea.style.height = `${Math.max(textarea.scrollHeight, 41)}px`;
  }
}

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    FormsModule,
    AutoResizeTextareaDirective,
    ReviewModalComponent,
  ],
  templateUrl: './car-details.component.html',
  styleUrl: './car-details.component.css',
})
export class CarDetailsComponent {
  @ViewChild(AutoResizeTextareaDirective)
  textareaDirective!: AutoResizeTextareaDirective;
  constructor(
    private route: ActivatedRoute,
    private carService: CarsService,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router,
    private toast: HotToastService,
    private socketService: SocketService
  ) {
    this.socketService.requestAllUserStatuses();
  }

  private statusSubscription!: Subscription;

  id: any = '';
  car: any = {};
  seller: any = {};
  sale: any = {};
  currentImageIndex = 0;
  isCurrentUserCar: boolean = false;
  isSellerOnline: boolean = false;
  haveReview = false;
  myId = '';
  message = 'Здравствуйте! ';
  messageHints = [
    'Где и когда можно посмотреть? ',
    'Ещё продаёте? ',
    'Скажите, торг уместен? ',
    'Предподавателям скидка есть? ',
  ];
  wasBuying = false;
  isReviewModalOpen: boolean = false;

  openModal(): void {
    this.isReviewModalOpen = true;
  }

  closeModal(): void {
    this.isReviewModalOpen = false;
  }

  sendMessage() {
    this.chatService.sendMessageWithOutChatId({
      advertisementId: this.car._id,
      buyerId: this.myId,
      sellerId: this.car.sellerId,
      senderId: this.myId,
      recipientId: this.car.sellerId,
      content: this.message.trim(),
    });
  }

  useHint(messageHint: String) {
    this.message += messageHint;
    this.messageHints = this.messageHints.filter((el) => el != messageHint);

    setTimeout(() => {
      this.textareaDirective.resize();
    }, 10);
  }

  async ngOnInit(): Promise<void> {
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      await this.carService.getCarDetails(this.id).subscribe(
        (res: any) => {
          this.car = res.carData;
          this.seller = res.sellerData;
          this.sale = res.saleInfo;
          this.haveReview = res.haveReview;
          console.log(res);

          this.statusSubscription = this.socketService
            .getUserStatus(this.seller._id)
            .subscribe({
              next: (isOnline) => {
                console.log('Статус пользователя:', isOnline, this.seller._id);
                this.isSellerOnline = isOnline;
              },
              error: (err) => {
                console.error('Ошибка получения статуса:', err);
              },
            });

          this.socketService.requestUserStatus(this.seller._id);

          this.authService.getUserID().subscribe(
            (res: any) => {
              if (res.message === 'Успешно') {
                this.isCurrentUserCar = res.id === this.car.sellerId;
                this.myId = res.id;
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

  goToProfile(id: string) {
    this.router.navigate(['/profile', id]);
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

  buyCar() {
    this.carService.buyCar(this.car._id).subscribe(
      (res: any) => {
        this.toast.success(
          `Поздравляем! Вы купили ${this.car.brand} ${
            this.car.model
          } за ${this.formatPrice(this.car.price)} ₽`
        );
        this.authService.updateBalance(res.newBalance);
        this.car.available = false;
        this.sale = res.saleInfo;
      },
      (err: any) => {
        console.error(err);
        this.toast.error(err.error.message);
      }
    );
  }

  ngOnDestroy() {
    this.statusSubscription.unsubscribe();
  }
}
