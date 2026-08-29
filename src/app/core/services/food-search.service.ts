import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment }
  from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FoodSearchService {

  // =========================================
  // API
  // =========================================

  private readonly apiUrl =
    `${environment.apiUrl}/FoodItem`;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private http: HttpClient
  ) {}


  // =========================================
  // SEARCH FOOD ITEMS
  // =========================================

  searchFoodItems(
    query: string,
    businessLocationId: number,
    languageCode?: number
  ): Observable<any> {

    let params =
      new HttpParams()

        .set(
          'query',
          query
        )

        .set(
          'businessLocationId',
          businessLocationId.toString()
        );


    if (languageCode !== undefined) {

      params =
        params.set(
          'languageCode',
          languageCode.toString()
        );

    }


    return this.http.get<any>(
      `${this.apiUrl}/search`,
      {
        params
      }
    );

  }


  // =========================================
  // GET SUGGESTIONS
  // =========================================

  getSuggestions(
    query: string,
    businessLocationId: number
  ): Observable<any> {

    const params =
      new HttpParams()

        .set(
          'query',
          query
        )

        .set(
          'businessLocationId',
          businessLocationId.toString()
        );


    return this.http.get<any>(
      `${this.apiUrl}/suggestions`,
      {
        params
      }
    );

  }

}