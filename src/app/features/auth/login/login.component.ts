import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  CartService
} from '../../../core/services/cart.service';


@Component({

  selector: 'app-login',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './login.component.html',

  styleUrl:
    './login.component.css'

})
export class LoginComponent
  implements OnInit {


  // =========================================
  // LOGIN FORM
  // =========================================

  loginForm:
    FormGroup;


  // =========================================
  // UI STATE
  // =========================================

  isLoading =
    false;

  errorMessage =
    '';


  // =========================================
  // RETURN URL
  // =========================================

  private returnUrl =
    '/location';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private fb:
      FormBuilder,

    private authService:
      AuthService,

    private cartService:
      CartService,

    private router:
      Router,

    private route:
      ActivatedRoute

  ) {

    // =======================================
    // CREATE LOGIN FORM
    // =======================================

    this.loginForm =
      this.fb.group({

        userName: [

          '',

          [
            Validators.required
          ]

        ],

        password: [

          '',

          [
            Validators.required
          ]

        ]

      });

  }


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    // =======================================
    // GET RETURN URL
    // =======================================

    const requestedReturnUrl =
      this.route.snapshot
        .queryParamMap
        .get('returnUrl');


    // =======================================
    // VALIDATE RETURN URL
    // =======================================

    if (
      requestedReturnUrl &&
      requestedReturnUrl.startsWith('/')
    ) {

      this.returnUrl =
        requestedReturnUrl;

    }

    else {

      this.returnUrl =
        '/location';

    }


    console.log(
      'Login return URL:',
      this.returnUrl
    );

  }


  // =========================================
  // LOGIN
  // =========================================

  login(): void {

    // =======================================
    // RESET ERROR
    // =======================================

    this.errorMessage =
      '';


    // =======================================
    // VALIDATE FORM
    // =======================================

    if (
      this.loginForm.invalid
    ) {

      this.loginForm.markAllAsTouched();

      return;

    }


    // =======================================
    // PREVENT DOUBLE SUBMISSION
    // =======================================

    if (
      this.isLoading
    ) {

      return;

    }


    this.isLoading =
      true;


    // =======================================
    // LOGIN REQUEST
    // =======================================

    const request = {

      userName:
        this.loginForm.value.userName,

      password:
        this.loginForm.value.password,

      fmcToken:
        'string',

      deviceModel:
        'Web Browser'

    };


    console.log(
      'Sending login request...'
    );


    // =======================================
    // LOGIN API
    // =======================================

    this.authService

      .login(request)

      .subscribe({

        // ===================================
        // SUCCESS
        // ===================================

        next: (
          response
        ) => {

          console.log(
            'Login Response:',
            response
          );


          // ---------------------------------
          // LOGIN SUCCESS
          // ---------------------------------

          if (
            response.responseStatus === 1
          ) {

            console.log(
              'Login successful.'
            );


            /*
             * =================================
             * SYNC GUEST CART
             * =================================
             *
             * The user may have added items
             * before logging in.
             *
             * Those items are currently stored
             * in LocalStorage.
             *
             * After successful login we send
             * them to the backend Cart API.
             */

            this.cartService
              .syncGuestCart()

              .subscribe({

                // =============================
                // CART SYNC SUCCESS
                // =============================

                next: () => {

                  this.isLoading =
                    false;


                  console.log(
                    'Guest cart synchronization completed.'
                  );


                  console.log(
                    'Redirecting to:',
                    this.returnUrl
                  );


                  /*
                   * Navigate to the page the user
                   * originally requested.
                   *
                   * Example:
                   *
                   * /login?returnUrl=/checkout
                   *
                   * becomes:
                   *
                   * /checkout
                   */

                  this.router.navigateByUrl(
                    this.returnUrl
                  );

                },


                // =============================
                // CART SYNC ERROR
                // =============================

                error: (
                  error: unknown
                ) => {

                  this.isLoading =
                    false;


                  console.error(
                    'Guest cart synchronization failed:',
                    error
                  );


                  /*
                   * Login itself succeeded,
                   * but the cart could not be
                   * synchronized.
                   *
                   * We show the actual error
                   * instead of pretending that
                   * synchronization succeeded.
                   */

                  this.errorMessage =
                    this.getErrorMessage(

                      error,

                      'Login successful, but we could not synchronize your cart. Please try again.'

                    );

                }

              });


            return;

          }


          // ---------------------------------
          // LOGIN FAILED
          // ---------------------------------

          this.isLoading =
            false;


          this.errorMessage =
            response.message ||

            'Login failed. Please check your credentials.';

        },


        // ===================================
        // LOGIN API ERROR
        // ===================================

        error: (
          error: unknown
        ) => {

          this.isLoading =
            false;


          console.error(
            'Login API Error:',
            error
          );


          this.errorMessage =
            this.getErrorMessage(

              error,

              'Unable to login. Please check your username and password.'

            );

        }

      });

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


    // =======================================
    // FALLBACK
    // =======================================

    return fallback;

  }

}