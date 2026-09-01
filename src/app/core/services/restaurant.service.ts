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

import { MenuItem }
  from '../../shared/models/menu-item.model';

import { ApiResponse }
  from '../../shared/models/api-response.model';

import { environment }
  from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RestaurantService {


  // =========================================
  // BUSINESS LOCATION API
  // =========================================

  private readonly apiUrl =
    `${environment.apiUrl}/BusinessLocation/GetAllLocations`;


  // =========================================
  // FOOD ITEM API
  // =========================================

  private readonly foodItemApiUrl =
    `${environment.apiUrl}/FoodItem`;


  // =========================================
  // RESTAURANT BUSINESS ID
  //
  // Business ID 2 = Restaurant
  // =========================================

  private readonly restaurantBusinessId =
    2;


  // =========================================
  // NEARBY RADIUS
  //
  // Currently 100 KM
  // =========================================

  private readonly nearbyRadiusInKm =
    100;


  // =========================================
  // CONSTRUCTOR
  // =========================================

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

          // ===================================
          // INVALID RESPONSE
          // ===================================

          if (
            !response.data ||
            !Array.isArray(
              response.data
            )
          ) {

            return [];

          }


          // ===================================
          // MAP RESTAURANTS
          // ===================================

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
  // GET NEARBY FOOD ITEMS
  //
  // API:
  //
  // GET /api/FoodItem/near-by
  //
  // Parameters:
  //
  // Latitude
  // Longitude
  // RadiusInKm
  // =========================================

  getNearbyFoodItems(
    latitude: number,
    longitude: number
  ): Observable<MenuItem[]> {


    // =========================================
    // QUERY PARAMETERS
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
      'Nearby Food API Parameters:',
      {
        Latitude:
          latitude,

        Longitude:
          longitude,

        RadiusInKm:
          this.nearbyRadiusInKm
      }
    );


    // =========================================
    // CALL FOOD ITEM API
    // =========================================

    return this.http

      .get<ApiResponse<any[]>>(
        `${this.foodItemApiUrl}/near-by`,
        {
          params
        }
      )

      .pipe(

        map(response => {

          // ===================================
          // INVALID RESPONSE
          // ===================================

          if (
            !response.data ||
            !Array.isArray(
              response.data
            )
          ) {

            return [];

          }


          // ===================================
          // MAP FOOD ITEMS
          // ===================================

          return response.data.map(
            item =>
              this.mapFoodItem(
                item
              )
          );

        })

      );

  }


  // =========================================
  // GET NEARBY RESTAURANTS
  //
  // API:
  //
  // GET /api/FoodItem/near-by
  //
  // Parameters:
  //
  // Latitude
  // Longitude
  // RadiusInKm
  //
  // Radius = 100 KM
  // =========================================

  getNearbyRestaurants(
    latitude: number,
    longitude: number
  ): Observable<Restaurant[]> {


    // =========================================
    // QUERY PARAMETERS
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
      'Nearby API Parameters:',
      {
        Latitude:
          latitude,

        Longitude:
          longitude,

        RadiusInKm:
          this.nearbyRadiusInKm
      }
    );


    // =========================================
    // CALL NEARBY API
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
        // EXTRACT LOCATION IDs
        // =====================================

        map(response => {

          if (
            !response.data ||
            !Array.isArray(
              response.data
            )
          ) {

            return new Set<number>();

          }


          const nearbyLocationIds =
            new Set<number>();


          // ===================================
          // LOOP FOOD ITEMS
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
              // GET BUSINESS LOCATION IDs
              // ===============================

              item.businessLocations.forEach(
                (location: any) => {

                  if (
                    location.id !== undefined &&
                    location.id !== null
                  ) {

                    nearbyLocationIds.add(
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
            'Nearby Business Location IDs:',
            Array.from(
              nearbyLocationIds
            )
          );


          return nearbyLocationIds;

        }),


        // =====================================
        // GET RESTAURANT LIST
        // =====================================

        switchMap(
          nearbyLocationIds => {

            return this.getRestaurants()

              .pipe(

                map(restaurants => {


                  // =========================
                  // MATCH LOCATION IDs
                  // =========================

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
                    'Nearby Restaurants:',
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
            !Array.isArray(
              response.data
            )
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
  // MAP API FOOD ITEM
  // =========================================

  private mapFoodItem(
    data: any
  ): MenuItem {


    // =========================================
    // IMAGE
    // =========================================

    let image =
      '';


    if (
      data.images &&
      Array.isArray(
        data.images
      ) &&
      data.images.length > 0
    ) {

      const imagePath =
        data.images[0].imageUrl;


      if (
        imagePath?.startsWith(
          'http://'
        ) ||
        imagePath?.startsWith(
          'https://'
        )
      ) {

        image =
          imagePath;

      }
      else if (
        imagePath
      ) {

        image =
          `${environment.tajImageApiUrl}${imagePath}`;

      }

    }


    // =========================================
    // RESTAURANT / BUSINESS LOCATION ID
    // =========================================

    let restaurantId =
      0;


    if (
      data.businessLocations &&
      Array.isArray(
        data.businessLocations
      ) &&
      data.businessLocations.length > 0
    ) {

      restaurantId =
        Number(
          data.businessLocations[0].id
        );

    }


    // =========================================
    // RETURN FRONTEND MODEL
    // =========================================

    return {

      id:
        Number(
          data.id
        ),

      name:
        data.name ||
        '',

      description:
        data.description ||
        '',

      itemCategory:
        data.itemCategory ||
        '',

      itemCategoryId:
        Number(
          data.itemCategoryId ||
          0
        ),

      preparationTimeMinutes:
        Number(
          data.preparationTimeMinutes ||
          0
        ),

      price:
        Number(
          data.price ||
          0
        ),

      priceLabel:
        data.priceLabel ||
        `${Number(
          data.price || 0
        ).toFixed(2)} RS`,

      discountPrice:
        Number(
          data.discountPrice ||
          0
        ),

      discountPriceLabel:
        data.discountPriceLabel ||
        `${Number(
          data.discountPrice || 0
        ).toFixed(2)} RS`,

      rating:
        Number(
          data.rating ||
          0
        ),

      raters:
        Number(
          data.raters ||
          0
        ),

      isDeal:
        Boolean(
          data.isDeal
        ),

      image,

      restaurantId,

      category:
        data.itemCategory ||
        '',

      isPopular:
        Boolean(
          data.isPopular
        )

    };

  }


  // =========================================
  // MAP API RESTAURANT
  // =========================================

  private mapRestaurant(
    data: Restaurant
  ): Restaurant {


    // =========================================
    // IMAGE
    // =========================================

    let image =
      '';


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
          `${environment.tajImageApiUrl}${imagePath}`;

      }

    }
    else if (
      data.logoUrl
    ) {

      image =
        data.logoUrl;

    }


    // =========================================
    // DELIVERY / WORKING TIME
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
    // RETURN FRONTEND MODEL
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