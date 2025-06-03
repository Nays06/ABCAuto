import { NgFor } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cars-empty',
  imports: [NgFor],
  templateUrl: './cars-empty.component.html',
  styleUrl: './cars-empty.component.css'
})
export class CarsEmptyComponent {

}
