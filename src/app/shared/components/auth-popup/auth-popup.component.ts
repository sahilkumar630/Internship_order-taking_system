import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  LocationService
} from '../../../core/services/location.service';

import {
  City
} from '../../models/location.model';


@Component({
  selector: 'app-auth-popup',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './auth-popup.component.html',

  styleUrl: './auth-popup.component.css',
})
export class AuthPopupComponent
  implements OnInit, OnChanges {


  // =========================================
  // INPUTS
  // =========================================

  @Input()
  visible = false;


  @Input()
  initialMode:
    | 'login'
    | 'signup'
    | 'forgot' = 'login';


  // =========================================
  // OUTPUTS
  // =========================================

  @Output()
  closed =
    new EventEmitter<void>();


  @Output()
  authenticated =
    new EventEmitter<void>();


  // =========================================
  // AUTH MODE
  // =========================================

  authMode:
    | 'login'
    | 'signup'
    | 'forgot' = 'login';


  // =========================================
  // AUTH STATE
  // =========================================

  isSubmittingAuth = false;

  isLoggingIn = false;


  // =========================================
  // ACCOUNT CREATION SUCCESS
  // =========================================

  accountCreatedSuccessfully = false;


  // =========================================
  // LOGIN
  // =========================================

  loginUserName = '';

  loginPassword = '';

  loginErrorMessage = '';

  authSuccessMessage = '';

  showLoginPassword = false;


  // =========================================
  // SIGN UP
  // =========================================

  signupStep:
    | 'mobile'
    | 'otp1'
    | 'account' = 'mobile';


  signupPhone = '';

  signupOtpOne = '';

  signupOtpTwo = '';

  signupFullName = '';

  signupCnic = '';

  signupEmail = '';

  signupCityId:
    number | null = null;

  signupAddress = '';

  signupPassword = '';

  signupConfirmPassword = '';

  signupAcceptedTerms = false;

  showSignupPassword = false;

  showSignupConfirmPassword = false;


  // =========================================
  // CITIES
  // =========================================

  cities: City[] = [];

  isLoadingCities = false;


  // =========================================
  // DEVELOPMENT OTP
  // =========================================

  devOtpOne = '';

  devOtpTwo = '';


  // =========================================
  // FORGOT PASSWORD
  // =========================================

  forgotIdentifier = '';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private readonly authService: AuthService,

    private readonly locationService: LocationService
  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.loadCities();

  }


  // =========================================
  // INPUT CHANGES
  // =========================================

  ngOnChanges(
    _changes: SimpleChanges
  ): void {

    if (this.visible) {

      this.authMode =
        this.initialMode;

      this.accountCreatedSuccessfully =
        false;

      this.resetMessages();

    }

  }


  // =========================================
  // LOAD CITIES
  // =========================================

  private loadCities(): void {

    this.isLoadingCities = true;

    this.locationService
      .getCities()
      .subscribe({

        next: (cities) => {

          this.cities =
            cities ?? [];

          this.isLoadingCities =
            false;

        },

        error: (error) => {

          console.error(
            'Auth popup city API error:',
            error
          );

          this.cities = [];

          this.isLoadingCities =
            false;

        },

      });

  }


  // =========================================
  // SWITCH AUTH MODE
  // =========================================

  switchAuthMode(
    mode:
      | 'login'
      | 'signup'
      | 'forgot'
  ): void {

    if (this.isSubmittingAuth) {

      return;

    }


    this.authMode = mode;

    this.accountCreatedSuccessfully =
      false;

    this.resetMessages();


    if (mode === 'signup') {

      this.signupStep =
        'mobile';

      this.devOtpOne =
        '';

      this.devOtpTwo =
        '';

    }

  }


  // =========================================
  // CLOSE POPUP
  // =========================================

  closePopup(): void {

    if (
      this.isSubmittingAuth ||
      this.isLoggingIn
    ) {

      return;

    }


    this.closed.emit();

  }


  // =========================================
  // RESET MESSAGES
  // =========================================

  private resetMessages(): void {

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


  // =========================================
  // SIGNUP CONFIRM PASSWORD VISIBILITY
  // =========================================

  toggleSignupConfirmPassword(): void {

    this.showSignupConfirmPassword =
      !this.showSignupConfirmPassword;

  }


  // =========================================
  // LOGIN
  // =========================================

  loginFromPopup(): void {

    this.resetMessages();


    if (!this.loginUserName.trim()) {

      this.loginErrorMessage =
        'Please enter your username.';

      return;

    }


    if (!this.loginPassword) {

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


    this.isLoggingIn = true;

    this.isSubmittingAuth = true;


    this.authService
      .login({

        userName:
          this.loginUserName.trim(),

        password:
          this.loginPassword,

        fmcToken:
          'string',

        deviceModel:
          'Web Browser',

      })
      .subscribe({

        next: (response) => {

          this.isLoggingIn =
            false;

          this.isSubmittingAuth =
            false;


          if (
            !response ||
            response.responseStatus !== 1
          ) {

            this.loginErrorMessage =
              response?.message ||
              'Login failed. Please check your credentials.';

            return;

          }


          this.loginPassword =
            '';


          this.authSuccessMessage =
            'Login successful.';


          this.authenticated.emit();

        },


        error: (error) => {

          this.isLoggingIn =
            false;

          this.isSubmittingAuth =
            false;


          this.loginErrorMessage =
            this.getErrorMessage(
              error,
              'Unable to login. Please check your username and password.'
            );

        },

      });

  }


  // =========================================
  // REQUEST SIGNUP OTP
  // =========================================

  requestSignupOtp(): void {

    this.resetMessages();


    const cellNumber =
      this.normalizeCellNumber(
        this.signupPhone
      );


    if (!cellNumber) {

      this.loginErrorMessage =
        'Please enter your mobile number.';

      return;

    }


    if (cellNumber.length < 10) {

      this.loginErrorMessage =
        'Please enter a valid mobile number.';

      return;

    }


    if (this.isSubmittingAuth) {

      return;

    }


    this.isSubmittingAuth =
      true;


    this.authService
      .requestOtp(cellNumber)
      .subscribe({

        next: (response) => {

          this.isSubmittingAuth =
            false;


          if (
            !response ||
            response.responseStatus !== 1
          ) {

            this.loginErrorMessage =
              response?.message ||
              'Unable to generate OTP.';

            return;

          }


          this.signupPhone =
            cellNumber;


          this.devOtpOne =
            this.extractOtpFromMessage(
              response.message
            );


          this.signupStep =
            'otp1';


          this.authSuccessMessage =
            'OTP #1 generated successfully.';

        },


        error: (error) => {

          this.isSubmittingAuth =
            false;


          this.loginErrorMessage =
            this.getErrorMessage(
              error,
              'Unable to send OTP. Please try again.'
            );

        },

      });

  }


  // =========================================
  // VALIDATE SIGNUP OTP #1
  // =========================================

  validateSignupOtp(): void {

    this.resetMessages();


    if (!this.signupOtpOne.trim()) {

      this.loginErrorMessage =
        'Please enter OTP #1.';

      return;

    }


    if (this.isSubmittingAuth) {

      return;

    }


    this.isSubmittingAuth =
      true;


    this.authService
      .validateOtp({

        userName:
          this.signupPhone,

        otp:
          this.signupOtpOne.trim(),

        type:
          0,

      })
      .subscribe({

        next: (response) => {

          this.isSubmittingAuth =
            false;


          if (
            !response ||
            response.responseStatus !== 1
          ) {

            this.loginErrorMessage =
              response?.message ||
              'OTP #1 validation failed.';

            return;

          }


          this.devOtpTwo =
            String(
              response.data?.otp ?? ''
            ).trim();


          this.signupOtpTwo =
            '';


          this.signupStep =
            'account';


          this.authSuccessMessage =
            'OTP #1 verified. Complete your account using OTP #2.';

        },


        error: (error) => {

          this.isSubmittingAuth =
            false;


          this.loginErrorMessage =
            this.getErrorMessage(
              error,
              'Unable to validate OTP #1.'
            );

        },

      });

  }


  // =========================================
  // COMPLETE SIGNUP
  // =========================================

  completeSignup(): void {

    this.resetMessages();


    const fullName =
      this.signupFullName.trim();

    const cnic =
      this.signupCnic.trim();

    const email =
      this.signupEmail.trim();

    const address =
      this.signupAddress.trim();

    const otpTwo =
      this.signupOtpTwo.trim();


    // =======================================
    // VALIDATION
    // =======================================

    if (!fullName) {

      this.loginErrorMessage =
        'Please enter your full name.';

      return;

    }


    if (!cnic) {

      this.loginErrorMessage =
        'Please enter your CNIC.';

      return;

    }


    if (
      !email ||
      !this.isValidEmail(email)
    ) {

      this.loginErrorMessage =
        'Please enter a valid email address.';

      return;

    }


    if (
      !this.signupCityId ||
      this.signupCityId <= 0
    ) {

      this.loginErrorMessage =
        'Please select your city.';

      return;

    }


    if (!address) {

      this.loginErrorMessage =
        'Please enter your address.';

      return;

    }


    if (
      this.signupPassword.length < 6
    ) {

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


    if (!otpTwo) {

      this.loginErrorMessage =
        'Please enter OTP #2.';

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


    // =======================================
    // FORM DATA
    // =======================================

    const formData =
      new FormData();


    formData.append(
      'ReferralCode',
      ''
    );


    formData.append(
      'CNIC',
      cnic
    );


    formData.append(
      'UserName',
      this.signupPhone
    );


    formData.append(
      'Email',
      email
    );


    formData.append(
      'DisplayName',
      fullName
    );


    formData.append(
      'Password',
      this.signupPassword
    );


    formData.append(
      'OTP',
      otpTwo
    );


    formData.append(
      'Address',
      address
    );


    formData.append(
      'CityId',
      String(this.signupCityId)
    );


    formData.append(
      'FmcToken',
      'string'
    );


    formData.append(
      'DeviceModel',
      'Web Browser'
    );


    // =======================================
    // CREATE ACCOUNT
    // =======================================

    this.isSubmittingAuth =
      true;


    this.authService
      .register(formData)
      .subscribe({

        next: (response) => {

          this.isSubmittingAuth =
            false;


          // =================================
          // API FAILURE
          // =================================

          if (
            !response ||
            response.responseStatus !== 1
          ) {

            this.loginErrorMessage =
              response?.message ||
              'Unable to create your account.';

            return;

          }


          // =================================
          // ACCOUNT CREATED
          // =================================

          this.authSuccessMessage =
            '';

          this.loginErrorMessage =
            '';

          this.accountCreatedSuccessfully =
            true;

        },


        error: (error) => {

          this.isSubmittingAuth =
            false;


          this.loginErrorMessage =
            this.getErrorMessage(
              error,
              'Unable to create your account.'
            );

        },

      });

  }


  // =========================================
  // CONTINUE AFTER ACCOUNT CREATION
  // =========================================

  continueAfterAccountCreation(): void {

    this.accountCreatedSuccessfully =
      false;


    this.authenticated.emit();

  }


  // =========================================
  // FORGOT PASSWORD
  // =========================================

  forgotPasswordFromPopup(): void {

    this.resetMessages();


    if (!this.forgotIdentifier.trim()) {

      this.loginErrorMessage =
        'Please enter your email or username.';

      return;

    }


    this.loginErrorMessage =
      'Forgot password API has not been provided yet.';

  }


  // =========================================
  // NORMALIZE CELL NUMBER
  // =========================================

  private normalizeCellNumber(
    value: string
  ): string {

    let digits =
      value.replace(
        /\D/g,
        ''
      );


    if (
      digits.startsWith('0')
    ) {

      digits =
        '92' +
        digits.substring(1);

    }


    if (
      !digits.startsWith('92') &&
      digits.length === 10
    ) {

      digits =
        '92' +
        digits;

    }


    return digits;

  }


  // =========================================
  // EXTRACT OTP
  // =========================================

  private extractOtpFromMessage(
    message: string | undefined
  ): string {

    if (!message) {

      return '';

    }


    const match =
      message.match(
        /(\d{4,8})\s*$/
      );


    return (
      match?.[1] ??
      ''
    );

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
  // ERROR MESSAGE
  // =========================================

  private getErrorMessage(
    error: unknown,
    fallback: string
  ): string {

    if (
      error instanceof Error &&
      error.message
    ) {

      return error.message;

    }


    if (
      typeof error === 'object' &&
      error !== null
    ) {

      const response =
        error as {
          error?: {
            message?: string;
          };

          message?: string;
        };


      return (
        response.error?.message ||
        response.message ||
        fallback
      );

    }


    return fallback;

  }

}