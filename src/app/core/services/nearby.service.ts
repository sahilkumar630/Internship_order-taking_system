import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.production';


@Injectable({
  providedIn: 'root'
})
export class NearbyService {


  // =========================================
  // API
  // =========================================

  private readonly apiUrl =
    `${environment.apiUrl}/FoodItem`;


  // =========================================
  // DEFAULT RADIUS
  // =========================================

  private readonly defaultRadiusInKm =
    100;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private http: HttpClient
  ) {}


  // =========================================
  // GET NEARBY
  // =========================================

  getNearby(
    latitude: number,
    longitude: number,
    radiusInKm:
      number = this.defaultRadiusInKm
  ): Observable<any> {


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
        );


    return this.http.get<any>(
      `${this.apiUrl}/near-by`,
      {
        params
      }
    );

  }

}