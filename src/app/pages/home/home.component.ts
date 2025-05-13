import { Component } from '@angular/core';
import { VideoSliderComponent } from '../../components/video-slider/video-slider.component';
import { CarsService } from '../../services/cars.service';
import { OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { CarCardComponent } from '../../components/car-card/car-card.component';
import { FilterComponent } from '../../components/filter/filter.component';

@Component({
  selector: 'app-home',
  imports: [VideoSliderComponent, NgFor, CarCardComponent, FilterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {

}
