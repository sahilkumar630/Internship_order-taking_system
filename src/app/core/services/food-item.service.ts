import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';


// =========================================
// FOOD ITEM MODEL
// =========================================

export interface FoodItem {

  description: string;

  itemCategory: string | null;

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

  businessLocations: FoodBusinessLocation[];

  items: FoodItemDealChild[];

  images: FoodItemImage[];

  id: number;

  name: string;

  addedOn: string;

}


// =========================================
// TRANSLATION
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

export interface FoodBusinessLocation {

  id: number;

  name: string;

  addedOn: string | null;

}


// =========================================
// DEAL CHILD ITEM
// =========================================

export interface FoodItemDealChild {

  id: number;

  quantity: number;

}


// =========================================
// IMAGE
// =========================================

export interface FoodItemImage {

  id: number;

  name: string;

  addedOn: string | null;

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

  private readonly apiUrl =
    `${environment.apiUrl}/FoodItem`;


  constructor(
    private readonly http: HttpClient
  ) {}


  // =========================================
  // GET FOOD ITEMS
  //
  // GET /FoodItem
  //
  // Parameters:
  //
  // BusinessId
  // CategoryId
  // LanguageCode
  // =========================================

  getFoodItems(
    businessId?: number,
    categoryId?: number,
    languageCode: number = 1
  ): Observable<FoodItem[]> {

    let params =
      new HttpParams()
        .set(
          'LanguageCode',
          languageCode.toString()
        );


    // =======================================
    // BUSINESS ID
    // =======================================

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


    // =======================================
    // CATEGORY ID
    // =======================================

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


    console.log(
      'FoodItem API Parameters:',
      {
        BusinessId: businessId,
        CategoryId: categoryId,
        LanguageCode: languageCode
      }
    );


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
              !Array.isArray(
                response.data
              )
            ) {

              return [];

            }


            return response.data;

          }
        )

      );

  }

}