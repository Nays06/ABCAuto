import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { FavoritesService } from './services/favorites.service';
import { AuthService } from './services/auth.service';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  constructor(private favoriteService: FavoritesService, private authService: AuthService, private socketService: SocketService) {
    this.favoriteService.getFavorites().subscribe(
      (res: any) => {
        favoriteService.setCount(res.favorites.length);
      },
      (err) => {
        console.error(err);
      }
    );
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
