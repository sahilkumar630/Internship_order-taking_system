import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { RestaurantCardComponent }
  from '../../../shared/components/restaurant-card/restaurant-card.component';

import { Restaurant }
  from '../../../shared/models/restaurant.model';

import { RestaurantService }
  from '../../../core/services/restaurant.service';

import { LocationService }
  from '../../../core/services/location.service';

import { CartService }
  from '../../../core/services/cart.service';


@Component({
  selector: 'app-restaurant-list',

  imports: [
    FormsModule,
    RouterLink,
    RestaurantCardComponent
  ],

  templateUrl: './restaurant-list.component.html',

  styleUrl: './restaurant-list.component.css'
})
export class RestaurantListComponent implements OnInit {


  // =========================================
  // RESTAURANTS
  // =========================================

  restaurants: Restaurant[] = [];

  filteredRestaurants: Restaurant[] = [];


  // =========================================
  // LOCATION
  // =========================================

  selectedLocationName = '';


  // =========================================
  // SEARCH
  // =========================================

  searchTerm = '';


  // =========================================
  // UI STATE
  // =========================================

  isLoading = false;

  errorMessage = '';


  // =========================================
  // CART
  // =========================================

  cartItemCount = 0;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private restaurantService: RestaurantService,

    private locationService: LocationService,

    private cartService: CartService,

    private router: Router

  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.updateCartCount();

    this.loadLocation();

    this.loadRestaurants();

  }


  // =========================================
  // LOAD LOCATION
  // =========================================

  private loadLocation(): void {

    const location =
      this.locationService.getLocation();


    // -----------------------------------------
    // LOCATION NOT AVAILABLE
    // -----------------------------------------

    if (!location) {

      this.router.navigate([
        '/location'
      ]);

      return;

    }


    // -----------------------------------------
    // LOCATION NAME
    // -----------------------------------------

    this.selectedLocationName =
      location.address ||
      'Your location';

  }


  // =========================================
  // LOAD RESTAURANTS
  // =========================================

  loadRestaurants(): void {

    const location =
      this.locationService.getLocation();


    // -----------------------------------------
    // LOCATION NOT AVAILABLE
    // -----------------------------------------

    if (!location) {

      this.router.navigate([
        '/location'
      ]);

      return;

    }


    // -----------------------------------------
    // UPDATE LOCATION
    // -----------------------------------------

    this.selectedLocationName =
      location.address ||
      'Your location';


    // -----------------------------------------
    // RESET STATE
    // -----------------------------------------

    this.isLoading = true;

    this.errorMessage = '';

    this.restaurants = [];

    this.filteredRestaurants = [];


    // -----------------------------------------
    // API REQUEST
    // -----------------------------------------

    this.restaurantService

      .getNearbyRestaurants(
        location.latitude,
        location.longitude
      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next: (
          restaurants: Restaurant[]
        ) => {

          this.restaurants =
            restaurants || [];


          this.filteredRestaurants =
            [...this.restaurants];


          this.isLoading = false;


          console.log(
            'Restaurants loaded:',
            this.restaurants
          );

        },


        // =====================================
        // ERROR
        // =====================================

        error: error => {

          this.isLoading = false;


          console.error(
            'Restaurant List API Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to load restaurants near your location.';

        }

      });

  }


  // =========================================
  // FILTER RESTAURANTS
  // =========================================

  filterRestaurants(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    // -----------------------------------------
    // EMPTY SEARCH
    // -----------------------------------------

    if (!search) {

      this.filteredRestaurants =
        [...this.restaurants];

      return;

    }


    // -----------------------------------------
    // SEARCH
    // -----------------------------------------

    this.filteredRestaurants =
      this.restaurants.filter(
        restaurant => {

          const name =
            restaurant.name
              ?.toLowerCase() || '';


          return name.includes(search);

        }
      );

  }


  // =========================================
  // CLEAR SEARCH
  // =========================================

  clearSearch(): void {

    this.searchTerm = '';

    this.filteredRestaurants =
      [...this.restaurants];

  }


  // =========================================
  // CHANGE LOCATION
  // =========================================

  changeLocation(): void {

    this.router.navigate([
      '/location'
    ]);

  }


  // =========================================
  // UPDATE CART COUNT
  // =========================================

  updateCartCount(): void {

    this.cartItemCount =
      this.cartService.getItemCount();

  }


  // =========================================
  // GO TO CART
  // =========================================

  goToCart(): void {

    this.router.navigate([
      '/cart'
    ]);

  }

}