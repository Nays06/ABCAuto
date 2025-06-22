import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../../services/posts.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { CarsService } from '../../services/cars.service';
import { Router } from '@angular/router';

type AdminTab = 'posts' | 'cars' | 'users';

@Component({
  selector: 'app-admin-panel',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css',
})
export class AdminPanelComponent {
  activeTab: AdminTab = 'posts';

  posts: any = [];
  postTitle: any = '';
  postText: any = '';
  postFile: File | null = null
  cars: any = [];
  demoUsers = [1, 2, 3];

  // categories = [
  //   { value: 'news', label: 'Новости' },
  //   { value: 'tips', label: 'Советы' },
  //   { value: 'reviews', label: 'Обзоры' },
  // ];

  years = [2023, 2022, 2021];
  ratingStars = [1, 2, 3, 4, 5];
  carModels = ['BMW 5 Series', 'Audi A6', 'Mercedes E-class'];

  // selectedCategory = this.categories[0].value;
  selectedYear = this.years[0];
  selectedRating = this.ratingStars[3];
  selectedCarModel = this.carModels[0];

  constructor(
    private postsService: PostsService,
    private carsService: CarsService,
    private toast: HotToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.postsService.getPosts().subscribe((res: any) => {
      this.posts = res;
    });

    this.carsService.getCars().subscribe((res: any) => {
      this.cars = res
    })
  }

  switchTab(tab: AdminTab): void {
    this.activeTab = tab;
  }

  isTabActive(tab: AdminTab): boolean {
    return this.activeTab === tab;
  }

  postForm = {
    title: '',
    content: '',
    category: 'news',
    image: null as File | null,
  };

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.toast.error('Тип выбранного файла не подходит');
      } else if (file.size > 3 * 1024 * 1024) {
        this.toast.error('Файл не должен превышать 3мб');
      } else {
        this.postFile = file
      }
    }
  }

  submitPost() {
    if(!this.postText || !this.postTitle || !this.postFile) {
      return this.toast.error("Не все поля заполенены")
    }

    const formData = new FormData();
    formData.append('title', this.postTitle);
    formData.append('text', this.postText);
    formData.append('img', this.postFile);
    this.postsService.addPost(formData).subscribe(
      (res: any) => {
        this.toast.success("Пост успешно опубликован")
        this.posts.unshift(res.post)
        this.postFile = null
        this.postTitle = ""
        this.postText = ""
      },
      (err: any) => {
        console.error(err);
      }
    )
    return
  }

  editPost() {
    this.toast.info("Себя отредактируй, я идеал")
  }

  deletePost(id: string) {
    this.postsService.deletePost(id).subscribe(
      (res: any) => {
        this.toast.success(res.message)
        this.posts = this.posts.filter((el: any) => el._id !== id)
      },
      (err: any) => {
        console.error(err);
        this.toast.error(err.message || "Ошибка при удалении поста")
      }
    )
  }

  editCar(id: string) {
    this.router.navigate(["/car/edit", id])
  }

  deleteCar(id: string) {
    const needToDeleteCar = confirm(
      'Вы действительно хотите удалить этот автомобиль?'
    );

    if (needToDeleteCar) {
      this.carsService.deleteCar(id).subscribe(
        (res: any) => {
          alert('Автомобиль успешно удален!');
          this.cars = this.cars.filter((el: any) => el._id !== id)
        },
        (err: any) => {
          alert('Произошла ошибка при удалении автомобиля, попробуйте позже');
          console.log(err);
        }
      );
    }
  }

  carFilter = {
    brand: '',
    model: '',
    year: 'any',
  };

  applyCarFilter(): void {
    console.log('Применение фильтра:', this.carFilter);
  }

  changeUserRole(userId: number, newRole: string): void {
    console.log(`Изменение роли пользователя ${userId} на ${newRole}`);
  }

  formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}
