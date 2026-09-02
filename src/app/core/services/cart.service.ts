import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  of,
  map,
  catchError,
  switchMap,
  from,
  throwError
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
  AuthService
} from './auth.service';

import {
  environment
} from '../../../environments/environment';


/*
 * =========================================
 * GUEST CART MODELS
 * =========================================
 */

interface GuestCartItem {
  itemId: number;
  quantity: number;

  // Keep the actual menu information
  // so the cart can work without login.
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
}

interface GuestCart {
  businessLocationId: number;
  items: GuestCartItem[];
}


/*
 * =========================================
 * CART SERVICE
 * =========================================
 */

@Injectable({
  providedIn: 'root'
})
export class CartService {

  /*
   * =========================================
   * API
   * =========================================
   */

  private readonly apiUrl =
    `${environment.apiUrl}/Cart`;


  /*
   * =========================================
   * LOCAL STORAGE
   * =========================================
   */

  private readonly guestCartKey =
    'foodie_guest_cart';


  /*
   * =========================================
   * CURRENT SERVER CART
   * =========================================
   */

  private cart:
    Cart | null = null;


  /*
   * =========================================
   * CONSTRUCTOR
   * =========================================
   */

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}


  /*
   * =========================================
   * GET CART
   * =========================================
   *
   * Guest:
   *   Read cart from LocalStorage.
   *
   * Logged in:
   *   Read cart from backend.
   */

  getCart(): Observable<Cart | null> {

    /*
     * =======================================
     * GUEST
     * =======================================
     */

    if (!this.authService.isLoggedIn()) {

      return of(
        this.getGuestCartAsCart()
      );

    }


    /*
     * =======================================
     * LOGGED-IN USER
     * =======================================
     */

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


          if (
            !response.data ||
            response.message === 'Cart not found.'
          ) {

            this.cart = null;

            return null;
          }


          this.cart =
            response.data;


          return this.cart;

        }),

        catchError(error => {

          console.error(
            'Get Cart API Error:',
            error
          );


          this.cart = null;

          return of(null);

        })

      );

  }


  /*
   * =========================================
   * GET ITEMS
   * =========================================
   */

  getItems(): CartItem[] {

    /*
     * Logged-in user
     */

    if (this.authService.isLoggedIn()) {

      return this.cart?.cartItems || [];

    }


    /*
     * Guest user
     */

    return this.getGuestCartItems();

  }


  /*
   * =========================================
   * ADD ITEM
   * =========================================
   */

  addItem(
    menuItem: MenuItem,
    businessLocationId: number
  ): Observable<Cart | null> {


    /*
     * =======================================
     * GUEST USER
     * =======================================
     */

    if (!this.authService.isLoggedIn()) {

      return of(
        this.addGuestItem(
          menuItem,
          businessLocationId
        )
      );

    }


    /*
     * =======================================
     * LOGGED-IN USER
     * =======================================
     */

    const body = {

      businessLocationId:
        businessLocationId,

      itemId:
        menuItem.id,

      quantity:
        1

    };


    console.log(
      'Adding item to API cart:',
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
            response.responseStatus !== 1
          ) {

            throw new Error(
              response.message ||
              'Unable to add item to cart.'
            );

          }


          if (!response.data) {

            throw new Error(
              'Item was accepted but no cart data was returned.'
            );

          }


          this.cart =
            response.data;


          return this.cart;

        }),

        catchError(error => {

          console.error(
            'Add Cart Item API Error:',
            error
          );


          return throwError(
            () => error
          );

        })

      );

  }


  /*
   * =========================================
   * ADD GUEST ITEM
   * =========================================
   */

  private addGuestItem(
    menuItem: MenuItem,
    businessLocationId: number
  ): Cart | null {


    let guestCart =
      this.getGuestCart();


    /*
     * =======================================
     * NEW CART
     * =======================================
     */

    if (!guestCart) {

      guestCart = {

        businessLocationId:
          businessLocationId,

        items: []

      };

    }


    /*
     * =======================================
     * DIFFERENT RESTAURANT
     * =======================================
     *
     * MenuComponent already handles the
     * restaurant-switch confirmation.
     *
     * This extra protection prevents adding
     * items from another restaurant accidentally.
     */

    if (
      Number(
        guestCart.businessLocationId
      ) !== Number(
        businessLocationId
      )
    ) {

      console.warn(
        'Cannot add guest item from another restaurant.'
      );

      return this.getGuestCartAsCart();

    }


    /*
     * =======================================
     * FIND EXISTING ITEM
     * =======================================
     */

    const existingItem =
      guestCart.items.find(
        item =>
          Number(item.itemId) ===
          Number(menuItem.id)
      );


    /*
     * =======================================
     * INCREASE EXISTING ITEM
     * =======================================
     */

    if (existingItem) {

      existingItem.quantity += 1;


      /*
       * Update item information as well.
       * This helps if menu information changed
       * while the user was browsing.
       */

      existingItem.name =
        menuItem.name;

      existingItem.category =
        menuItem.category ||
        menuItem.itemCategory ||
        '';

      existingItem.description =
        menuItem.description || '';

      existingItem.price =
        Number(
          menuItem.discountPrice ||
          menuItem.price ||
          0
        );

      existingItem.image =
        menuItem.image || '';

    }


    /*
     * =======================================
     * NEW ITEM
     * =======================================
     */

    else {

      guestCart.items.push({

        itemId:
          Number(menuItem.id),

        quantity:
          1,

        name:
          menuItem.name,

        category:
          menuItem.category ||
          menuItem.itemCategory ||
          '',

        description:
          menuItem.description || '',

        price:
          Number(
            menuItem.discountPrice ||
            menuItem.price ||
            0
          ),

        image:
          menuItem.image || ''

      });

    }


    /*
     * =======================================
     * SAVE
     * =======================================
     */

    this.saveGuestCart(
      guestCart
    );


    console.log(
      'Guest cart saved:',
      guestCart
    );


    return this.getGuestCartAsCart();

  }


  /*
   * =========================================
   * UPDATE QUANTITY
   * =========================================
   */

  updateQuantity(
    businessLocationId: number,
    itemId: number,
    quantity: number
  ): Observable<Cart | null> {


    /*
     * =======================================
     * INVALID QUANTITY
     * =======================================
     */

    if (quantity < 1) {

      return of(
        this.getCurrentCart()
      );

    }


    /*
     * =======================================
     * GUEST
     * =======================================
     */

    if (!this.authService.isLoggedIn()) {

      return of(
        this.updateGuestQuantity(
          businessLocationId,
          itemId,
          quantity
        )
      );

    }


    /*
     * =======================================
     * LOGGED-IN
     * =======================================
     */

    const body = {

      businessLocationId:
        businessLocationId,

      itemId:
        itemId,

      quantity:
        quantity

    };


    return this.http
      .put<ApiResponse<Cart>>(
        `${this.apiUrl}/quantity`,
        body
      )
      .pipe(

        map(response => {

          if (
            response.responseStatus !== 1
          ) {

            throw new Error(
              response.message ||
              'Unable to update cart quantity.'
            );

          }


          if (response.data) {

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


          return throwError(
            () => error
          );

        })

      );

  }


  /*
   * =========================================
   * UPDATE GUEST QUANTITY
   * =========================================
   */

  private updateGuestQuantity(
    businessLocationId: number,
    itemId: number,
    quantity: number
  ): Cart | null {


    const guestCart =
      this.getGuestCart();


    if (!guestCart) {

      return null;

    }


    /*
     * Make sure restaurant matches.
     */

    if (
      Number(
        guestCart.businessLocationId
      ) !== Number(
        businessLocationId
      )
    ) {

      return this.getGuestCartAsCart();

    }


    /*
     * Find item.
     */

    const item =
      guestCart.items.find(
        cartItem =>
          Number(cartItem.itemId) ===
          Number(itemId)
      );


    if (!item) {

      return this.getGuestCartAsCart();

    }


    /*
     * Update quantity.
     */

    item.quantity =
      quantity;


    /*
     * Save.
     */

    this.saveGuestCart(
      guestCart
    );


    return this.getGuestCartAsCart();

  }


  /*
   * =========================================
   * INCREASE QUANTITY
   * =========================================
   */

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

      return of(
        this.getCurrentCart()
      );

    }


    const businessLocationId =
      this.getBusinessLocationId();


    if (!businessLocationId) {

      return of(
        this.getCurrentCart()
      );

    }


    return this.updateQuantity(

      businessLocationId,

      item.itemId,

      Number(item.quantity) + 1

    );

  }


  /*
   * =========================================
   * DECREASE QUANTITY
   * =========================================
   */

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

      return of(
        this.getCurrentCart()
      );

    }


    /*
     * If quantity is already 1,
     * remove the item.
     */

    if (
      Number(item.quantity) <= 1
    ) {

      return this.removeItem(
        itemId
      );

    }


    const businessLocationId =
      this.getBusinessLocationId();


    if (!businessLocationId) {

      return of(
        this.getCurrentCart()
      );

    }


    return this.updateQuantity(

      businessLocationId,

      item.itemId,

      Number(item.quantity) - 1

    );

  }


  /*
   * =========================================
   * REMOVE ITEM
   * =========================================
   */

  removeItem(
    itemId: number
  ): Observable<Cart | null> {


    /*
     * =======================================
     * GUEST
     * =======================================
     */

    if (!this.authService.isLoggedIn()) {

      const guestCart =
        this.getGuestCart();


      if (!guestCart) {

        return of(null);

      }


      guestCart.items =
        guestCart.items.filter(
          item =>
            Number(item.itemId) !==
            Number(itemId)
        );


      /*
       * Cart became empty.
       */

      if (
        guestCart.items.length === 0
      ) {

        this.clearGuestCart();

        return of(null);

      }


      this.saveGuestCart(
        guestCart
      );


      return of(
        this.getGuestCartAsCart()
      );

    }


    /*
     * =======================================
     * LOGGED-IN
     * =======================================
     */

    const businessLocationId =
      this.cart?.businessLocationId;


    if (!businessLocationId) {

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


    return this.http
      .delete<ApiResponse<Cart>>(
        `${this.apiUrl}/item/${itemId}`,
        {
          body
        }
      )
      .pipe(

        map(response => {

          if (
            response.responseStatus !== 1
          ) {

            throw new Error(
              response.message ||
              'Unable to remove cart item.'
            );

          }


          if (response.data) {

            this.cart =
              response.data;

          }

          else {

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


          return throwError(
            () => error
          );

        })

      );

  }


  /*
   * =========================================
   * CLEAR CART
   * =========================================
   */

  clearCart(
    businessLocationId: number
  ): Observable<Cart | null> {


    /*
     * =======================================
     * GUEST
     * =======================================
     */

    if (!this.authService.isLoggedIn()) {

      const guestCart =
        this.getGuestCart();


      if (
        guestCart &&
        Number(
          guestCart.businessLocationId
        ) === Number(
          businessLocationId
        )
      ) {

        this.clearGuestCart();

      }


      return of(null);

    }


    /*
     * =======================================
     * LOGGED-IN
     * =======================================
     */

    const body = {

      businessLocationId:
        businessLocationId

    };


    return this.http
      .delete<ApiResponse<Cart>>(
        `${this.apiUrl}/clear`,
        {
          body
        }
      )
      .pipe(

        map(response => {

          if (
            response.responseStatus !== 1
          ) {

            throw new Error(
              response.message ||
              'Unable to clear cart.'
            );

          }


          this.cart =
            null;


          return null;

        }),

        catchError(error => {

          console.error(
            'Clear Cart API Error:',
            error
          );


          return throwError(
            () => error
          );

        })

      );

  }


  /*
   * =========================================
   * SYNC GUEST CART
   * =========================================
   *
   * Called after successful login.
   *
   * Example:
   *
   * Guest LocalStorage:
   *
   * {
   *   businessLocationId: 228,
   *   items: [
   *     {
   *       itemId: 1,
   *       quantity: 2
   *     }
   *   ]
   * }
   *
   * Becomes:
   *
   * POST /Cart/add
   *
   * {
   *   businessLocationId: 228,
   *   itemId: 1,
   *   quantity: 2
   * }
   */

  syncGuestCart(): Observable<Cart | null> {


    /*
     * =======================================
     * NOT LOGGED IN
     * =======================================
     */

    if (!this.authService.isLoggedIn()) {

      return of(null);

    }


    const guestCart =
      this.getGuestCart();


    /*
     * =======================================
     * NOTHING TO SYNC
     * =======================================
     */

    if (
      !guestCart ||
      guestCart.items.length === 0
    ) {

      return this.getCart();

    }


    console.log(
      'Syncing guest cart:',
      guestCart
    );


    /*
     * =======================================
     * SEND ITEMS ONE BY ONE
     * =======================================
     *
     * We intentionally send the exact
     * backend-required payload.
     */

    return from(
      guestCart.items
    )
      .pipe(

        switchMap(item => {

          const body = {

            businessLocationId:
              guestCart.businessLocationId,

            itemId:
              item.itemId,

            quantity:
              item.quantity

          };


          console.log(
            'Syncing guest cart item:',
            body
          );


          return this.http
            .post<ApiResponse<Cart>>(
              `${this.apiUrl}/add`,
              body
            )
            .pipe(

              map(response => {

                if (
                  response.responseStatus !== 1
                ) {

                  throw new Error(
                    response.message ||
                    'Unable to sync guest cart item.'
                  );

                }


                if (response.data) {

                  this.cart =
                    response.data;

                }


                return this.cart;

              })

            );

        }),

        /*
         * IMPORTANT:
         *
         * Only clear LocalStorage after
         * ALL guest items were successfully
         * sent to the backend.
         */

        map(() => {

          this.clearGuestCart();


          console.log(
            'Guest cart synced successfully.'
          );


          return this.cart;

        })

      );

  }


  /*
   * =========================================
   * GUEST CART STORAGE
   * =========================================
   */

  private getGuestCart():
    GuestCart | null {


    /*
     * SSR protection.
     */

    if (
      typeof localStorage ===
      'undefined'
    ) {

      return null;

    }


    const stored =
      localStorage.getItem(
        this.guestCartKey
      );


    if (!stored) {

      return null;

    }


    try {

      return JSON.parse(
        stored
      ) as GuestCart;

    }

    catch {

      localStorage.removeItem(
        this.guestCartKey
      );

      return null;

    }

  }


  /*
   * =========================================
   * SAVE GUEST CART
   * =========================================
   */

  private saveGuestCart(
    cart: GuestCart
  ): void {


    /*
     * SSR protection.
     */

    if (
      typeof localStorage ===
      'undefined'
    ) {

      return;

    }


    localStorage.setItem(

      this.guestCartKey,

      JSON.stringify(
        cart
      )

    );

  }


  /*
   * =========================================
   * CLEAR GUEST CART
   * =========================================
   */

  private clearGuestCart(): void {


    if (
      typeof localStorage ===
      'undefined'
    ) {

      return;

    }


    localStorage.removeItem(
      this.guestCartKey
    );

  }


  /*
   * =========================================
   * GET GUEST ITEMS
   * =========================================
   */

  private getGuestCartItems():
    CartItem[] {


    const guestCart =
      this.getGuestCart();


    if (!guestCart) {

      return [];

    }


    /*
     * Convert our LocalStorage model
     * into the application's CartItem model.
     */

    return guestCart.items.map(
      item => {

        const totalPrice =
          Number(item.price || 0) *
          Number(item.quantity || 0);


        return {

          itemId:
            item.itemId,

          name:
            item.name,

          category:
            item.category,

          description:
            item.description,

          price:
            Number(item.price || 0),

          totalPrice:
            totalPrice,

          quantity:
            item.quantity,

          images:
            item.image
              ? [item.image]
              : []

        } as CartItem;

      }
    );

  }


  /*
   * =========================================
   * CONVERT GUEST CART TO CART
   * =========================================
   */

  private getGuestCartAsCart():
    Cart | null {


    const guestCart =
      this.getGuestCart();


    if (
      !guestCart ||
      guestCart.items.length === 0
    ) {

      return null;

    }


    const cartItems =
      this.getGuestCartItems();


    const guestCartResult = {

      businessLocationId:
        guestCart.businessLocationId,

      cartItems:
        cartItems

    };


    return guestCartResult as Cart;

  }


  /*
   * =========================================
   * SUBTOTAL
   * =========================================
   */

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


  /*
   * =========================================
   * ITEM COUNT
   * =========================================
   */

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


  /*
   * =========================================
   * BUSINESS LOCATION
   * =========================================
   */

  getBusinessLocationId():
    number | null {


    /*
     * Logged-in user
     */

    if (
      this.authService.isLoggedIn()
    ) {

      return (
        this.cart?.businessLocationId ??
        null
      );

    }


    /*
     * Guest user
     */

    return (
      this.getGuestCart()
        ?.businessLocationId ??
      null
    );

  }


  /*
   * =========================================
   * CURRENT CART
   * =========================================
   */

  getCurrentCart():
    Cart | null {


    /*
     * Logged-in user
     */

    if (
      this.authService.isLoggedIn()
    ) {

      return this.cart;

    }


    /*
     * Guest user
     */

    return this.getGuestCartAsCart();

  }

}