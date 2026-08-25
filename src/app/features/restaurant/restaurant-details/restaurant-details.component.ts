import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Restaurant }
  from '../../../shared/models/restaurant.model';

import { RestaurantService }
  from '../../../core/services/restaurant.service';


@Component({
  selector: 'app-restaurant-details',

  imports: [
    RouterLink
  ],

  templateUrl: './restaurant-details.component.html',

  styleUrl: './restaurant-details.component.css'
})
export class RestaurantDetailsComponent
  implements OnInit {


  // =========================================
  // RESTAURANT
  // =========================================

  restaurantId!: number;

  restaurant?: Restaurant;


  // =========================================
  // UI STATE
  // =========================================

  isLoading = false;

  errorMessage = '';


  constructor(
    private route: ActivatedRoute,

    private restaurantService: RestaurantService
  ) {}



  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');


      if (!id) {

        return;

      }


      this.restaurantId =
        Number(id);


      this.loadRestaurant();

    });

  }



  // =========================================
  // LOAD RESTAURANT
  // =========================================

  private loadRestaurant(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.restaurantService
      .getRestaurantById(
        this.restaurantId
      )
      .subscribe({

        next: (
          restaurant: Restaurant
        ) => {

          this.restaurant =
            restaurant;

          this.isLoading = false;


          console.log(
            'Restaurant Details:',
            restaurant
          );

        },


        error: error => {

          this.isLoading = false;


          console.error(
            'Restaurant Details API Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to load restaurant.';

        }

      });

  }

}