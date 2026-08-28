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

  templateUrl: './home.component.html',

  styleUrl: './home.component.css'
})
export class HomeComponent
  implements OnInit {


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
  // UI STATE
  // =========================================

  isLoading =
    false;


  errorMessage =
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

    this.loadLocationAndRestaurants();

  }


  // =========================================
  // LOAD LOCATION
  // =========================================

  private loadLocationAndRestaurants(): void {


    const location =
      this.locationService
        .getLocation();


    // =========================================
    // LOCATION DOES NOT EXIST
    // =========================================

    if (!location) {

      console.log(
        'No saved location found.'
      );


      this.router.navigate([
        '/location'
      ]);

      return;

    }


    // =========================================
    // SAVE LOCATION
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
    // LOAD NEARBY RESTAURANTS
    // =========================================

    this.loadNearbyRestaurants();

  }


  // =========================================
  // LOAD NEARBY RESTAURANTS
  // =========================================

  loadNearbyRestaurants(): void {


    const location =
      this.locationService
        .getLocation();


    // =========================================
    // LOCATION NOT FOUND
    // =========================================

    if (!location) {

      this.router.navigate([
        '/location'
      ]);

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
    // RESET UI
    // =========================================

    this.isLoading =
      true;


    this.errorMessage =
      '';


    this.restaurants =
      [];


    // =========================================
    // LOG API REQUEST
    // =========================================

    console.log(
      'Calling Nearby Restaurant API:',
      {
        latitude:
          location.latitude,

        longitude:
          location.longitude,

        radiusInKm:
          100
      }
    );


    // =========================================
    // CALL RESTAURANT SERVICE
    // =========================================

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
            restaurants;


          this.isLoading =
            false;


          console.log(
            'Nearby Restaurants Loaded:',
            restaurants
          );

        },


        // =====================================
        // ERROR
        // =====================================

        error: error => {


          this.isLoading =
            false;


          console.error(
            'Nearby Restaurant API Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to find restaurants near your location.';

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