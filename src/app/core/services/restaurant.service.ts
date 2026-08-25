import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';

import { Restaurant }
  from '../../shared/models/restaurant.model';

import { ApiResponse }
  from '../../shared/models/api-response.model';


@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  // =========================================
  // API
  // =========================================

  private readonly apiUrl =
    'https://dev.makglobalps.com/TAJApi/api/BusinessLocation';


  // =========================================
  // RESTAURANT BUSINESS ID
  //
  // Business ID 2 = Restaurant
  // =========================================

  private readonly restaurantBusinessId = 2;


  constructor(
    private http: HttpClient
  ) {}


  // =========================================
  // GET ALL RESTAURANTS
  //
  // GET:
  // /api/BusinessLocation?BusinessId=2
  // =========================================

  getRestaurants(): Observable<Restaurant[]> {

    return this.http
      .get<ApiResponse<Restaurant[]>>(
        `${this.apiUrl}?BusinessId=${this.restaurantBusinessId}`
      )
      .pipe(

        map(response => {

          if (
            !response.data ||
            !Array.isArray(response.data)
          ) {

            return [];

          }


          return response.data.map(
            restaurant =>
              this.mapRestaurant(restaurant)
          );

        })

      );

  }


  // =========================================
  // GET RESTAURANT BY LOCATION ID
  //
  // Example:
  // /restaurant/228
  //
  // 228 is the location ID.
  //
  // We retrieve all restaurants from
  // Business ID 2 and find the matching
  // location locally.
  // =========================================

  getRestaurantById(
    id: number
  ): Observable<Restaurant> {

    return this.getRestaurants()
      .pipe(

        map(restaurants => {

          const restaurant =
            restaurants.find(
              item =>
                item.id === id
            );


          if (!restaurant) {

            throw new Error(
              `Restaurant with ID ${id} not found.`
            );

          }


          return restaurant;

        })

      );

  }


  // =========================================
  // GET RESTAURANTS BY BUSINESS ID
  // =========================================

  getRestaurantsByBusinessId(
    businessId: number
  ): Observable<Restaurant[]> {

    return this.http
      .get<ApiResponse<Restaurant[]>>(
        `${this.apiUrl}?BusinessId=${businessId}`
      )
      .pipe(

        map(response => {

          if (
            !response.data ||
            !Array.isArray(response.data)
          ) {

            return [];

          }


          return response.data.map(
            restaurant =>
              this.mapRestaurant(restaurant)
          );

        })

      );

  }


  // =========================================
  // MAP API RESPONSE
  // TO FRONTEND RESTAURANT MODEL
  // =========================================

  private mapRestaurant(
    data: Restaurant
  ): Restaurant {

    // =========================================
    // IMAGE
    // =========================================

    let image = '';


    if (
      data.images &&
      data.images.length > 0
    ) {

      const imagePath =
        data.images[0].imageUrl;


      if (
        imagePath.startsWith('http://') ||
        imagePath.startsWith('https://')
      ) {

        image = imagePath;

      }
      else {

        image =
          `https://dev.makglobalps.com/TAJApi${imagePath}`;

      }

    }
    else if (
      data.logoUrl
    ) {

      image =
        data.logoUrl;

    }


    // =========================================
    // WORKING HOURS
    // =========================================

    let deliveryTime =
      'Not available';


    if (
      data.todayDayRange &&
      data.todayDayRange.length > 0
    ) {

      const range =
        data.todayDayRange[0];


      deliveryTime =
        `${range.start} - ${range.end}`;

    }


    // =========================================
    // FRONTEND MODEL
    // =========================================

    return {

      ...data,

      name:
        data.locationName ||
        data.businessName ||
        data.name,

      image,

      cuisine:
        data.businessCategoryName ||
        'Restaurant',

      deliveryTime,

      deliveryFee:
        'Available',

      discount:
        data.isOpen
          ? 'OPEN NOW'
          : 'CLOSED'

    };

  }

}