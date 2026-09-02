import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {

  orders: Order[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // 0 = all orders
    this.orderService.getMyOrders(10).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;

        console.log('My Orders:', orders);
      },

      error: (error) => {
        console.error('Failed to load orders:', error);

        this.errorMessage =
          error?.message || 'Unable to load your orders.';

        this.isLoading = false;
      }
    });
  }

  getItemSummary(order: Order): string {
    if (!order.cart?.cartItems?.length) {
      return 'No items';
    }

    return order.cart.cartItems
      .map(item => `${item.name} × ${item.quantity}`)
      .join(', ');
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  formatAmount(amount: number): string {
    return `Rs. ${amount.toLocaleString('en-PK')}`;
  }
}