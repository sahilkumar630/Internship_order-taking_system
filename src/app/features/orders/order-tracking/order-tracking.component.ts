import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.css'
})
export class OrderTrackingComponent implements OnInit {

  order: Order | null = null;

  isLoading = false;
  isCancelling = false;

  errorMessage = '';

  showCancelPopup = false;


  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}


  ngOnInit(): void {
    this.loadOrder();
  }


  // ==========================
  // Load Order
  // ==========================

  loadOrder(): void {

    const orderId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!orderId || orderId <= 0) {

      this.errorMessage = 'Invalid order ID.';

      return;
    }


    this.isLoading = true;
    this.errorMessage = '';


    console.log(
      'Getting Order Tracking:',
      orderId
    );


    this.orderService.getOrderById(orderId).subscribe({

      next: (order) => {

        this.order = order;

        this.isLoading = false;

        console.log(
          'Order Tracking:',
          order
        );

      },


      error: (error) => {

        console.error(
          'Get Order Tracking API Error:',
          error
        );


        this.errorMessage =
          error?.message ||
          'Unable to load order tracking.';


        this.isLoading = false;

      }

    });

  }


  // ==========================
  // Status Helpers
  // ==========================

  isStatusCompleted(statusId: number): boolean {

    if (!this.order) {
      return false;
    }

    return statusId <= this.order.statusId;

  }


  isCurrentStatus(statusId: number): boolean {

    return this.order?.statusId === statusId;

  }


  getStatusClass(statusId: number): string {

    if (!this.order) {
      return '';
    }


    if (statusId < this.order.statusId) {

      return 'completed';

    }


    if (statusId === this.order.statusId) {

      return 'current';

    }


    return 'pending';

  }


  // ==========================
  // Amount
  // ==========================

  formatAmount(amount: number): string {

    return `Rs. ${amount.toLocaleString('en-PK')}`;

  }


  // ==========================
  // Cancel Popup
  // ==========================

  openCancelPopup(): void {

    if (!this.order) {
      return;
    }


    // Don't allow cancellation
    // if already cancelled or delivered.
    if (
      this.order.status === 'CANCELLED' ||
      this.order.status === 'DELIVERED'
    ) {

      return;

    }


    this.showCancelPopup = true;

  }


  closeCancelPopup(): void {

    if (this.isCancelling) {
      return;
    }


    this.showCancelPopup = false;

  }


  // ==========================
  // Cancel Order
  // ==========================

  cancelOrder(): void {

    if (!this.order) {
      return;
    }


    if (this.isCancelling) {
      return;
    }


    const orderId = this.order.id;


    this.isCancelling = true;
    this.errorMessage = '';


    console.log(
      'Cancelling Order:',
      orderId
    );


    this.orderService
      .updateOrderStatus(orderId, 90)
      .subscribe({

        next: (response) => {

          console.log(
            'Cancel Order Response:',
            response
          );


          this.isCancelling = false;

          this.showCancelPopup = false;


          // Reload the order so the
          // updated status is displayed.
          this.loadOrder();

        },


        error: (error) => {

          console.error(
            'Cancel Order API Error:',
            error
          );


          this.isCancelling = false;


          this.errorMessage =
            error?.message ||
            'Unable to cancel the order. Please try again.';

        }

      });

  }

}