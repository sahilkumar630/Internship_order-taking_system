import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CartService }
  from '../../core/services/cart.service';

import { CartItem }
  from '../../shared/models/cart-item.model';


@Component({
  selector: 'app-cart',

  imports: [
    RouterLink
  ],

  templateUrl: './cart.component.html',

  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {


  // =========================================
  // CART ITEMS
  // =========================================

  cartItems: CartItem[] = [];


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

    this.cartItems =
      this.cartService.getItems();

    this.updateTotals();

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
    menuItemId: number
  ): void {

    this.cartService.increaseQuantity(
      menuItemId
    );

    this.loadCart();

  }


  // =========================================
  // DECREASE QUANTITY
  // =========================================

  decreaseQuantity(
    menuItemId: number
  ): void {

    this.cartService.decreaseQuantity(
      menuItemId
    );

    this.loadCart();

  }


  // =========================================
  // REMOVE ITEM
  // =========================================

  removeItem(
    menuItemId: number
  ): void {

    this.cartService.removeItem(
      menuItemId
    );

    this.loadCart();

  }


  // =========================================
  // CLEAR CART
  // =========================================

  clearCart(): void {

    this.cartService.clearCart();

    this.loadCart();

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

    if (this.cartItems.length === 0) {

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

    return (
      item.menuItem.discountPrice > 0 &&
      item.menuItem.discountPrice < item.menuItem.price
    )
      ? item.menuItem.discountPrice
      : item.menuItem.price;

  }


  // =========================================
  // ITEM TOTAL
  // =========================================

  getItemTotal(
    item: CartItem
  ): number {

    return (
      this.getItemPrice(item) *
      item.quantity
    );

  }

}