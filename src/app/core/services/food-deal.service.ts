import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable,
  map
} from 'rxjs';

import { environment }
  from '../../../environments/environment';


export interface FoodDealImage {
  id: number;
  name: string;
  addedOn: string | null;
}


export interface FoodDealBusinessLocation {
  id: number;
  name: string;
  addedOn: string | null;
}


export interface FoodDeal {
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

  images: FoodDealImage[];

  businessLocations: FoodDealBusinessLocation[];

  id: number;

  name: string;

  addedOn: string;

  image?: string;
}


interface FoodDealApiResponse {
  responseStatus: number;
  responseCode: number;
  message: string;
  data: FoodDeal[];
}


@Injectable({
  providedIn: 'root'
})
export class FoodDealService {

  private readonly apiUrl =
    `${environment.apiUrl}/FoodDeal`;

  private readonly imageBaseUrl =
    environment.tajImageApiUrl;


  constructor(
    private readonly http: HttpClient
  ) {}


  // =========================================
  // GET RESTAURANT FOOD DEALS
  // =========================================

  getFoodDeals(
    businessLocationId: number,
    languageCode: number = 1
  ): Observable<FoodDeal[]> {

    const params =
      new HttpParams()
        .set(
          'BusinessLocationId',
          businessLocationId
        )
        .set(
          'LanguageCode',
          languageCode
        );


    return this.http
      .get<FoodDealApiResponse>(
        this.apiUrl,
        { params }
      )
      .pipe(

        map(response => {

          if (
            !response ||
            !Array.isArray(response.data)
          ) {

            return [];

          }


          return response.data.map(
            deal => this.mapFoodDeal(deal)
          );

        })

      );

  }


  // =========================================
  // MAP FOOD DEAL
  // =========================================

  private mapFoodDeal(
    deal: FoodDeal
  ): FoodDeal {

    let image = '';


    if (
      deal.images &&
      deal.images.length > 0 &&
      deal.images[0].name
    ) {

      const imagePath =
        deal.images[0].name;


      if (
        imagePath.startsWith('http://') ||
        imagePath.startsWith('https://')
      ) {

        image = imagePath;

      }

      else {

        image =
          `${this.imageBaseUrl}${imagePath}`;

      }

    }


    return {

      ...deal,

      image

    };

  }

}