import {
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable,
  map
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';


// =========================================
// FOOD ITEM TRANSLATION
// =========================================

export interface FoodItemTranslation {

  itemId: number;

  description: string;

  languageId: number;

  code: string;

  language: string;

  isRTL: boolean;

  id: number;

  name: string;

  addedOn: string | null;

}


// =========================================
// BUSINESS LOCATION
// =========================================

export interface FoodItemBusinessLocation {

  id: number;

  name: string;

  addedOn: string | null;

}


// =========================================
// FOOD ITEM IMAGE
// =========================================

export interface FoodItemImage {

  id?: number;

  name: string;

  addedOn?: string | null;

}


// =========================================
// FOOD ITEM
// =========================================

export interface FoodItem {

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

  translations: FoodItemTranslation[];

  businessLocations: FoodItemBusinessLocation[];

  items: unknown[];

  images: FoodItemImage[];

  id: number;

  name: string;

  addedOn: string;

}


// =========================================
// API RESPONSE
// =========================================

interface FoodItemApiResponse {

  responseStatus: number;

  responseCode: number;

  message: string;

  data: FoodItem[];

}


// =========================================
// SERVICE
// =========================================

@Injectable({
  providedIn: 'root'
})
export class FoodItemService {


  // =======================================
  // API URL
  // =======================================

  private readonly apiUrl =
    `${environment.apiUrl}/FoodItem`;


  // =======================================
  // CONSTRUCTOR
  // =======================================

  constructor(
    private readonly http: HttpClient
  ) {}


  // =======================================
  // GET FOOD ITEMS
  //
  // GET /FoodItem
  //
  // Optional:
  // BusinessId
  // CategoryId
  // LanguageCode
  // =======================================

  getFoodItems(
    businessId?: number,
    categoryId?: number,
    languageCode: number = 1
  ): Observable<FoodItem[]> {


    let params =
      new HttpParams();


    // =====================================
    // BUSINESS ID
    // =====================================

    if (
      businessId !== undefined &&
      businessId !== null &&
      businessId > 0
    ) {

      params =
        params.set(
          'BusinessId',
          businessId.toString()
        );

    }


    // =====================================
    // CATEGORY ID
    // =====================================

    if (
      categoryId !== undefined &&
      categoryId !== null &&
      categoryId > 0
    ) {

      params =
        params.set(
          'CategoryId',
          categoryId.toString()
        );

    }


    // =====================================
    // LANGUAGE
    // =====================================

    params =
      params.set(
        'LanguageCode',
        languageCode.toString()
      );


    console.log(
      'FoodItem API Parameters:',
      params.toString()
    );


    // =====================================
    // API REQUEST
    // =====================================

    return this.http

      .get<FoodItemApiResponse>(
        this.apiUrl,
        {
          params
        }
      )

      .pipe(

        map(
          response => {

            if (
              !response ||
              !Array.isArray(response.data)
            ) {

              return [];

            }


            return response.data;

          }
        )

      );

  }


  // =======================================
  // GET FOOD ITEMS BY CATEGORY
  //
  // This is the method our category
  // menu will use.
  // =======================================

  getFoodItemsByCategory(
    categoryId: number,
    languageCode: number = 1
  ): Observable<FoodItem[]> {

    return this.getFoodItems(
      undefined,
      categoryId,
      languageCode
    );

  }


  // =======================================
  // GET FOOD ITEMS BY BUSINESS
  // =======================================

  getFoodItemsByBusiness(
    businessId: number,
    languageCode: number = 1
  ): Observable<FoodItem[]> {

    return this.getFoodItems(
      businessId,
      undefined,
      languageCode
    );

  }

}