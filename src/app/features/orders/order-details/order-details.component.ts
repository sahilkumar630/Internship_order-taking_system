import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent implements OnInit {

  order: Order | null = null;

  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('id'));

    if (!orderId || orderId <= 0) {
      this.errorMessage = 'Invalid order ID.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Getting Order Details:', orderId);

    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;

        console.log('Order Details:', order);
      },

      error: (error) => {
        console.error('Get Order Details API Error:', error);

        this.errorMessage =
          error?.message || 'Unable to load order details.';

        this.isLoading = false;
      }
    });
  }

  formatAmount(amount: number): string {
    return `Rs. ${amount.toLocaleString('en-PK')}`;
  }

  getItemTotal(price: number, quantity: number): number {
    return price * quantity;
  }
}