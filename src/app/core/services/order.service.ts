import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  map
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  ApiResponse
} from '../../shared/models/api-response.model';


// =========================================
// ORDER REQUEST
// =========================================

export interface CreateOrderRequest {

  businessLocationId: number;

  userAddressId: number;

  orderType: number;

  notes: string;

  addressRequest: null;

}


// =========================================
// ORDER SERVICE
// =========================================

@Injectable({
  providedIn: 'root'
})
export class OrderService {


  // =========================================
  // API URL
  // =========================================

  private readonly apiUrl =
    `${environment.apiUrl}/Order`;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private http: HttpClient
  ) {}


  // =========================================
  // CREATE ORDER
  //
  // POST:
  // /api/Order
  // =========================================

  createOrder(
    request: CreateOrderRequest
  ): Observable<ApiResponse<number>> {

    console.log(
      'Creating Order:',
      request
    );


    return this.http

      .post<ApiResponse<number>>(
        this.apiUrl,
        request
      )

      .pipe(

        map(response => {

          console.log(
            'Create Order Response:',
            response
          );


          // =====================================
          // INVALID RESPONSE
          // =====================================

          if (
            !response ||
            response.responseStatus !== 1
          ) {

            throw new Error(
              response?.message ||
              'Unable to place order.'
            );

          }


          return response;

        })

      );

  }

}