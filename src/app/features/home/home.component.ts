import { Component, OnInit } from '@angular/core';

import { HeaderComponent }
  from '../../shared/components/header/header.component';

import { SearchBarComponent }
  from '../../shared/components/search-bar/search-bar.component';

import { CategoryListComponent }
  from '../../shared/components/category-list/category-list.component';

import { RestaurantCardComponent }
  from '../../shared/components/restaurant-card/restaurant-card.component';

import { Restaurant }
  from '../../shared/models/restaurant.model';

import { RestaurantService }
  from '../../core/services/restaurant.service';

@Component({
  selector: 'app-home',

  imports: [
    HeaderComponent,
    SearchBarComponent,
    CategoryListComponent,
    RestaurantCardComponent
  ],

  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  restaurants: Restaurant[] = [];


  constructor(
    private restaurantService: RestaurantService
  ) {}


  ngOnInit(): void {

    this.restaurants =
      this.restaurantService.getRestaurants();

  }

}