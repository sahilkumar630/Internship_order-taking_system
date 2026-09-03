import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
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
  AuthService
} from '../../core/services/auth.service';

import {
  AuthPopupComponent
} from '../../shared/components/auth-popup/auth-popup.component';

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
    FormsModule,
    AuthPopupComponent
  ],

  templateUrl:
    './checkout.component.html',

  styleUrl:
    './checkout.component.css'

})
export class CheckoutComponent
  implements OnInit {


  // =========================================
  // CART
  // =========================================

  cartItems:
    CartItem[] = [];


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

  subtotal =
    0;

  itemCount =
    0;


  // =========================================
  // PAYMENT
  // =========================================

  paymentMethod:
    'cash' | 'wallet' = 'cash';


  // =========================================
  // WALLET
  // =========================================

  walletBalance =
    0;

  walletAvailable =
    false;

  isLoadingWallet =
    false;


  // =========================================
  // CHECKOUT STATE
  // =========================================

  isLoading =
    false;

  isLoadingAddress =
    false;

  isSyncingLocation =
    false;

  isPlacingOrder =
    false;


  // =========================================
  // GENERAL MESSAGES
  // =========================================

  errorMessage = '';
  successMessage = '';

  notes = '';

  orderId: number | null = null;
  orderNumber = '';


  // =========================================
  // SERVICES
  // =========================================

  constructor(
    private readonly cartService: CartService,
    private readonly locationService: LocationService,
    private readonly orderService: OrderService,
    private readonly authService: AuthService,
    private readonly router: Router,
    @Inject(PLATFORM_ID)
    private readonly platformId: object
  ) {}


  // =========================================
  // COMPONENT INIT
  // =========================================

  ngOnInit(): void {
    this.loadCheckout();
  }


  // =========================================
  // =========================================
  // REUSABLE AUTH POPUP
  // =========================================

  showLoginPopup = false;

  openLoginPopup(): void {
    if (!this.authService.isLoggedIn()) {
      this.showLoginPopup = true;
    }
  }

  closeLoginPopup(): void {
    this.showLoginPopup = false;
  }

  onAuthenticated(): void {
    this.showLoginPopup = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.isSyncingLocation = true;

    this.locationService.syncGuestLocationToBackend().subscribe({
      next: (syncedLocation) => {
        if (syncedLocation) {
          this.userLocation = syncedLocation;
        }

        this.cartService.syncGuestCart().subscribe({
          next: () => {
            this.isSyncingLocation = false;
            this.loadCheckout();
          },
          error: (error: unknown) => {
            this.isSyncingLocation = false;
            this.errorMessage = this.getErrorMessage(
              error,
              'Authentication succeeded, but we could not synchronize your cart. Please try again.'
            );
            this.loadCheckout();
          }
        });
      },
      error: (error: unknown) => {
        this.isSyncingLocation = false;
        this.errorMessage = this.getErrorMessage(
          error,
          'Authentication succeeded, but we could not save your delivery location. Please try again.'
        );
      }
    });
  }


  // LOAD CHECKOUT
  // =========================================

  loadCheckout(): void {

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
    // AUTHENTICATION IS NOT REQUIRED TO LOAD
    // THE CHECKOUT SCREEN.
    //
    // Guest users use their local cart.
    // Authentication is required only before
    // placing the order.
    // =======================================

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

    this.successMessage =
      '';


    // =======================================
    // LOAD LOCAL LOCATION
    // =======================================

    this.userLocation =
      this.locationService.getLocation();


    console.log(
      'Checkout Local Location:',
      this.userLocation
    );


    // =======================================
    // LOAD CART
    // =======================================

    this.cartService

      .getCart()

      .subscribe({

        // ===================================
        // SUCCESS
        // ===================================

        next:
          (cart) => {

            console.log(
              'Checkout Cart:',
              cart
            );


            // ---------------------------------
            // CART ITEMS
            // ---------------------------------

            this.cartItems =
              cart?.cartItems ?? [];


            // ---------------------------------
            // BUSINESS LOCATION
            // ---------------------------------

            this.businessLocationId =
              cart?.businessLocationId ??
              this.cartService
                .getBusinessLocationId();


            // ---------------------------------
            // TOTALS
            // ---------------------------------

            this.updateTotals();


            // ---------------------------------
            // STOP CART LOADING
            // ---------------------------------

            this.isLoading =
              false;


            // ---------------------------------
            // EMPTY CART
            // ---------------------------------

            if (
              this.cartItems.length === 0
            ) {

              this.errorMessage =
                'Your cart is empty.';

              return;

            }


            // ---------------------------------
            // ADDRESS
            // ---------------------------------

            if (this.authService.isLoggedIn()) {

              this.ensureDeliveryAddress();

            } else {

              console.log(
                'Guest checkout loaded. Delivery address will be resolved after login.'
              );

            }

          },


        // ===================================
        // ERROR
        // ===================================

        error:
          (error: unknown) => {

            this.isLoading =
              false;


            console.error(
              'Checkout Cart Error:',
              error
            );


            this.errorMessage =
              this.getErrorMessage(
                error,
                'Unable to load your cart.'
              );

          }

      });

  }


  // =========================================
  // ENSURE DELIVERY ADDRESS
  // =========================================

  private ensureDeliveryAddress(): void {

    // =======================================
    // AUTH CHECK
    // =======================================

    if (
      !this.authService.isLoggedIn()
    ) {

      this.showLoginPopup =
        true;

      return;

    }


    // =======================================
    // ADDRESS ALREADY EXISTS
    // =======================================

    if (
      this.userLocation?.userAddressId &&
      Number(
        this.userLocation.userAddressId
      ) > 0
    ) {

      console.log(
        'Existing backend address ID:',
        this.userLocation.userAddressId
      );


      return;

    }


    // =======================================
    // GUEST LOCATION EXISTS
    // =======================================

    if (
      this.userLocation &&
      this.userLocation.cityId &&
      this.userLocation.address
    ) {

      this.syncGuestLocation();

      return;

    }


    // =======================================
    // NO USABLE LOCAL LOCATION
    // =======================================

    this.loadDefaultAddress();

  }


  // =========================================
  // SYNC GUEST LOCATION
  // =========================================

  private syncGuestLocation(): void {

    if (
      this.isSyncingLocation
    ) {

      return;

    }


    this.isSyncingLocation =
      true;

    this.errorMessage =
      '';


    console.log(
      'Converting guest location into user address...'
    );


    this.locationService

      .syncGuestLocationToBackend()

      .subscribe({

        // ===================================
        // SUCCESS
        // ===================================

        next:
          (syncedLocation) => {

            this.isSyncingLocation =
              false;


            if (
              syncedLocation
            ) {

              this.userLocation =
                syncedLocation;


              console.log(
                'Guest location successfully synced:',
                syncedLocation
              );


              return;

            }


            // =================================
            // FALLBACK
            // =================================

            this.loadDefaultAddress();

          },


        // ===================================
        // ERROR
        // ===================================

        error:
          (error: unknown) => {

            this.isSyncingLocation =
              false;


            console.error(
              'Guest Location Sync Error:',
              error
            );


            this.loadDefaultAddress();

          }

      });

  }


  // =========================================
  // LOAD DEFAULT ADDRESS
  // =========================================

  private loadDefaultAddress(): void {

    if (
      this.isLoadingAddress
    ) {

      return;

    }


    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {

      return;

    }


    if (
      !this.authService.isLoggedIn()
    ) {

      this.showLoginPopup =
        true;

      return;

    }


    this.isLoadingAddress =
      true;


    // =======================================
    // GET USER ADDRESSES
    // =======================================

    this.locationService

      .getMyAddresses()

      .subscribe({

        // ===================================
        // SUCCESS
        // ===================================

        next:
          (
            addresses:
              SavedAddress[]
          ) => {

            this.isLoadingAddress =
              false;


            console.log(
              'Checkout Saved Addresses:',
              addresses
            );


            // ---------------------------------
            // NO ADDRESSES
            // ---------------------------------

            if (
              !addresses ||
              addresses.length === 0
            ) {

              this.userLocation =
                null;

              this.errorMessage =
                'Please select a delivery address before placing your order.';

              return;

            }


            // ---------------------------------
            // FIND DEFAULT
            // ---------------------------------

            let selectedAddress:
              SavedAddress |
              undefined;


            selectedAddress =
              addresses.find(
                address =>
                  address.default === true
              );


            // ---------------------------------
            // FALLBACK FIRST
            // ---------------------------------

            if (
              !selectedAddress
            ) {

              selectedAddress =
                addresses[0];

            }


            // ---------------------------------
            // VALIDATE
            // ---------------------------------

            if (
              !selectedAddress ||
              !selectedAddress.id
            ) {

              this.errorMessage =
                'No valid delivery address found.';

              return;

            }


            // ---------------------------------
            // CONVERT
            // ---------------------------------

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
                Number(
                  selectedAddress.cityId
                ),

              userAddressId:
                Number(
                  selectedAddress.id
                ),

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
                selectedAddress.default === true

            };


            // ---------------------------------
            // SET
            // ---------------------------------

            this.userLocation =
              location;


            // ---------------------------------
            // SAVE LOCALLY
            // ---------------------------------

            this.locationService
              .saveLocation(
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


        // ===================================
        // ERROR
        // ===================================

        error:
          (error: unknown) => {

            this.isLoadingAddress =
              false;


            console.error(
              'Checkout Address API Error:',
              error
            );


            this.errorMessage =
              this.getErrorMessage(
                error,
                'Unable to load your delivery address.'
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
  // SELECT PAYMENT METHOD
  // =========================================

  selectPaymentMethod(
    method:
      'cash' |
      'wallet'
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
      this.userLocation.userAddressId &&
      Number(
        this.userLocation.userAddressId
      ) > 0
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
  // ITEM COUNT LABEL
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

    // =======================================
    // RESET MESSAGES
    // =======================================

    this.errorMessage =
      '';

    this.successMessage =
      '';


    // =======================================
    // AUTH CHECK
    // =======================================

    if (
      !this.authService.isLoggedIn()
    ) {

      this.showLoginPopup =
        true;

      return;

    }


    // =======================================
    // PREVENT DOUBLE SUBMISSION
    // =======================================

    if (
      this.isPlacingOrder
    ) {

      return;

    }


    // =======================================
    // LOCATION SYNC IN PROGRESS
    // =======================================

    if (
      this.isSyncingLocation
    ) {

      this.errorMessage =
        'Please wait while we save your delivery address.';

      return;

    }


    // =======================================
    // CART VALIDATION
    // =======================================

    if (
      this.cartItems.length === 0
    ) {

      this.errorMessage =
        'Your cart is empty.';

      return;

    }


    // =======================================
    // BUSINESS LOCATION
    // =======================================

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


    // =======================================
    // ADDRESS
    // =======================================

    const userAddressId =
      this.locationService
        .getUserAddressId();


    if (
      !userAddressId
    ) {

      this.errorMessage =
        'Please select a delivery address before placing your order.';


      console.warn(
        'No backend userAddressId available.'
      );


      return;

    }


    // =======================================
    // WALLET
    // =======================================

    if (
      this.paymentMethod === 'wallet'
    ) {

      this.errorMessage =
        'Wallet payment is not available yet.';


      return;

    }


    // =======================================
    // UPDATE LOCAL LOCATION
    // =======================================

    this.userLocation =
      this.locationService.getLocation();


    // =======================================
    // START ORDER
    // =======================================

    this.isPlacingOrder =
      true;


    // =======================================
    // ORDER REQUEST
    // =======================================

    const orderRequest:
      CreateOrderRequest = {

      businessLocationId:
        this.businessLocationId,

      userAddressId:
        userAddressId,

      orderType:
        1,

      notes:
        this.notes.trim(),

      addressRequest:
        null

    };


    console.log(
      '========================================'
    );

    console.log(
      'ORDER REQUEST'
    );

    console.log(
      '========================================'
    );

    console.log(
      orderRequest
    );


    // =======================================
    // CREATE ORDER
    // =======================================

    this.orderService

      .createOrder(
        orderRequest
      )

      .subscribe({

        // ===================================
        // SUCCESS
        // ===================================

        next:
          (
            response
          ) => {

            console.log(
              'Order Created Successfully:',
              response
            );


            this.isPlacingOrder =
              false;


            // ---------------------------------
            // ORDER ID
            // ---------------------------------

            this.orderId =
              response.data;


            // ---------------------------------
            // SUCCESS MESSAGE
            // ---------------------------------

            this.successMessage =
              response.message ||
              'Your order has been placed successfully.';


            // ---------------------------------
            // ORDER NUMBER
            // ---------------------------------

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


            // ---------------------------------
            // GO TO ORDERS
            // ---------------------------------

            this.router.navigate([
              '/orders'
            ]);

          },


        // ===================================
        // ERROR
        // ===================================

        error:
          (
            error: unknown
          ) => {

            this.isPlacingOrder =
              false;


            console.error(
              'Create Order API Error:',
              error
            );


            this.errorMessage =
              this.getErrorMessage(
                error,
                'Unable to place your order. Please try again.'
              );

          }

      });

  }


  // =========================================
  // EXTRACT ORDER NUMBER
  // =========================================

  private extractOrderNumber(
    message:
      string |
      undefined
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

          returnUrl:
            '/checkout'

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


  // =========================================
  // ERROR MESSAGE
  // =========================================

  private getErrorMessage(

    error:
      unknown,

    fallback:
      string

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

            message?:
              string;

          };

          message?:
            string;

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