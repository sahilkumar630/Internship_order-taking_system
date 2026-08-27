import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable,
  map,
  switchMap
} from 'rxjs';

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


  private readonly foodItemApiUrl =
    'https://dev.makglobalps.com/TAJApi/api/FoodItem';


  // =========================================
  // RESTAURANT BUSINESS ID
  //
  // Business ID 2 = Restaurant
  // =========================================

  private readonly restaurantBusinessId = 2;


  // =========================================
  // NEARBY RADIUS
  //
  // For now = 100 KM
  // =========================================

  private readonly nearbyRadiusInKm = 100;


  constructor(
    private http: HttpClient
  ) {}


  // =========================================
  // GET ALL RESTAURANTS
  //
  // GET:
  // /api/BusinessLocation?BusinessId=2
  //
  // Returns all restaurant branches.
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
              this.mapRestaurant(
                restaurant
              )
          );

        })

      );

  }


  // =========================================
  // GET NEARBY RESTAURANTS
  //
  // STEP 1
  // Send user's coordinates to:
  //
  // /api/FoodItem/near-by
  //
  // STEP 2
  // Extract:
  //
  // businessLocations[].id
  //
  // STEP 3
  // Get all restaurant branches from:
  //
  // /api/BusinessLocation?BusinessId=2
  //
  // STEP 4
  // Match the nearby location IDs.
  // =========================================

  getNearbyRestaurants(
    latitude: number,
    longitude: number
  ): Observable<Restaurant[]> {


    // =========================================
    // VALIDATE COORDINATES
    // =========================================

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {

      throw new Error(
        'Invalid latitude or longitude.'
      );

    }


    // =========================================
    // NEARBY API PARAMETERS
    // =========================================

    const params =
      new HttpParams()

        .set(
          'Latitude',
          latitude
        )

        .set(
          'Longitude',
          longitude
        )

        .set(
          'RadiusInKm',
          this.nearbyRadiusInKm
        );


    console.log(
      'Nearby API coordinates:',
      {
        latitude,
        longitude,
        radiusInKm:
          this.nearbyRadiusInKm
      }
    );


    // =========================================
    // CALL FOOD ITEM NEARBY API
    // =========================================

    return this.http

      .get<ApiResponse<any[]>>(
        `${this.foodItemApiUrl}/near-by`,
        {
          params
        }
      )

      .pipe(


        // =====================================
        // EXTRACT BRANCH IDs
        // =====================================

        map(response => {

          const locationIds =
            new Set<number>();


          if (
            response.responseStatus !== 1 ||
            !response.data ||
            !Array.isArray(response.data)
          ) {

            return locationIds;

          }


          // ===================================
          // LOOP THROUGH FOOD ITEMS
          // ===================================

          response.data.forEach(
            item => {


              if (
                !item.businessLocations ||
                !Array.isArray(
                  item.businessLocations
                )
              ) {

                return;

              }


              // ===============================
              // LOOP THROUGH BRANCHES
              // ===============================

              item.businessLocations.forEach(
                (location: any) => {


                  if (
                    location.id !== undefined &&
                    location.id !== null
                  ) {

                    locationIds.add(
                      Number(
                        location.id
                      )
                    );

                  }

                }
              );

            }
          );


          console.log(
            'Nearby branch IDs:',
            Array.from(
              locationIds
            )
          );


          return locationIds;

        }),


        // =====================================
        // GET ALL RESTAURANT BRANCHES
        // =====================================

        switchMap(
          nearbyLocationIds => {

            return this.getRestaurants()

              .pipe(

                map(restaurants => {


                  // ===========================
                  // FILTER RESTAURANTS
                  // ===========================

                  const nearbyRestaurants =
                    restaurants.filter(
                      restaurant =>
                        nearbyLocationIds.has(
                          Number(
                            restaurant.id
                          )
                        )
                    );


                  console.log(
                    'Nearby restaurants:',
                    nearbyRestaurants
                  );


                  return nearbyRestaurants;

                })

              );

          }

        )

      );

  }


  // =========================================
  // GET RESTAURANT BY LOCATION ID
  //
  // Example:
  // /restaurant/228
  //
  // 228 = Business Location ID
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
                Number(item.id) ===
                Number(id)
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
              this.mapRestaurant(
                restaurant
              )
          );

        })

      );

  }


  // =========================================
  // MAP API RESTAURANT
  // TO FRONTEND MODEL
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
        imagePath.startsWith(
          'http://'
        ) ||
        imagePath.startsWith(
          'https://'
        )
      ) {

        image =
          imagePath;

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


      // Restaurant/branch name
      name:
        data.locationName ||
        data.businessName ||
        data.name,


      // Image
      image,


      // Category
      cuisine:
        data.businessCategoryName ||
        'Restaurant',


      // Opening hours
      deliveryTime,


      // Delivery fee
      deliveryFee:
        'Available',


      // Current status
      discount:
        data.isOpen
          ? 'OPEN NOW'
          : 'CLOSED'

    };

  }

}