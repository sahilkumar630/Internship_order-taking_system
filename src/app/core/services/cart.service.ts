import { Injectable } from '@angular/core';

import { CartItem }
  from '../../shared/models/cart-item.model';

import { MenuItem }
  from '../../shared/models/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartItems: CartItem[] = [];


  // =========================================
  // GET CART ITEMS
  // =========================================

  getItems(): CartItem[] {

    return this.cartItems;

  }


  // =========================================
  // ADD ITEM
  // =========================================

  addItem(menuItem: MenuItem): void {

    const existingItem =
      this.cartItems.find(
        item => item.menuItem.id === menuItem.id
      );


    if (existingItem) {

      existingItem.quantity++;

      return;

    }


    this.cartItems.push({

      menuItem: menuItem,

      quantity: 1

    });

  }


  // =========================================
  // REMOVE ITEM
  // =========================================

  removeItem(menuItemId: number): void {

    this.cartItems =
      this.cartItems.filter(
        item => item.menuItem.id !== menuItemId
      );

  }


  // =========================================
  // INCREASE QUANTITY
  // =========================================

  increaseQuantity(menuItemId: number): void {

    const item =
      this.cartItems.find(
        item => item.menuItem.id === menuItemId
      );


    if (item) {

      item.quantity++;

    }

  }


  // =========================================
  // DECREASE QUANTITY
  // =========================================

  decreaseQuantity(menuItemId: number): void {

    const item =
      this.cartItems.find(
        item => item.menuItem.id === menuItemId
      );


    if (!item) {

      return;

    }


    if (item.quantity > 1) {

      item.quantity--;

      return;

    }


    this.removeItem(menuItemId);

  }


  // =========================================
  // GET SUBTOTAL
  // =========================================

  getSubtotal(): number {

    return this.cartItems.reduce(

      (total, item) => {

        return total +
          (item.menuItem.price * item.quantity);

      },

      0

    );

  }


  // =========================================
  // GET TOTAL ITEMS
  // =========================================

  getItemCount(): number {

    return this.cartItems.reduce(

      (total, item) => {

        return total + item.quantity;

      },

      0

    );

  }


  // =========================================
  // CLEAR CART
  // =========================================

  clearCart(): void {

    this.cartItems = [];

  }

}