import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  isDropdownOpen = false;
  avatarUrl: any = '';

  @ViewChild('dropdown') dropdown!: ElementRef;
  @ViewChild('avatar') avatar!: ElementRef;

  constructor(private router: Router, private authService: AuthService) {}

ngOnInit() {
    this.authService.currentAvatar$.subscribe(avatar => {
      this.avatarUrl = avatar;
    });

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

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/register']);
    this.isDropdownOpen = false;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  get isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token ? this.isTokenValid(token) : false;
  }

  private isTokenValid(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      const decoded = JSON.parse(atob(payloadBase64));
      const exp = decoded.exp;

      return Date.now() < exp * 1000;
    } catch (e) {
      return false;
    }
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
}
