import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd  } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { FavoritesService } from './services/favorites.service';
import { AuthService } from './services/auth.service';
import { SocketService } from './services/socket.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
    hideHeaderFooter = false;

  constructor(private favoriteService: FavoritesService, private authService: AuthService, private socketService: SocketService, private router: Router) {
    this.favoriteService.getFavorites().subscribe(
      (res: any) => {
        favoriteService.setCount(res.favorites.length);
      },
      (err) => {
        console.error(err);
      }
    );

    this.authService.getBalance().subscribe(
      (res: any) => {
        this.authService.updateBalance(res)
      }
    )

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.hideHeaderFooter = this.router.url.includes('hack');
      }
    });
  }

  ngOnInit() {
    this.authService.getUserID().subscribe(
      (res: any) => {
        if(res.message === "Успешно") {
          this.socketService.setUserOnline(res.id)
        }
      },
      (err: any) => {
        console.error(err);
      }
    )
  }
}
