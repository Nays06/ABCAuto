import { Component } from '@angular/core';
import { FavoritesService } from '../../services/favorites.service';
import { CarCardComponent } from '../../components/car-card/car-card.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-favorites',
  imports: [CarCardComponent, NgFor],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent {
  cars = []
  allFavorites = [];

  constructor(private favoriteService: FavoritesService) { }

  ngOnInit(){
    this.favoriteService.getFavoriteCars().subscribe(
      (res: any) => {
        this.cars = res
      },
      (err: any) => {
        console.error(err);
      }
    )

    this.favoriteService.getFavorites().subscribe(
      (res: any) => {
        this.allFavorites = res.favorites;
      },
      (err: any) => {
        console.error(err);
      }
    );
  }
}
