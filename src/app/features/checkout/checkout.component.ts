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
  // GENERAL MESSAGES
  // =========================================

  errorMessage = '';
  successMessage = '';

  notes = '';

  orderId: number | null = null;
  orderNumber = '';


  // =========================================
  // LOGIN POPUP STATE
  // =========================================

  showLoginPopup = false;

  authMode:
    'login' |
    'signup' |
    'forgot' = 'login';

  isSubmittingAuth = false;
  isLoggingIn = false;

  loginUserName = '';
  loginPassword = '';
  loginErrorMessage = '';
  authSuccessMessage = '';

  showLoginPassword = false;

  signupFullName = '';
  signupEmail = '';
  signupPhone = '';
  signupPassword = '';
  signupConfirmPassword = '';
  signupAcceptedTerms = false;

  showSignupPassword = false;
  showSignupConfirmPassword = false;

  forgotIdentifier = '';


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
  // LOGIN POPUP
  // =========================================

  openLoginPopup(): void {

    if (
      this.authService.isLoggedIn()
    ) {

      return;

    }

    this.resetAuthModal();

    this.showLoginPopup =
      true;

  }


  // =========================================
  // RESET AUTH MODAL
  // =========================================

  private resetAuthModal(): void {

    this.authMode =
      'login';

    this.loginErrorMessage =
      '';

    this.authSuccessMessage =
      '';

    this.showLoginPassword =
      false;

    this.showSignupPassword =
      false;

    this.showSignupConfirmPassword =
      false;

  }


  // =========================================
  // SWITCH AUTH MODE
  // =========================================

  switchAuthMode(
    mode:
      'login' |
      'signup' |
      'forgot'
  ): void {

    if (
      this.isSubmittingAuth
    ) {

      return;

    }

    this.authMode =
      mode;

    this.loginErrorMessage =
      '';

    this.authSuccessMessage =
      '';

  }


  // =========================================
  // CLOSE LOGIN POPUP
  // =========================================

  closeLoginPopup(): void {

    if (
      this.isSubmittingAuth ||
      this.isLoggingIn
    ) {

      return;

    }

    this.showLoginPopup =
      false;

    this.loginErrorMessage =
      '';

    this.authSuccessMessage =
      '';

  }


  // =========================================
  // LOGIN PASSWORD VISIBILITY
  // =========================================

  toggleLoginPassword(): void {

    this.showLoginPassword =
      !this.showLoginPassword;

  }


  // =========================================
  // SIGNUP PASSWORD VISIBILITY
  // =========================================

  toggleSignupPassword(): void {

    this.showSignupPassword =
      !this.showSignupPassword;

  }


  toggleSignupConfirmPassword(): void {

    this.showSignupConfirmPassword =
      !this.showSignupConfirmPassword;

  }


  // =========================================
  // LOGIN FROM CHECKOUT POPUP
  // =========================================

  loginFromPopup(): void {

    this.loginErrorMessage =
      '';

    this.authSuccessMessage =
      '';

    if (
      !this.loginUserName.trim()
    ) {

      this.loginErrorMessage =
        'Please enter your username.';

      return;

    }

    if (
      !this.loginPassword
    ) {

      this.loginErrorMessage =
        'Please enter your password.';

      return;

    }

    if (
      this.isSubmittingAuth ||
      this.isLoggingIn
    ) {

      return;

    }

    this.isLoggingIn =
      true;

    this.isSubmittingAuth =
      true;

    const request = {

      userName:
        this.loginUserName.trim(),

      password:
        this.loginPassword,

      fmcToken:
        'string',

      deviceModel:
        'Web Browser'

    };

    console.log(
      'Logging in from checkout popup...'
    );

    this.authService
      .login(request)
      .subscribe({

        next:
          (response) => {

            console.log(
              'Checkout Login Response:',
              response
            );

            if (
              !response ||
              response.responseStatus !== 1
            ) {

              this.isLoggingIn =
                false;

              this.isSubmittingAuth =
                false;

              this.loginErrorMessage =
                response?.message ||
                'Login failed. Please check your credentials.';

              return;

            }

            console.log(
              'Login successful from checkout.'
            );

            this.cartService
              .syncGuestCart()
              .subscribe({

                next:
                  () => {

                    console.log(
                      'Guest cart synchronization completed.'
                    );

                    this.isLoggingIn =
                      false;

                    this.isSubmittingAuth =
                      false;

                    this.showLoginPopup =
                      false;

                    this.loginPassword =
                      '';

                    this.loginErrorMessage =
                      '';

                    this.authSuccessMessage =
                      '';

                    this.loadCheckout();

                  },

                error:
                  (error: unknown) => {

                    console.error(
                      'Guest cart synchronization failed:',
                      error
                    );

                    this.isLoggingIn =
                      false;

                    this.isSubmittingAuth =
                      false;

                    this.loginErrorMessage =
                      this.getErrorMessage(
                        error,
                        'Login successful, but we could not synchronize your cart. Please try again.'
                      );

                  }

              });

          },

        error:
          (error: unknown) => {

            console.error(
              'Checkout Login API Error:',
              error
            );

            this.isLoggingIn =
              false;

            this.isSubmittingAuth =
              false;

            this.loginErrorMessage =
              this.getErrorMessage(
                error,
                'Unable to login. Please check your username and password.'
              );

          }

      });

  }


  // =========================================
  // SIGN UP FROM CHECKOUT POPUP
  // =========================================

  signupFromPopup(): void {

    this.loginErrorMessage =
      '';

    this.authSuccessMessage =
      '';

    const fullName =
      this.signupFullName.trim();

    const email =
      this.signupEmail.trim();

    const phone =
      this.signupPhone.trim();

    if (!fullName) {

      this.loginErrorMessage =
        'Please enter your full name.';

      return;

    }

    if (!email) {

      this.loginErrorMessage =
        'Please enter your email address.';

      return;

    }

    if (!this.isValidEmail(email)) {

      this.loginErrorMessage =
        'Please enter a valid email address.';

      return;

    }

    if (!phone) {

      this.loginErrorMessage =
        'Please enter your phone number.';

      return;

    }

    if (this.signupPassword.length < 6) {

      this.loginErrorMessage =
        'Password must be at least 6 characters.';

      return;

    }

    if (
      this.signupPassword !==
      this.signupConfirmPassword
    ) {

      this.loginErrorMessage =
        'Passwords do not match.';

      return;

    }

    if (!this.signupAcceptedTerms) {

      this.loginErrorMessage =
        'Please accept the Terms & Conditions to continue.';

      return;

    }

    if (this.isSubmittingAuth) {

      return;

    }

    this.isSubmittingAuth =
      true;

    const registerMethod =
      (this.authService as any).register;

    if (typeof registerMethod !== 'function') {

      this.isSubmittingAuth =
        false;

      this.loginErrorMessage =
        'Sign up is not connected to the authentication API yet. Please use the existing Sign Up page.';

      return;

    }

    const request = {

      fullName,

      name: fullName,

      email,

      userName: email,

      phoneNumber: phone,

      phone,

      password:
        this.signupPassword,

      confirmPassword:
        this.signupConfirmPassword

    };

    registerMethod
      .call(this.authService, request)
      .subscribe({

        next:
          (response: any) => {

            this.isSubmittingAuth =
              false;

            if (
              !response ||
              response.responseStatus !== 1
            ) {

              this.loginErrorMessage =
                response?.message ||
                'Unable to create your account.';

              return;

            }

            this.authMode =
              'login';

            this.loginUserName =
              email;

            this.loginPassword =
              '';

            this.signupPassword =
              '';

            this.signupConfirmPassword =
              '';

            this.loginErrorMessage =
              '';

            this.authSuccessMessage =
              response.message ||
              'Account created successfully. Please log in to continue your order.';

          },

        error:
          (error: unknown) => {

            this.isSubmittingAuth =
              false;

            this.loginErrorMessage =
              this.getErrorMessage(
                error,
                'Unable to create your account.'
              );

          }

      });

  }


  // =========================================
  // FORGOT PASSWORD FROM CHECKOUT POPUP
  // =========================================

  forgotPasswordFromPopup(): void {

    this.loginErrorMessage =
      '';

    this.authSuccessMessage =
      '';

    const identifier =
      this.forgotIdentifier.trim();

    if (!identifier) {

      this.loginErrorMessage =
        'Please enter your email or username.';

      return;

    }

    if (this.isSubmittingAuth) {

      return;

    }

    const auth =
      this.authService as any;

    const resetMethod =
      auth.forgotPassword ||
      auth.requestPasswordReset ||
      auth.resetPasswordRequest;

    if (typeof resetMethod !== 'function') {

      this.loginErrorMessage =
        'Forgot password is not connected to the authentication API yet. Please use the existing Forgot Password option on the login page.';

      return;

    }

    this.isSubmittingAuth =
      true;

    const request = {

      userName:
        identifier,

      email:
        identifier

    };

    resetMethod
      .call(auth, request)
      .subscribe({

        next:
          (response: any) => {

            this.isSubmittingAuth =
              false;

            if (
              !response ||
              response.responseStatus !== 1
            ) {

              this.loginErrorMessage =
                response?.message ||
                'Unable to process your password reset request.';

              return;

            }

            this.authSuccessMessage =
              response.message ||
              'Password reset instructions have been sent successfully.';

          },

        error:
          (error: unknown) => {

            this.isSubmittingAuth =
              false;

            this.loginErrorMessage =
              this.getErrorMessage(
                error,
                'Unable to process your password reset request.'
              );

          }

      });

  }


  // =========================================
  // EMAIL VALIDATION
  // =========================================

  private isValidEmail(
    email: string
  ): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email);

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