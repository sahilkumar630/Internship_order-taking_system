import {
  Component,
  OnInit
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

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

import { MenuItem }
  from '../../shared/models/menu-item.model';

import { RestaurantService }
  from '../../core/services/restaurant.service';

import { LocationService }
  from '../../core/services/location.service';

import { UserLocation }
  from '../../shared/models/location.model';


@Component({
  selector: 'app-home',

  imports: [
    RouterLink,
    HeaderComponent,
    SearchBarComponent,
    CategoryListComponent,
    RestaurantCardComponent
  ],

  templateUrl:
    './home.component.html',

  styleUrl:
    './home.component.css'
})
export class HomeComponent
  implements OnInit {


  // =========================================
  // FOOD ITEMS
  // =========================================

  foodItems: MenuItem[] = [];


  // =========================================
  // RESTAURANTS
  // =========================================

  restaurants: Restaurant[] = [];


  // =========================================
  // USER LOCATION
  // =========================================

  selectedLocation:
    UserLocation | null = null;

  selectedLocationName =
    '';


  // =========================================
  // FOOD UI STATE
  // =========================================

  isLoadingFood =
    false;

  foodErrorMessage =
    '';


  // =========================================
  // RESTAURANT UI STATE
  // =========================================

  isLoadingRestaurants =
    false;

  restaurantErrorMessage =
    '';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private restaurantService:
      RestaurantService,

    private locationService:
      LocationService,

    private router:
      Router

  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.loadSavedLocation();

  }


  // =========================================
  // LOAD SAVED LOCATION
  // =========================================

  private loadSavedLocation(): void {

    const location =
      this.locationService.getLocation();


    // =========================================
    // NO LOCATION
    //
    // New user can browse Home normally.
    // =========================================

    if (!location) {

      this.selectedLocation =
        null;

      this.selectedLocationName =
        '';

      this.foodItems =
        [];

      this.restaurants =
        [];

      console.log(
        'No saved location found. Showing location-independent Home content.'
      );

      return;

    }


    // =========================================
    // LOCATION EXISTS
    // =========================================

    this.selectedLocation =
      location;

    this.selectedLocationName =
      location.address ||
      'Your location';


    console.log(
      'Saved User Location:',
      location
    );


    // =========================================
    // LOAD LOCATION BASED CONTENT
    // =========================================

    this.loadLocationBasedContent();

  }


  // =========================================
  // LOAD LOCATION BASED CONTENT
  // =========================================

  private loadLocationBasedContent(): void {

    const location =
      this.locationService.getLocation();


    // =========================================
    // LOCATION NOT AVAILABLE
    // =========================================

    if (!location) {

      this.selectedLocation =
        null;

      this.selectedLocationName =
        '';

      this.foodItems =
        [];

      this.restaurants =
        [];

      return;

    }


    // =========================================
    // UPDATE LOCATION
    // =========================================

    this.selectedLocation =
      location;

    this.selectedLocationName =
      location.address ||
      'Your location';


    // =========================================
    // LOAD POPULAR FOOD
    // =========================================

    this.loadNearbyFood();


    // =========================================
    // LOAD NEARBY RESTAURANTS
    // =========================================

    this.loadNearbyRestaurants();

  }


  // =========================================
  // LOAD NEARBY FOOD
  //
  // Uses:
  //
  // GET /api/FoodItem/near-by
  // =========================================

  loadNearbyFood(): void {

    const location =
      this.locationService.getLocation();


    // =========================================
    // LOCATION NOT AVAILABLE
    // =========================================

    if (!location) {

      this.foodItems =
        [];

      this.isLoadingFood =
        false;

      return;

    }


    // =========================================
    // UPDATE LOCATION
    // =========================================

    this.selectedLocation =
      location;

    this.selectedLocationName =
      location.address ||
      'Your location';


    // =========================================
    // RESET STATE
    // =========================================

    this.isLoadingFood =
      true;

    this.foodErrorMessage =
      '';

    this.foodItems =
      [];


    // =========================================
    // API REQUEST
    // =========================================

    console.log(
      'Loading nearby food:',
      {
        latitude:
          location.latitude,

        longitude:
          location.longitude
      }
    );


    this.restaurantService

      .getNearbyFoodItems(

        location.latitude,

        location.longitude

      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next:
          (items: MenuItem[]) => {

            this.foodItems =
              items || [];

            this.isLoadingFood =
              false;


            console.log(
              'Nearby Food Items Loaded:',
              this.foodItems
            );

          },


        // =====================================
        // ERROR
        // =====================================

        error:
          error => {

            this.isLoadingFood =
              false;


            console.error(
              'Nearby Food API Error:',
              error
            );


            this.foodErrorMessage =
              error?.error?.message ||
              'Unable to load food items near your location.';

          }

      });

  }


  // =========================================
  // LOAD NEARBY RESTAURANTS
  //
  // Only restaurants available around
  // the selected location are displayed.
  // =========================================

  loadNearbyRestaurants(): void {

    const location =
      this.locationService.getLocation();


    // =========================================
    // LOCATION NOT AVAILABLE
    // =========================================

    if (!location) {

      this.restaurants =
        [];

      this.isLoadingRestaurants =
        false;

      return;

    }


    // =========================================
    // UPDATE LOCATION
    // =========================================

    this.selectedLocation =
      location;

    this.selectedLocationName =
      location.address ||
      'Your location';


    // =========================================
    // RESET STATE
    // =========================================

    this.isLoadingRestaurants =
      true;

    this.restaurantErrorMessage =
      '';

    this.restaurants =
      [];


    // =========================================
    // API REQUEST
    // =========================================

    console.log(
      'Loading nearby restaurants:',
      {
        latitude:
          location.latitude,

        longitude:
          location.longitude
      }
    );


    this.restaurantService

      .getNearbyRestaurants(

        location.latitude,

        location.longitude

      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next:
          (restaurants: Restaurant[]) => {

            this.restaurants =
              restaurants || [];

            this.isLoadingRestaurants =
              false;


            console.log(
              'Nearby Restaurants Loaded:',
              this.restaurants
            );

          },


        // =====================================
        // ERROR
        // =====================================

        error:
          error => {

            this.isLoadingRestaurants =
              false;


            console.error(
              'Nearby Restaurant API Error:',
              error
            );


            this.restaurantErrorMessage =
              error?.error?.message ||
              'Unable to load restaurants near your location.';

          }

      });

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
  // ORDER NOW
  // =========================================

  goToRestaurants(): void {

    this.router.navigate([
      '/restaurants'
    ]);

  }

}