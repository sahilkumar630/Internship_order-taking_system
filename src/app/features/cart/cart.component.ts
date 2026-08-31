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

  cartItems: CartItem[] = [];


  // =========================================
  // CART STATE
  // =========================================

  isLoading = false;

  errorMessage = '';


  // =========================================
  // TOTALS
  // =========================================

  subtotal = 0;

  itemCount = 0;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private cartService: CartService,

    private router: Router

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

    this.isLoading = true;

    this.errorMessage = '';


    this.cartService
      .getCart()
      .subscribe({

        next: (cart) => {

          this.cartItems =
            cart?.cartItems ?? [];


          this.updateTotals();


          this.isLoading = false;


          console.log(
            'Cart loaded:',
            cart
          );

        },


        error: (error) => {

          this.isLoading = false;


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
      this.cartService.getSubtotal();


    this.itemCount =
      this.cartService.getItemCount();

  }


  // =========================================
  // INCREASE QUANTITY
  // =========================================

  increaseQuantity(
    itemId: number
  ): void {

    if (this.isLoading) {

      return;

    }


    this.cartService
      .increaseQuantity(itemId)
      .subscribe({

        next: (cart) => {

          this.cartItems =
            cart?.cartItems ?? [];


          this.updateTotals();

        },


        error: (error) => {

          console.error(
            'Increase Quantity Error:',
            error
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

    if (this.isLoading) {

      return;

    }


    this.cartService
      .decreaseQuantity(itemId)
      .subscribe({

        next: (cart) => {

          this.cartItems =
            cart?.cartItems ?? [];


          this.updateTotals();

        },


        error: (error) => {

          console.error(
            'Decrease Quantity Error:',
            error
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

    if (this.isLoading) {

      return;

    }


    this.cartService
      .removeItem(itemId)
      .subscribe({

        next: (cart) => {

          this.cartItems =
            cart?.cartItems ?? [];


          this.updateTotals();


          console.log(
            'Item removed successfully:',
            itemId
          );

        },


        error: (error) => {

          console.error(
            'Remove Item Error:',
            error
          );

        }

      });

  }


  // =========================================
  // CLEAR CART
  // =========================================

  clearCart(): void {

    if (
      this.isLoading ||
      this.cartItems.length === 0
    ) {

      return;

    }


    const businessLocationId =
      this.cartService.getBusinessLocationId();


    // =========================================
    // CHECK BUSINESS LOCATION
    // =========================================

    if (!businessLocationId) {

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


    this.isLoading = true;


    // =========================================
    // CALL CLEAR CART API
    // =========================================

    this.cartService
      .clearCart(businessLocationId)
      .subscribe({

        next: (response) => {

          console.log(
            'Cart cleared successfully:',
            response
          );


          this.cartItems = [];

          this.subtotal = 0;

          this.itemCount = 0;

          this.errorMessage = '';

          this.isLoading = false;

        },


        error: (error) => {

          console.error(
            'Clear Cart Error:',
            error
          );


          this.isLoading = false;


          this.errorMessage =
            error?.error?.message ||
            'Unable to clear cart.';

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
      item.price ?? 0
    );

  }


  // =========================================
  // ITEM TOTAL
  // =========================================

  getItemTotal(
    item: CartItem
  ): number {

    return Number(
      item.totalPrice ??
      (
        Number(item.price ?? 0) *
        Number(item.quantity ?? 0)
      )
    );

  }

}