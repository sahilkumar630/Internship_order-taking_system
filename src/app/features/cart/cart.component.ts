import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  CartService
} from '../../core/services/cart.service';

import {
  CartItem
} from '../../shared/models/cart-item.model';


@Component({

  selector: 'app-cart',

  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl:
    './cart.component.html',

  styleUrl:
    './cart.component.css'

})
export class CartComponent
  implements OnInit {


  // =========================================
  // CART ITEMS
  // =========================================

  cartItems:
    CartItem[] = [];


  // =========================================
  // CART STATE
  // =========================================

  isLoading =
    false;

  errorMessage =
    '';


  // =========================================
  // TOTALS
  // =========================================

  subtotal =
    0;

  itemCount =
    0;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private cartService:
      CartService,

    private router:
      Router,

    @Inject(PLATFORM_ID)
    private platformId:
      object

  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    // =======================================
    // SSR / PRERENDER PROTECTION
    // =======================================

    /*
     * Cart data belongs to the logged-in
     * browser user.
     *
     * Do not call the cart API while Angular
     * is rendering the page on the server.
     */

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {

      return;

    }


    // =======================================
    // LOAD CART IN BROWSER
    // =======================================

    this.loadCart();

  }


  // =========================================
  // LOAD CART
  // =========================================

  loadCart(): void {

    // =======================================
    // BROWSER CHECK
    // =======================================

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {

      return;

    }


    // =======================================
    // PREVENT DUPLICATE REQUEST
    // =======================================

    if (
      this.isLoading
    ) {

      return;

    }


    this.isLoading =
      true;

    this.errorMessage =
      '';


    // =======================================
    // GET CART
    // =======================================

    this.cartService

      .getCart()

      .subscribe({

        // ===================================
        // SUCCESS
        // ===================================

        next: (
          cart
        ) => {

          console.log(
            'Cart loaded:',
            cart
          );


          // ---------------------------------
          // CART ITEMS
          // ---------------------------------

          this.cartItems =
            cart?.cartItems ?? [];


          // ---------------------------------
          // TOTALS
          // ---------------------------------

          this.updateTotals();


          // ---------------------------------
          // STOP LOADING
          // ---------------------------------

          this.isLoading =
            false;

        },


        // ===================================
        // ERROR
        // ===================================

        error: (
          error: unknown
        ) => {

          this.isLoading =
            false;


          console.error(
            'Cart Load Error:',
            error
          );


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load cart.'
            );

        }

      });

  }


  // =========================================
  // UPDATE TOTALS
  // =========================================

  private updateTotals(): void {

    this.subtotal =
      Number(
        this.cartService.getSubtotal()
      );


    this.itemCount =
      Number(
        this.cartService.getItemCount()
      );

  }


  // =========================================
  // INCREASE QUANTITY
  // =========================================

  increaseQuantity(
    itemId: number
  ): void {

    // =======================================
    // VALIDATION
    // =======================================

    if (
      this.isLoading ||
      !itemId
    ) {

      return;

    }


    // =======================================
    // UPDATE QUANTITY
    // =======================================

    this.cartService

      .increaseQuantity(
        itemId
      )

      .subscribe({

        // ===================================
        // SUCCESS
        // ===================================

        next: (
          cart
        ) => {

          this.cartItems =
            cart?.cartItems ?? [];


          this.updateTotals();

        },


        // ===================================
        // ERROR
        // ===================================

        error: (
          error: unknown
        ) => {

          console.error(
            'Increase Quantity Error:',
            error
          );


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to increase item quantity.'
            );

        }

      });

  }


  // =========================================
  // DECREASE QUANTITY
  // =========================================

  decreaseQuantity(
    itemId: number
  ): void {

    // =======================================
    // VALIDATION
    // =======================================

    if (
      this.isLoading ||
      !itemId
    ) {

      return;

    }


    // =======================================
    // UPDATE QUANTITY
    // =======================================

    this.cartService

      .decreaseQuantity(
        itemId
      )

      .subscribe({

        // ===================================
        // SUCCESS
        // ===================================

        next: (
          cart
        ) => {

          this.cartItems =
            cart?.cartItems ?? [];


          this.updateTotals();

        },


        // ===================================
        // ERROR
        // ===================================

        error: (
          error: unknown
        ) => {

          console.error(
            'Decrease Quantity Error:',
            error
          );


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to decrease item quantity.'
            );

        }

      });

  }


  // =========================================
  // REMOVE ITEM
  // =========================================

  removeItem(
    itemId: number
  ): void {

    // =======================================
    // VALIDATION
    // =======================================

    if (
      this.isLoading ||
      !itemId
    ) {

      return;

    }


    // =======================================
    // REMOVE ITEM
    // =======================================

    this.cartService

      .removeItem(
        itemId
      )

      .subscribe({

        // ===================================
        // SUCCESS
        // ===================================

        next: (
          cart
        ) => {

          this.cartItems =
            cart?.cartItems ?? [];


          this.updateTotals();


          console.log(
            'Item removed successfully:',
            itemId
          );

        },


        // ===================================
        // ERROR
        // ===================================

        error: (
          error: unknown
        ) => {

          console.error(
            'Remove Item Error:',
            error
          );


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to remove item.'
            );

        }

      });

  }


  // =========================================
  // CLEAR CART
  // =========================================

  clearCart(): void {

    // =======================================
    // VALIDATION
    // =======================================

    if (
      this.isLoading ||
      this.cartItems.length === 0
    ) {

      return;

    }


    // =======================================
    // GET BUSINESS LOCATION
    // =======================================

    const businessLocationId =
      this.cartService
        .getBusinessLocationId();


    // =======================================
    // VALIDATE BUSINESS LOCATION
    // =======================================

    if (
      !businessLocationId
    ) {

      console.error(
        'Cannot clear cart: businessLocationId is missing.'
      );


      this.errorMessage =
        'Unable to identify the restaurant cart.';


      return;

    }


    console.log(
      'Clearing cart for businessLocationId:',
      businessLocationId
    );


    // =======================================
    // START LOADING
    // =======================================

    this.isLoading =
      true;

    this.errorMessage =
      '';


    // =======================================
    // CLEAR CART API
    // =======================================

    this.cartService

      .clearCart(
        businessLocationId
      )

      .subscribe({

        // ===================================
        // SUCCESS
        // ===================================

        next: (
          response
        ) => {

          console.log(
            'Cart cleared successfully:',
            response
          );


          // ---------------------------------
          // RESET CART
          // ---------------------------------

          this.cartItems =
            [];


          this.subtotal =
            0;


          this.itemCount =
            0;


          this.errorMessage =
            '';


          this.isLoading =
            false;

        },


        // ===================================
        // ERROR
        // ===================================

        error: (
          error: unknown
        ) => {

          console.error(
            'Clear Cart Error:',
            error
          );


          this.isLoading =
            false;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to clear cart.'
            );

        }

      });

  }


  // =========================================
  // CONTINUE SHOPPING
  // =========================================

  continueShopping(): void {

    this.router.navigate([
      '/restaurants'
    ]);

  }


  // =========================================
  // CHECKOUT
  // =========================================

  checkout(): void {

    // =======================================
    // EMPTY CART CHECK
    // =======================================

    if (
      this.cartItems.length === 0
    ) {

      this.errorMessage =
        'Your cart is empty.';


      return;

    }


    // =======================================
    // GO TO CHECKOUT
    // =======================================

    this.router.navigate([
      '/checkout'
    ]);

  }


  // =========================================
  // GET ITEM PRICE
  // =========================================

  getItemPrice(
    item: CartItem
  ): number {

    return Number(
      item?.price ?? 0
    );

  }


  // =========================================
  // GET ITEM TOTAL
  // =========================================

  getItemTotal(
    item: CartItem
  ): number {

    const price =
      Number(
        item?.price ?? 0
      );


    const quantity =
      Number(
        item?.quantity ?? 0
      );


    return Number(
      item?.totalPrice ??
      (
        price *
        quantity
      )
    );

  }


  // =========================================
  // ERROR MESSAGE
  // =========================================

  private getErrorMessage(

    error: unknown,

    fallback: string

  ): string {

    // =======================================
    // STANDARD ERROR
    // =======================================

    if (
      error instanceof Error &&
      error.message
    ) {

      return error.message;

    }


    // =======================================
    // HTTP ERROR
    // =======================================

    if (
      typeof error === 'object' &&
      error !== null
    ) {

      const httpError =
        error as {

          error?: {

            message?: string;

          };

          message?: string;

        };


      return (
        httpError.error?.message ||
        httpError.message ||
        fallback
      );

    }


    return fallback;

  }

}