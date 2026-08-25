import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

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
    RouterLink,
    HeaderComponent,
    SearchBarComponent,
    CategoryListComponent,
    RestaurantCardComponent
  ],

  templateUrl: './home.component.html',

  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {


  // =========================================
  // RESTAURANTS
  // =========================================

  restaurants: Restaurant[] = [];


  // =========================================
  // UI STATE
  // =========================================

  isLoading = false;

  errorMessage = '';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private restaurantService: RestaurantService
  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.loadRestaurants();

  }


  // =========================================
  // LOAD RESTAURANTS
  // =========================================

  private loadRestaurants(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.restaurantService
      .getRestaurants()
      .subscribe({

        // -------------------------------------
        // SUCCESS
        // -------------------------------------

        next: (
          restaurants: Restaurant[]
        ) => {

          this.restaurants =
            restaurants;

          this.isLoading = false;


          console.log(
            'Restaurants loaded:',
            restaurants
          );

        },


        // -------------------------------------
        // ERROR
        // -------------------------------------

        error: error => {

          this.isLoading = false;


          console.error(
            'Restaurant API Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to load restaurants.';

        }

      });

  }

}