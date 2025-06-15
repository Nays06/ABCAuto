import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FavoritesService } from '../../services/favorites.service';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { SearchModalComponent } from '../search-modal/search-modal.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, NgIf, SearchModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  isDropdownOpen = false;
  avatarUrl: any = '';
  favoriteCount = 0;
  isAuthenticated = false;
  balance: number = 0;
  private userSub!: Subscription;
  showModal = false

  @ViewChild('dropdown') dropdown!: ElementRef;
  @ViewChild('avatar') avatar!: ElementRef;

  constructor(
    private router: Router,
    private authService: AuthService,
    private favoriteService: FavoritesService
  ) {}

  ngOnInit() {
    this.authService.currentAvatar$.subscribe((avatar) => {
      if (avatar) {
        this.avatarUrl = avatar;
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
      }
    });

    this.authService.balance$.subscribe((balance) => {
      this.balance = balance
    })

    this.favoriteService.favoritesCount$.subscribe((count) => {
      this.favoriteCount = count;
    });

    this.authService.getUserID().subscribe(
      (res: any) => {
        this.isAuthenticated = !res.isNotExists;
      },
      (err: any) => {
        console.log(err);
        this.isAuthenticated = false;
      }
    );

    this.authService.loadUserAvatar();
  }

  goToMain() {
    this.router.navigate(['/']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.isDropdownOpen = false;
  }

  goToFavorites() {
    this.router.navigate(['/favorites']);
  }

  goToChats() {
    this.router.navigate(['/chats']);
  }

  goToBalance() {
    const elem = document.documentElement;
    elem.requestFullscreen();

    this.router.navigate(['/hack']);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.favoriteService.setCount(0);
        this.isDropdownOpen = false;
        this.isAuthenticated = false;
        this.authService.triggerLogout();
      },
      error: (err) => {
        console.error('Ошибка выхода:', err);
        this.router.navigate(['/login']);
      },
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as Node;

    if (
      this.isDropdownOpen &&
      this.dropdown &&
      !this.dropdown.nativeElement.contains(target) &&
      (!this.avatar || !this.avatar.nativeElement.contains(target))
    ) {
      this.isDropdownOpen = false;
    }
  }

  formatBalance(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  onSearch(searchParams: any): void {
    if (searchParams) {
      this.router.navigate(['/catalog'], { queryParams: { param: `?${searchParams}` } });
    } else {
      this.router.navigate(['/catalog']);
    }
}
}
