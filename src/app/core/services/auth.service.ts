import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { LoginRequest }
  from '../../shared/models/login-request.model';

import { LoginResponse }
  from '../../shared/models/login-response.model';

import { User }
  from '../../shared/models/user.model';

import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl =
    `${environment.apiUrl}/User`;


  private readonly tokenKey =
    'foodie_access_token';

  private readonly refreshTokenKey =
    'foodie_refresh_token';

  private readonly userKey =
    'foodie_user';


  constructor(
    private http: HttpClient
  ) {}


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

        tap(response => {

          if (
            response.responseStatus === 1 &&
            response.data
          ) {

            this.storeAuthentication(
              response
            );

          }

        })

      );

  }


  // =========================================
  // STORE AUTHENTICATION
  // =========================================

  private storeAuthentication(
    response: LoginResponse
  ): void {

    localStorage.setItem(
      this.tokenKey,
      response.data.token
    );


    localStorage.setItem(
      this.refreshTokenKey,
      response.data.refreshToken
    );


    localStorage.setItem(
      this.userKey,
      JSON.stringify(
        response.data.user
      )
    );

  }


  // =========================================
  // GET TOKEN
  // =========================================

  getToken(): string | null {

    return localStorage.getItem(
      this.tokenKey
    );

  }


  // =========================================
  // GET REFRESH TOKEN
  // =========================================

  getRefreshToken(): string | null {

    return localStorage.getItem(
      this.refreshTokenKey
    );

  }


  // =========================================
  // GET CURRENT USER
  // =========================================

  getCurrentUser(): User | null {

    const user =
      localStorage.getItem(
        this.userKey
      );


    if (!user) {

      return null;

    }


    try {

      return JSON.parse(user) as User;

    }
    catch {

      return null;

    }

  }


  // =========================================
  // LOGIN STATUS
  // =========================================

  isLoggedIn(): boolean {

    return !!this.getToken();

  }


  // =========================================
  // LOGOUT
  // =========================================

  logout(): void {

    localStorage.removeItem(
      this.tokenKey
    );

    localStorage.removeItem(
      this.refreshTokenKey
    );

    localStorage.removeItem(
      this.userKey
    );

  }

}