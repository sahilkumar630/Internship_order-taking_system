import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  map,
  catchError,
  throwError
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  ApiResponse
} from '../../shared/models/api-response.model';

import {
  Order
} from '../../shared/models/order.model';


// =========================================
// CREATE ORDER REQUEST
// =========================================

export interface CreateOrderRequest {

  businessLocationId: number;

  userAddressId: number;

  orderType: number;

  notes: string;

  addressRequest: null;

}


// =========================================
// UPDATE ORDER STATUS REQUEST
// =========================================

export interface UpdateOrderStatusRequest {

  id: number;

  status: number;

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


  // =========================================
  // GET MY ORDERS
  //
  // GET:
  // /api/Order/myorders/{status}
  // =========================================

  getMyOrders(
    status: number
  ): Observable<Order[]> {

    console.log(
      'Getting My Orders. Status:',
      status
    );


    return this.http

      .get<ApiResponse<Order[]>>(
        `${this.apiUrl}/myorders/${status}`
      )

      .pipe(

        map(response => {

          console.log(
            'My Orders Response:',
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
              'Unable to load orders.'
            );

          }


          return response.data || [];

        }),

        catchError(error => {

          console.error(
            'Get My Orders API Error:',
            error
          );


          return throwError(
            () => error
          );

        })

      );

  }


  // =========================================
  // GET ORDER BY ID
  //
  // GET:
  // /api/Order/{id}
  // =========================================

  getOrderById(
    orderId: number
  ): Observable<Order> {

    console.log(
      'Getting Order:',
      orderId
    );


    return this.http

      .get<ApiResponse<Order>>(
        `${this.apiUrl}/${orderId}`
      )

      .pipe(

        map(response => {

          console.log(
            'Order Details Response:',
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
              'Unable to load order details.'
            );

          }


          // =====================================
          // NO DATA
          // =====================================

          if (
            !response.data
          ) {

            throw new Error(
              'Order details were not returned.'
            );

          }


          return response.data;

        }),

        catchError(error => {

          console.error(
            'Get Order Details API Error:',
            error
          );


          return throwError(
            () => error
          );

        })

      );

  }


  // =========================================
  // UPDATE ORDER STATUS
  //
  // PUT:
  // /api/Order/update-order-status
  //
  // Used for:
  // Cancel Order
  // =========================================

  updateOrderStatus(
    orderId: number,
    status: number
  ): Observable<ApiResponse<number>> {

    const request: UpdateOrderStatusRequest = {

      id: orderId,

      status: status

    };


    console.log(
      'Updating Order Status:',
      request
    );


    return this.http

      .put<ApiResponse<number>>(
        `${this.apiUrl}/update-order-status`,
        request
      )

      .pipe(

        map(response => {

          console.log(
            'Update Order Status Response:',
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
              'Unable to update order status.'
            );

          }


          return response;

        }),

        catchError(error => {

          console.error(
            'Update Order Status API Error:',
            error
          );


          return throwError(
            () => error
          );

        })

      );

  }

}