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
  // MESSAGES
  // =========================================

  errorMessage =
    '';

  successMessage =
    '';


  // =========================================
  // ORDER RESULT
  // =========================================

  orderId:
    number | null = null;

  orderNumber =
    '';


  // =========================================
  // ORDER NOTES
  // =========================================

  notes =
    '';


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

    private authService:
      AuthService,

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

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {

      return;

    }


    // =======================================
    // AUTHENTICATION CHECK
    // =======================================

    if (
      !this.authService.isLoggedIn()
    ) {

      console.log(
        'Guest user attempted to open checkout.'
      );


      /*
       * IMPORTANT:
       *
       * Do not delete the guest location.
       *
       * It is already stored in browser
       * localStorage by LocationService.
       *
       * After login we return to checkout
       * and can sync it to the backend.
       */

      this.router.navigate(
        ['/login'],
        {
          queryParams: {
            returnUrl:
              '/checkout'
          }
        }
      );


      return;

    }


    // =======================================
    // USER IS AUTHENTICATED
    // =======================================

    this.loadCheckout();

  }


  // =========================================
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
    // AUTH CHECK
    // =======================================

    if (
      !this.authService.isLoggedIn()
    ) {

      this.redirectToLogin();

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

        next: (
          cart
        ) => {

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

          this.ensureDeliveryAddress();

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

      this.redirectToLogin();

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
    //
    // The user is now logged in but the
    // location may have originally been
    // created as a guest.
    //
    // Convert it into a backend address.
    //
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
    //
    // Load user's saved addresses from API.
    //
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

        next: (
          syncedLocation
        ) => {

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


          /*
           * If the location could not be
           * converted, load the user's saved
           * backend address instead.
           */

          this.loadDefaultAddress();

        },


        // ===================================
        // ERROR
        // ===================================

        error: (
          error: unknown
        ) => {

          this.isSyncingLocation =
            false;


          console.error(
            'Guest Location Sync Error:',
            error
          );


          /*
           * Do not crash checkout.
           *
           * Try the user's existing backend
           * addresses as fallback.
           */

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

      this.redirectToLogin();

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

        next: (
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

        error: (
          error: unknown
        ) => {

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

      this.redirectToLogin();

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

        next: (
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

        error: (
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
  // REDIRECT TO LOGIN
  // =========================================

  private redirectToLogin(): void {

    this.router.navigate(

      ['/login'],

      {
        queryParams: {

          returnUrl:
            '/checkout'

        }

      }

    );

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