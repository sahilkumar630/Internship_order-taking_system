import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { Restaurant }
  from '../../../shared/models/restaurant.model';

import { RestaurantService }
  from '../../../core/services/restaurant.service';

import {
  FoodDeal,
  FoodDealService
} from '../../../core/services/food-deal.service';


@Component({
  selector: 'app-restaurant-details',

  imports: [
    RouterLink
  ],

  templateUrl:
    './restaurant-details.component.html',

  styleUrl:
    './restaurant-details.component.css'
})
export class RestaurantDetailsComponent
  implements OnInit {


  // =========================================
  // RESTAURANT
  // =========================================

  restaurantId!: number;

  restaurant?: Restaurant;


  // =========================================
  // FOOD DEALS
  // =========================================

  foodDeals: FoodDeal[] = [];

  isLoadingDeals = false;

  dealsErrorMessage = '';


  // =========================================
  // UI STATE
  // =========================================

  isLoading = false;

  errorMessage = '';


  constructor(

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly restaurantService:
      RestaurantService,

    private readonly foodDealService:
      FoodDealService

  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.route.paramMap.subscribe(
      params => {

        const id =
          params.get('id');


        // =====================================
        // RESTAURANT ID NOT FOUND
        // =====================================

        if (!id) {

          this.errorMessage =
            'Restaurant ID not found.';

          return;

        }


        // =====================================
        // CONVERT ID
        // =====================================

        const restaurantId =
          Number(id);


        // =====================================
        // INVALID ID
        // =====================================

        if (
          !Number.isFinite(
            restaurantId
          ) ||
          restaurantId <= 0
        ) {

          this.errorMessage =
            'Invalid restaurant ID.';

          return;

        }


        // =====================================
        // SAVE RESTAURANT ID
        // =====================================

        this.restaurantId =
          restaurantId;


        console.log(
          'Restaurant / Business Location ID:',
          this.restaurantId
        );


        // =====================================
        // LOAD RESTAURANT
        // =====================================

        this.loadRestaurant();


        // =====================================
        // LOAD DEALS
        // =====================================

        this.loadFoodDeals();

      }
    );

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

        next: restaurant => {

          if (!restaurant) {

            this.errorMessage =
              'Restaurant not found.';

            this.restaurant =
              undefined;

            this.isLoading =
              false;

            return;

          }


          this.restaurant =
            restaurant;


          this.isLoading =
            false;


          console.log(
            'Restaurant Details:',
            restaurant
          );

        },


        error: error => {

          this.isLoading =
            false;


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


  // =========================================
  // LOAD FOOD DEALS
  // =========================================

  private loadFoodDeals(): void {

    this.isLoadingDeals =
      true;

    this.dealsErrorMessage =
      '';

    this.foodDeals =
      [];


    console.log(
      'Loading Food Deals for BusinessLocationId:',
      this.restaurantId
    );


    this.foodDealService
      .getFoodDeals(
        this.restaurantId,
        1
      )
      .subscribe({

        next: deals => {

          this.foodDeals =
            deals;


          this.isLoadingDeals =
            false;


          console.log(
            'Restaurant Food Deals:',
            deals
          );

        },


        error: error => {

          this.isLoadingDeals =
            false;


          console.error(
            'FoodDeal API Error:',
            error
          );


          this.dealsErrorMessage =
            error?.error?.message ||
            'Unable to load restaurant deals.';

        }

      });

  }


  // =========================================
  // CALCULATE DISCOUNT
  // =========================================

  getDiscountPercentage(
    deal: FoodDeal
  ): number {

    const price =
      Number(deal.price);

    const discountPrice =
      Number(deal.discountPrice);


    if (
      price <= 0 ||
      discountPrice >= price
    ) {

      return 0;

    }


    return Math.round(
      (
        (price - discountPrice) /
        price
      ) * 100
    );

  }


  // =========================================
  // CHECK DISCOUNT
  // =========================================

  hasDiscount(
    deal: FoodDeal
  ): boolean {

    return (
      Number(deal.discountPrice) <
      Number(deal.price)
    );

  }


  // =========================================
  // ADD DEAL
  // =========================================

  addDeal(
    deal: FoodDeal
  ): void {

    console.log(
      'Selected deal:',
      deal
    );


    /*
     * The existing menu component already
     * understands the "addItem" query parameter.
     *
     * We therefore send the user to the
     * restaurant menu with this deal's item ID.
     */

    this.router.navigate(
      [
        '/restaurant',
        this.restaurantId,
        'menu'
      ],
      {
        queryParams: {
          addItem: deal.id
        }
      }
    );

  }


  // =========================================
  // VIEW FULL MENU
  // =========================================

  viewFullMenu(): void {

    this.router.navigate([
      '/restaurant',
      this.restaurantId,
      'menu'
    ]);

  }

}