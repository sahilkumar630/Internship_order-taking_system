import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable,
  map
} from 'rxjs';

import { environment } from '../../../environments/environment';


// =========================================
// FOOD CATEGORY MODEL
// =========================================

export interface FoodCategory {

  id: number;

  name: string;

  description: string;

  sortOrder: number;

  translations: FoodCategoryTranslation[];

}


// =========================================
// TRANSLATION MODEL
// =========================================

export interface FoodCategoryTranslation {

  itemCategoryId: number;

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
// API RESPONSE
// =========================================

interface FoodCategoryApiResponse {

  responseStatus: number;

  responseCode: number;

  message: string;

  data: FoodCategory[];

}


// =========================================
// SERVICE
// =========================================

@Injectable({
  providedIn: 'root'
})
export class FoodCategoryService {

  private readonly apiUrl =
    `${environment.apiUrl}/FoodCategory`;


  constructor(
    private readonly http: HttpClient
  ) {}


  // =========================================
  // GET ALL FOOD CATEGORIES
  //
  // GET /FoodCategory
  // =========================================

  getFoodCategories(
    businessCategoryId?: number,
    languageCode: number = 1
  ): Observable<FoodCategory[]> {

    let params =
      new HttpParams()
        .set(
          'LanguageCode',
          languageCode.toString()
        );


    if (
      businessCategoryId !== undefined &&
      businessCategoryId !== null
    ) {

      params =
        params.set(
          'BusinessCategoryId',
          businessCategoryId.toString()
        );

    }


    return this.http
      .get<FoodCategoryApiResponse>(
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


  // =========================================
  // GET NEARBY FOOD CATEGORIES
  //
  // GET /FoodCategory/near-by
  //
  // Required:
  // Latitude
  // Longitude
  // RadiusInKm
  //
  // Optional:
  // LanguageCode
  // CategoryId
  // =========================================

  getNearbyFoodCategories(
    latitude: number,
    longitude: number,
    radiusInKm: number,
    categoryId?: number,
    languageCode: number = 1
  ): Observable<FoodCategory[]> {

    let params =
      new HttpParams()

        .set(
          'Latitude',
          latitude.toString()
        )

        .set(
          'Longitude',
          longitude.toString()
        )

        .set(
          'RadiusInKm',
          radiusInKm.toString()
        )

        .set(
          'LanguageCode',
          languageCode.toString()
        );


    // =======================================
    // CATEGORY ID
    // =======================================

    if (
      categoryId !== undefined &&
      categoryId !== null
    ) {

      params =
        params.set(
          'CategoryId',
          categoryId.toString()
        );

    }


    return this.http
      .get<FoodCategoryApiResponse>(
        `${this.apiUrl}/near-by`,
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

}