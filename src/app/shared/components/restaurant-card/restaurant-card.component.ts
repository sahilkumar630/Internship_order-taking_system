import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Restaurant }
  from '../../models/restaurant.model';

@Component({
  selector: 'app-restaurant-card',
  imports: [RouterLink],
  templateUrl: './restaurant-card.component.html',
  styleUrl: './restaurant-card.component.css'
})
export class RestaurantCardComponent {

  @Input({ required: true })
  restaurant!: Restaurant;

}