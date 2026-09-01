import {
  Injectable,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  tap
} from 'rxjs';

import {
  LoginRequest
} from '../../shared/models/login-request.model';

import {
  LoginResponse
} from '../../shared/models/login-response.model';

import {
  User
} from '../../shared/models/user.model';

import {
  environment
} from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  // =========================================
  // API
  // =========================================

  private readonly apiUrl =
    `${environment.apiUrl}/User`;


  // =========================================
  // STORAGE KEYS
  // =========================================

  private readonly tokenKey =
    'foodie_access_token';

  private readonly refreshTokenKey =
    'foodie_refresh_token';

  private readonly userKey =
    'foodie_user';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private http:
      HttpClient,

    @Inject(PLATFORM_ID)
    private platformId:
      object

  ) {}


  // =========================================
  // CHECK BROWSER
  // =========================================

  private isBrowser(): boolean {

    return isPlatformBrowser(
      this.platformId
    );

  }


  // =========================================
  // LOGIN
  // =========================================

  login(
    request: LoginRequest
  ): Observable<LoginResponse> {

    return this.http

      .post<LoginResponse>(
        `${this.apiUrl}/login`,
        request
      )

      .pipe(

        tap(
          (
            response: LoginResponse
          ) => {

            // ---------------------------------
            // ONLY STORE AUTH DATA IN BROWSER
            // ---------------------------------

            if (
              response.responseStatus === 1 &&
              response.data &&
              this.isBrowser()
            ) {

              this.storeAuthentication(
                response
              );

            }

          }
        )

      );

  }


  // =========================================
  // STORE AUTHENTICATION
  // =========================================

  private storeAuthentication(
    response: LoginResponse
  ): void {

    if (
      !this.isBrowser()
    ) {

      return;

    }


    // =======================================
    // ACCESS TOKEN
    // =======================================

    if (
      response.data?.token
    ) {

      localStorage.setItem(

        this.tokenKey,

        response.data.token

      );

    }


    // =======================================
    // REFRESH TOKEN
    // =======================================

    if (
      response.data?.refreshToken
    ) {

      localStorage.setItem(

        this.refreshTokenKey,

        response.data.refreshToken

      );

    }


    // =======================================
    // USER
    // =======================================

    if (
      response.data?.user
    ) {

      localStorage.setItem(

        this.userKey,

        JSON.stringify(
          response.data.user
        )

      );

    }


    console.log(
      'Authentication stored successfully.'
    );

  }


  // =========================================
  // GET TOKEN
  // =========================================

  getToken(): string | null {

    if (
      !this.isBrowser()
    ) {

      return null;

    }


    return localStorage.getItem(
      this.tokenKey
    );

  }


  // =========================================
  // GET REFRESH TOKEN
  // =========================================

  getRefreshToken(): string | null {

    if (
      !this.isBrowser()
    ) {

      return null;

    }


    return localStorage.getItem(
      this.refreshTokenKey
    );

  }


  // =========================================
  // GET CURRENT USER
  // =========================================

  getCurrentUser(): User | null {

    if (
      !this.isBrowser()
    ) {

      return null;

    }


    const user =
      localStorage.getItem(
        this.userKey
      );


    if (
      !user
    ) {

      return null;

    }


    try {

      return JSON.parse(
        user
      ) as User;

    }
    catch (
      error
    ) {

      console.error(
        'Unable to parse stored user:',
        error
      );


      return null;

    }

  }


  // =========================================
  // LOGIN STATUS
  // =========================================

  isLoggedIn(): boolean {

    if (
      !this.isBrowser()
    ) {

      return false;

    }


    const token =
      this.getToken();


    return !!(
      token &&
      token.trim().length > 0
    );

  }


  // =========================================
  // GET USER ID
  // =========================================

  getUserId(): number | null {

    const user =
      this.getCurrentUser();


    if (
      !user
    ) {

      return null;

    }


    /*
     * Depending on your User model,
     * the property may be id or userId.
     */

    const userObject =
      user as User & {
        id?: number;
        userId?: number;
      };


    if (
      userObject.id !== undefined &&
      userObject.id !== null
    ) {

      return Number(
        userObject.id
      );

    }


    if (
      userObject.userId !== undefined &&
      userObject.userId !== null
    ) {

      return Number(
        userObject.userId
      );

    }


    return null;

  }


  // =========================================
  // LOGOUT
  // =========================================

  logout(): void {

    if (
      !this.isBrowser()
    ) {

      return;

    }


    localStorage.removeItem(
      this.tokenKey
    );


    localStorage.removeItem(
      this.refreshTokenKey
    );


    localStorage.removeItem(
      this.userKey
    );


    console.log(
      'User logged out successfully.'
    );

  }


  // =========================================
  // CLEAR AUTHENTICATION
  // =========================================

  clearAuthentication(): void {

    this.logout();

  }

}