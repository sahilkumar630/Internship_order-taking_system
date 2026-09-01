import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  CartService
} from '../../core/services/cart.service';

import {
  LocationService
} from '../../core/services/location.service';

import {
  OrderService,
  CreateOrderRequest
} from '../../core/services/order.service';

import {
  CartItem
} from '../../shared/models/cart-item.model';

import {
  UserLocation,
  SavedAddress
} from '../../shared/models/location.model';


@Component({

  selector: 'app-checkout',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './checkout.component.html',

  styleUrl:
    './checkout.component.css'

})
export class CheckoutComponent
  implements OnInit {


  // =========================================
  // CART ITEMS
  // =========================================

  cartItems: CartItem[] = [];


  // =========================================
  // USER LOCATION
  // =========================================

  userLocation:
    UserLocation | null = null;


  // =========================================
  // BUSINESS LOCATION
  // =========================================

  businessLocationId:
    number | null = null;


  // =========================================
  // TOTALS
  // =========================================

  subtotal = 0;

  itemCount = 0;


  // =========================================
  // PAYMENT METHOD
  // =========================================

  paymentMethod:
    'cash' | 'wallet' = 'cash';


  // =========================================
  // WALLET
  // =========================================

  walletBalance = 0;

  walletAvailable = false;

  isLoadingWallet = false;


  // =========================================
  // CHECKOUT STATE
  // =========================================

  isLoading = false;

  isLoadingAddress = false;

  isPlacingOrder = false;

  errorMessage = '';

  successMessage = '';


  // =========================================
  // ORDER RESULT
  // =========================================

  orderId:
    number | null = null;

  orderNumber = '';


  // =========================================
  // ORDER NOTES
  // =========================================

  notes = '';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private cartService:
      CartService,

    private locationService:
      LocationService,

    private orderService:
      OrderService,

    private router:
      Router

  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.loadCheckout();

  }


  // =========================================
  // LOAD CHECKOUT
  // =========================================

  loadCheckout(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.successMessage = '';


    // =========================================
    // LOAD LOCAL LOCATION
    // =========================================

    this.userLocation =
      this.locationService.getLocation();


    console.log(
      'Checkout Local Location:',
      this.userLocation
    );


    // =========================================
    // LOAD CART
    // =========================================

    this.cartService

      .getCart()

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next: cart => {

          console.log(
            'Checkout Cart:',
            cart
          );


          // -----------------------------------
          // CART ITEMS
          // -----------------------------------

          this.cartItems =
            cart?.cartItems ?? [];


          // -----------------------------------
          // BUSINESS LOCATION
          // -----------------------------------

          this.businessLocationId =
            cart?.businessLocationId ??
            this.cartService
              .getBusinessLocationId();


          // -----------------------------------
          // TOTALS
          // -----------------------------------

          this.updateTotals();


          this.isLoading =
            false;


          // -----------------------------------
          // EMPTY CART
          // -----------------------------------

          if (
            this.cartItems.length === 0
          ) {

            this.errorMessage =
              'Your cart is empty.';

            return;

          }


          // -----------------------------------
          // ENSURE ADDRESS
          // -----------------------------------

          this.ensureDeliveryAddress();

        },


        // =====================================
        // ERROR
        // =====================================

        error: error => {

          this.isLoading =
            false;


          console.error(
            'Checkout Cart Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to load your cart.';

        }

      });

  }


  // =========================================
  // ENSURE DELIVERY ADDRESS
  // =========================================

  private ensureDeliveryAddress(): void {

    // -----------------------------------------
    // LOCAL ADDRESS ALREADY EXISTS
    // -----------------------------------------

    if (
      this.userLocation?.userAddressId
    ) {

      console.log(
        'Saved userAddressId found:',
        this.userLocation.userAddressId
      );

      return;

    }


    // -----------------------------------------
    // LOAD BACKEND ADDRESSES
    // -----------------------------------------

    this.loadDefaultAddress();

  }


  // =========================================
  // LOAD DEFAULT ADDRESS
  // =========================================

  private loadDefaultAddress(): void {

    this.isLoadingAddress =
      true;


    this.locationService

      .getMyAddresses()

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next: (
          addresses: SavedAddress[]
        ) => {

          this.isLoadingAddress =
            false;


          console.log(
            'Checkout Saved Addresses:',
            addresses
          );


          // -----------------------------------
          // NO ADDRESSES
          // -----------------------------------

          if (
            !addresses ||
            addresses.length === 0
          ) {

            console.warn(
              'No saved addresses found.'
            );

            return;

          }


          // -----------------------------------
          // FIND DEFAULT
          // -----------------------------------

          let selectedAddress:
            SavedAddress | undefined;


          selectedAddress =
            addresses.find(
              address =>
                address.default === true
            );


          // -----------------------------------
          // FALLBACK
          // -----------------------------------

          if (
            !selectedAddress
          ) {

            selectedAddress =
              addresses[0];

          }


          // -----------------------------------
          // VALIDATE ADDRESS
          // -----------------------------------

          if (
            !selectedAddress ||
            !selectedAddress.id
          ) {

            console.warn(
              'No valid saved address found.'
            );

            return;

          }


          // -----------------------------------
          // CONVERT TO USER LOCATION
          // -----------------------------------

          const location:
            UserLocation = {

            latitude:
              Number(
                selectedAddress.latitude ?? 0
              ),

            longitude:
              Number(
                selectedAddress.longitude ?? 0
              ),

            address:
              selectedAddress.address ??
              '',

            source:
              'manual',

            cityId:
              selectedAddress.cityId,

            userAddressId:
              selectedAddress.id,

            label:
              selectedAddress.label,

            area:
              selectedAddress.area,

            houseNumber:
              selectedAddress.houseNumber,

            floor:
              selectedAddress.floor,

            apartment:
              selectedAddress.apartment,

            landmark:
              selectedAddress.landmark,

            isDefault:
              selectedAddress.default

          };


          // -----------------------------------
          // UPDATE CHECKOUT LOCATION
          // -----------------------------------

          this.userLocation =
            location;


          // -----------------------------------
          // SAVE LOCALLY
          // -----------------------------------

          this.locationService.saveLocation(
            location
          );


          console.log(
            'Checkout Delivery Address:',
            location
          );


          console.log(
            'Checkout userAddressId:',
            location.userAddressId
          );

        },


        // =====================================
        // ERROR
        // =====================================

        error: error => {

          this.isLoadingAddress =
            false;


          console.error(
            'Checkout Address API Error:',
            error
          );

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
  // SELECT PAYMENT METHOD
  // =========================================

  selectPaymentMethod(
    method: 'cash' | 'wallet'
  ): void {

    this.paymentMethod =
      method;


    console.log(
      'Selected payment method:',
      method
    );

  }


  // =========================================
  // CHECK DELIVERY ADDRESS
  // =========================================

  hasDeliveryAddress(): boolean {

    return !!(
      this.userLocation &&
      this.userLocation.userAddressId
    );

  }


  // =========================================
  // GET DELIVERY ADDRESS
  // =========================================

  getDeliveryAddress(): string {

    if (
      !this.userLocation
    ) {

      return 'No delivery address selected';

    }


    return (
      this.userLocation.address ||
      'Saved delivery address'
    );

  }


  // =========================================
  // GET DELIVERY AREA
  // =========================================

  getDeliveryArea(): string {

    if (
      !this.userLocation
    ) {

      return '';

    }


    return [

      this.userLocation.area,

      this.userLocation.landmark

    ]

      .filter(
        value =>
          !!value &&
          value.trim().length > 0
      )

      .join(', ');

  }


  // =========================================
  // GET ITEM PRICE
  // =========================================

  getItemPrice(
    item: CartItem
  ): number {

    return Number(
      item.price ?? 0
    );

  }


  // =========================================
  // GET ITEM TOTAL
  // =========================================

  getItemTotal(
    item: CartItem
  ): number {

    return Number(

      item.totalPrice ??

      (
        Number(
          item.price ?? 0
        ) *

        Number(
          item.quantity ?? 0
        )
      )

    );

  }


  // =========================================
  // GET ITEM COUNT LABEL
  // =========================================

  getItemCountLabel(): string {

    return this.itemCount === 1
      ? 'item'
      : 'items';

  }


  // =========================================
  // PLACE ORDER
  // =========================================

  placeOrder(): void {

    // =========================================
    // RESET MESSAGES
    // =========================================

    this.errorMessage = '';

    this.successMessage = '';


    // =========================================
    // PREVENT DOUBLE SUBMISSION
    // =========================================

    if (
      this.isPlacingOrder
    ) {

      return;

    }


    // =========================================
    // CART VALIDATION
    // =========================================

    if (
      this.cartItems.length === 0
    ) {

      this.errorMessage =
        'Your cart is empty.';

      return;

    }


    // =========================================
    // BUSINESS LOCATION VALIDATION
    // =========================================

    if (
      !this.businessLocationId
    ) {

      this.errorMessage =
        'Unable to identify the restaurant.';


      console.error(
        'Checkout businessLocationId is missing.'
      );


      return;

    }


    // =========================================
    // ADDRESS VALIDATION
    // =========================================

    if (
      !this.userLocation?.userAddressId
    ) {

      this.errorMessage =
        'Please select a delivery address before placing your order.';


      console.warn(
        'No saved user address ID found.'
      );


      return;

    }


    // =========================================
    // WALLET VALIDATION
    // =========================================

    if (
      this.paymentMethod === 'wallet'
    ) {

      this.errorMessage =
        'Wallet payment is not available yet.';


      console.warn(
        'Wallet payment API is still pending.'
      );


      return;

    }


    // =========================================
    // START ORDER
    // =========================================

    this.isPlacingOrder =
      true;


    // =========================================
    // CREATE REQUEST
    // =========================================

    const orderRequest:
      CreateOrderRequest = {

      businessLocationId:
        this.businessLocationId,

      userAddressId:
        this.userLocation.userAddressId,

      orderType:
        1,

      notes:
        this.notes.trim(),

      addressRequest:
        null

    };


    // =========================================
    // DEBUG
    // =========================================

    console.log(
      'Order Request:',
      orderRequest
    );


    console.log(
      'Payment Method:',
      this.paymentMethod
    );


    // =========================================
    // CALL ORDER API
    // =========================================

    this.orderService

      .createOrder(
        orderRequest
      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next: response => {

          console.log(
            'Order Created Successfully:',
            response
          );


          this.isPlacingOrder =
            false;


          // -----------------------------------
          // SAVE ORDER ID
          // -----------------------------------

          this.orderId =
            response.data;


          // -----------------------------------
          // SAVE SUCCESS MESSAGE
          // -----------------------------------

          this.successMessage =
            response.message ||
            'Your order has been placed successfully.';


          // -----------------------------------
          // EXTRACT ORDER NUMBER
          // -----------------------------------

          this.orderNumber =
            this.extractOrderNumber(
              response.message
            );


          console.log(
            'Order ID:',
            this.orderId
          );


          console.log(
            'Order Number:',
            this.orderNumber
          );


          // -----------------------------------
          // GO TO ORDERS
          // -----------------------------------

          this.router.navigate([
            '/orders'
          ]);

        },


        // =====================================
        // ERROR
        // =====================================

        error: error => {

          this.isPlacingOrder =
            false;


          console.error(
            'Create Order API Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to place your order. Please try again.';

        }

      });

  }


  // =========================================
  // EXTRACT ORDER NUMBER
  // =========================================

  private extractOrderNumber(
    message: string | undefined
  ): string {

    if (
      !message
    ) {

      return '';

    }


    const match =
      message.match(
        /Order Number:([^ ]+)/
      );


    return (
      match?.[1] ??
      ''
    );

  }


  // =========================================
  // CHANGE ADDRESS
  // =========================================

  changeAddress(): void {

    this.router.navigate(

      ['/location'],

      {
        queryParams: {
          returnUrl: '/checkout'
        }
      }

    );

  }


  // =========================================
  // BACK TO CART
  // =========================================

  backToCart(): void {

    this.router.navigate([
      '/cart'
    ]);

  }

}