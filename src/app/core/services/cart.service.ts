import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  of,
  map,
  catchError
} from 'rxjs';

import {
  Cart,
  CartItem
} from '../../shared/models/cart-item.model';

import {
  MenuItem
} from '../../shared/models/menu-item.model';

import {
  ApiResponse
} from '../../shared/models/api-response.model';

import {
  environment
} from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CartService {


  // =========================================
  // CART API
  // =========================================

  private readonly apiUrl =
    `${environment.apiUrl}/Cart`;


  // =========================================
  // CURRENT CART
  // =========================================

  private cart:
    Cart | null = null;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private http: HttpClient
  ) {}


  // =========================================
  // GET CART
  // =========================================

  getCart(): Observable<Cart | null> {

    return this.http

      .get<ApiResponse<Cart>>(
        this.apiUrl
      )

      .pipe(

        map(response => {

          console.log(
            'Get Cart Response:',
            response
          );


          // =====================================
          // CART NOT FOUND / EMPTY
          // =====================================

          if (
            !response.data ||
            response.message === 'Cart not found.'
          ) {

            this.cart =
              null;

            return null;

          }


          // =====================================
          // SAVE CART
          // =====================================

          this.cart =
            response.data;


          return this.cart;

        }),


        // =====================================
        // ERROR
        // =====================================

        catchError(error => {

          console.error(
            'Get Cart API Error:',
            error
          );


          this.cart =
            null;


          return of(null);

        })

      );

  }


  // =========================================
  // GET CURRENT CART ITEMS
  // =========================================

  getItems(): CartItem[] {

    if (!this.cart) {

      return [];

    }


    return this.cart.cartItems || [];

  }


  // =========================================
  // ADD ITEM TO CART
  // =========================================

  addItem(
    menuItem: MenuItem,
    businessLocationId: number
  ): Observable<Cart | null> {


    // =========================================
    // REQUEST BODY
    // =========================================

    const body = {

      businessLocationId:
        businessLocationId,

      itemId:
        menuItem.id,

      quantity:
        1

    };


    console.log(
      'Adding item to cart:',
      body
    );


    return this.http

      .post<ApiResponse<Cart>>(
        `${this.apiUrl}/add`,
        body
      )

      .pipe(

        map(response => {

          console.log(
            'Cart Add Response:',
            response
          );


          if (
            response.data
          ) {

            this.cart =
              response.data;

          }


          return this.cart;

        }),


        catchError(error => {

          console.error(
            'Add Cart Item API Error:',
            error
          );


          throw error;

        })

      );

  }


  // =========================================
  // UPDATE QUANTITY
  // =========================================

  updateQuantity(
    businessLocationId: number,
    itemId: number,
    quantity: number
  ): Observable<Cart | null> {


    if (
      quantity < 1
    ) {

      return of(
        this.cart
      );

    }


    const body = {

      businessLocationId:
        businessLocationId,

      itemId:
        itemId,

      quantity:
        quantity

    };


    console.log(
      'Updating cart quantity:',
      body
    );


    return this.http

      .put<ApiResponse<Cart>>(
        `${this.apiUrl}/quantity`,
        body
      )

      .pipe(

        map(response => {

          console.log(
            'Cart Quantity Response:',
            response
          );


          if (
            response.data
          ) {

            this.cart =
              response.data;

          }


          return this.cart;

        }),


        catchError(error => {

          console.error(
            'Update Cart Quantity API Error:',
            error
          );


          throw error;

        })

      );

  }


  // =========================================
  // INCREASE QUANTITY
  // =========================================

  increaseQuantity(
    itemId: number
  ): Observable<Cart | null> {


    const item =
      this.getItems().find(

        cartItem =>
          Number(cartItem.itemId) ===
          Number(itemId)

      );


    if (!item) {

      console.warn(
        'Cart item not found:',
        itemId
      );


      return of(
        this.cart
      );

    }


    const businessLocationId =
      this.cart?.businessLocationId;


    if (
      !businessLocationId
    ) {

      console.warn(
        'Business location ID not found.'
      );


      return of(
        this.cart
      );

    }


    return this.updateQuantity(

      businessLocationId,

      item.itemId,

      item.quantity + 1

    );

  }


  // =========================================
  // DECREASE QUANTITY
  // =========================================

  decreaseQuantity(
    itemId: number
  ): Observable<Cart | null> {


    const item =
      this.getItems().find(

        cartItem =>
          Number(cartItem.itemId) ===
          Number(itemId)

      );


    if (!item) {

      console.warn(
        'Cart item not found:',
        itemId
      );


      return of(
        this.cart
      );

    }


    // =========================================
    // QUANTITY = 1
    //
    // Remove item completely
    // =========================================

    if (
      item.quantity <= 1
    ) {

      return this.removeItem(
        itemId
      );

    }


    const businessLocationId =
      this.cart?.businessLocationId;


    if (
      !businessLocationId
    ) {

      console.warn(
        'Business location ID not found.'
      );


      return of(
        this.cart
      );

    }


    return this.updateQuantity(

      businessLocationId,

      item.itemId,

      item.quantity - 1

    );

  }


  // =========================================
  // REMOVE ITEM
  // =========================================
  //
  // API:
  //
  // DELETE /api/Cart/item/{itemId}
  //
  // Body:
  //
  // {
  //   businessLocationId: 228,
  //   itemId: 2
  // }
  //
  // =========================================

  removeItem(
    itemId: number
  ): Observable<Cart | null> {


    const businessLocationId =
      this.cart?.businessLocationId;


    // =========================================
    // BUSINESS LOCATION REQUIRED
    // =========================================

    if (
      !businessLocationId
    ) {

      console.error(
        'Cannot remove item. Business location ID is missing.'
      );


      return of(
        this.cart
      );

    }


    const body = {

      businessLocationId:
        businessLocationId,

      itemId:
        itemId

    };


    console.log(
      'Removing cart item:',
      body
    );


    // =========================================
    // DELETE REQUEST
    // =========================================

    return this.http

      .delete<ApiResponse<Cart>>(
        `${this.apiUrl}/item/${itemId}`,

        {
          body:
            body
        }

      )

      .pipe(

        map(response => {

          console.log(
            'Remove Cart Item Response:',
            response
          );


          // ===================================
          // UPDATED CART
          // ===================================

          if (
            response.data
          ) {

            this.cart =
              response.data;

          }

          else {

            // =================================
            // CART IS NOW EMPTY
            // =================================

            this.cart =
              null;

          }


          return this.cart;

        }),


        catchError(error => {

          console.error(
            'Remove Cart Item API Error:',
            error
          );


          throw error;

        })

      );

  }



// =========================================
// CLEAR CART
// =========================================

clearCart(
  businessLocationId: number
): Observable<Cart | null> {

  const body = {

    businessLocationId:
      businessLocationId

  };


  console.log(
    'Clearing cart:',
    body
  );


  return this.http

    .delete<ApiResponse<Cart>>(
      `${this.apiUrl}/clear`,
      {
        body: body
      }
    )

    .pipe(

      map(response => {

        console.log(
          'Clear Cart Response:',
          response
        );


        this.cart = null;


        return null;

      }),


      catchError(error => {

        console.error(
          'Clear Cart API Error:',
          error
        );


        throw error;

      })

    );

}
  // =========================================
  // GET SUBTOTAL
  // =========================================

  getSubtotal(): number {

    return this.getItems().reduce(

      (
        total,
        item
      ) => {

        return total +
          Number(
            item.totalPrice || 0
          );

      },

      0

    );

  }


  // =========================================
  // GET TOTAL ITEMS
  // =========================================

  getItemCount(): number {

    return this.getItems().reduce(

      (
        total,
        item
      ) => {

        return total +
          Number(
            item.quantity || 0
          );

      },

      0

    );

  }


  // =========================================
  // GET BUSINESS LOCATION ID
  // =========================================

  getBusinessLocationId():
    number | null {

    return (
      this.cart?.businessLocationId ??
      null
    );

  }


  // =========================================
  // GET CURRENT CART
  // =========================================

  getCurrentCart():
    Cart | null {

    return this.cart;

  }

}