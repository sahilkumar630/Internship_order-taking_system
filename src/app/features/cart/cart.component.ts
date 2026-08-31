import {
  Component,
  OnInit
} from '@angular/core';

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

  isUpdating =
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
      Router

  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.loadCart();

  }


  // =========================================
  // LOAD CART
  // =========================================

  loadCart(): void {

    this.isLoading =
      true;

    this.errorMessage =
      '';


    this.cartService

      .getCart()

      .subscribe({

        next:
          cart => {

            this.cartItems =
              cart?.cartItems || [];


            this.updateTotals();


            this.isLoading =
              false;


            console.log(
              'Cart loaded:',
              cart
            );

          },


        error:
          error => {

            this.isLoading =
              false;


            console.error(
              'Cart Load Error:',
              error
            );


            this.errorMessage =
              error?.error?.message ||
              'Unable to load cart.';

          }

      });

  }


  // =========================================
  // UPDATE TOTALS
  // =========================================

  private updateTotals(): void {

    this.subtotal =
      this.cartService
        .getSubtotal();


    this.itemCount =
      this.cartService
        .getItemCount();

  }


  // =========================================
  // INCREASE QUANTITY
  // =========================================

  increaseQuantity(
    itemId: number
  ): void {

    if (
      this.isUpdating
    ) {

      return;

    }


    this.isUpdating =
      true;


    this.cartService

      .increaseQuantity(
        itemId
      )

      .subscribe({

        next:
          cart => {

            this.cartItems =
              cart?.cartItems || [];


            this.updateTotals();


            this.isUpdating =
              false;

          },


        error:
          error => {

            console.error(
              'Increase Quantity Error:',
              error
            );


            this.isUpdating =
              false;

          }

      });

  }


  // =========================================
  // DECREASE QUANTITY
  // =========================================

  decreaseQuantity(
    itemId: number
  ): void {

    if (
      this.isUpdating
    ) {

      return;

    }


    this.isUpdating =
      true;


    this.cartService

      .decreaseQuantity(
        itemId
      )

      .subscribe({

        next:
          cart => {

            this.cartItems =
              cart?.cartItems || [];


            this.updateTotals();


            this.isUpdating =
              false;

          },


        error:
          error => {

            console.error(
              'Decrease Quantity Error:',
              error
            );


            this.isUpdating =
              false;

          }

      });

  }


  // =========================================
  // REMOVE ITEM
  // =========================================

  removeItem(
    itemId: number
  ): void {

    if (
      this.isUpdating
    ) {

      return;

    }


    this.isUpdating =
      true;


    console.log(
      'Removing item from cart:',
      itemId
    );


    this.cartService

      .removeItem(
        itemId
      )

      .subscribe({

        next:
          cart => {

            this.cartItems =
              cart?.cartItems || [];


            this.updateTotals();


            this.isUpdating =
              false;


            console.log(
              'Item removed successfully:',
              cart
            );

          },


        error:
          error => {

            console.error(
              'Remove Item Error:',
              error
            );


            this.isUpdating =
              false;

          }

      });

  }


  // =========================================
  // CLEAR CART
  // =========================================

  clearCart(): void {

    if (
      this.cartItems.length === 0 ||
      this.isUpdating
    ) {

      return;

    }


    this.isUpdating =
      true;


    this.cartService

      .clearCart()

      .subscribe({

        next:
          () => {

            this.cartItems =
              [];

            this.subtotal =
              0;

            this.itemCount =
              0;


            this.isUpdating =
              false;


            console.log(
              'Cart cleared successfully.'
            );

          },


        error:
          error => {

            console.error(
              'Clear Cart Error:',
              error
            );


            this.isUpdating =
              false;

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

    if (
      this.cartItems.length === 0
    ) {

      return;

    }


    this.router.navigate([
      '/checkout'
    ]);

  }


  // =========================================
  // ITEM PRICE
  // =========================================

  getItemPrice(
    item: CartItem
  ): number {

    return Number(
      item.price || 0
    );

  }


  // =========================================
  // ITEM TOTAL
  // =========================================

  getItemTotal(
    item: CartItem
  ): number {

    return Number(
      item.totalPrice ||
      (
        item.price *
        item.quantity
      )
    );

  }

}