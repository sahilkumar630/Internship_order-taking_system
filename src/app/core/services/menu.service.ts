import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable,
  map
} from 'rxjs';

import { MenuItem }
  from '../../shared/models/menu-item.model';

import { ApiResponse }
  from '../../shared/models/api-response.model';

import { environment }
  from '../../../environments/environment';


/*
 * =========================================
 * FOOD CATEGORY
 * =========================================
 */

export interface FoodCategory {

  id: number;

  name: string;

  description: string;

  sortOrder: number;

}


/*
 * =========================================
 * FOOD ITEM API RESPONSE
 * =========================================
 */

interface FoodItemApi {

  id: number;

  name: string;

  description: string;

  itemCategory: string;

  itemCategoryId: number;

  preparationTimeMinutes: number;

  price: number;

  priceLabel: string;

  discountPrice: number;

  discountPriceLabel: string;

  rating: number;

  raters: number;

  isDeal: boolean;

  images: {
    id: number;
    name: string;
    addedOn: string | null;
  }[];

}


/*
 * =========================================
 * SERVICE
 * =========================================
 */

@Injectable({
  providedIn: 'root'
})
export class MenuService {


  private readonly apiUrl =
    environment.apiUrl;


  constructor(
    private http: HttpClient
  ) {}


  /*
   * =========================================
   * GET CATEGORIES
   *
   * /FoodCategory/menu
   * =========================================
   */

  getCategories(
    businessLocationId: number
  ): Observable<FoodCategory[]> {

    const params =
      new HttpParams()
        .set(
          'BusinessLocationId',
          businessLocationId
        );


    return this.http
      .get<ApiResponse<FoodCategory[]>>(
        `${this.apiUrl}/FoodCategory/menu`,
        {
          params
        }
      )
      .pipe(

        map(response => {

          if (
            response.responseStatus !== 1 ||
            !response.data
          ) {

            return [];

          }


          return response.data;

        })

      );

  }


  /*
   * =========================================
   * GET FOOD ITEMS
   *
   * /FoodItem/menu
   *
   * BusinessLocationId
   * CategoryId
   * =========================================
   */

  getMenuItems(
    businessLocationId: number,
    categoryId: number
  ): Observable<MenuItem[]> {

    const params =
      new HttpParams()
        .set(
          'BusinessLocationId',
          businessLocationId
        )
        .set(
          'CategoryId',
          categoryId
        );


    return this.http
      .get<ApiResponse<FoodItemApi[]>>(
        `${this.apiUrl}/FoodItem/menu`,
        {
          params
        }
      )
      .pipe(

        map(response => {

          if (
            response.responseStatus !== 1 ||
            !response.data
          ) {

            return [];

          }


          return response.data.map(
            item =>
              this.mapFoodItem(
                item,
                businessLocationId
              )
          );

        })

      );

  }


  /*
   * =========================================
   * GET MENU BY RESTAURANT
   *
   * Loads:
   *
   * 1. Categories
   * 2. Food items for each category
   * =========================================
   */

  getMenuByRestaurantId(
    businessLocationId: number
  ): Observable<MenuItem[]> {

    return new Observable<MenuItem[]>(
      subscriber => {

        this.getCategories(
          businessLocationId
        )
        .subscribe({

          next: categories => {

            if (
              categories.length === 0
            ) {

              subscriber.next([]);

              subscriber.complete();

              return;

            }


            const allItems: MenuItem[] = [];

            let completedRequests = 0;


            categories.forEach(
              category => {

                this.getMenuItems(
                  businessLocationId,
                  category.id
                )
                .subscribe({

                  next: items => {

                    allItems.push(
                      ...items
                    );

                  },


                  error: error => {

                    console.error(
                      `Food items error for category ${category.id}:`,
                      error
                    );

                  },


                  complete: () => {

                    completedRequests++;


                    if (
                      completedRequests ===
                      categories.length
                    ) {

                      subscriber.next(
                        allItems
                      );

                      subscriber.complete();

                    }

                  }

                });

              }

            );

          },


          error: error => {

            subscriber.error(
              error
            );

          }

        });

      }
    );

  }


  /*
   * =========================================
   * MAP API ITEM
   * =========================================
   */

  private mapFoodItem(
    item: FoodItemApi,
    businessLocationId: number
  ): MenuItem {


    let image = '';


    /*
     * -----------------------------------------
     * IMAGE
     * -----------------------------------------
     */

    if (
      item.images &&
      item.images.length > 0
    ) {

      const imagePath =
        item.images[0].name;


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


    /*
     * -----------------------------------------
     * RETURN MODEL
     * -----------------------------------------
     */

    return {

      id:
        item.id,

      name:
        item.name,

      description:
        item.description || '',

      itemCategory:
        item.itemCategory,

      itemCategoryId:
        item.itemCategoryId,

      preparationTimeMinutes:
        item.preparationTimeMinutes,

      price:
        item.price,

      priceLabel:
        item.priceLabel,

      discountPrice:
        item.discountPrice,

      discountPriceLabel:
        item.discountPriceLabel,

      rating:
        item.rating,

      raters:
        item.raters,

      isDeal:
        item.isDeal,

      image,

      restaurantId:
        businessLocationId,

      category:
        item.itemCategory,

      isPopular:
        item.rating > 0

    };

  }

}