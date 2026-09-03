import { Injectable, Inject, PLATFORM_ID } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { HttpClient } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { LoginRequest } from '../../shared/models/login-request.model';
import { LoginResponse } from '../../shared/models/login-response.model';
import { User } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';

export interface OtpResponse {
  responseStatus: number;
  responseCode?: number;
  message?: string;
  data?: {
    userName?: string;
    otp?: string;
  };
}

export interface RegisterResponse {
  responseStatus: number;
  responseCode?: number;
  message?: string;
  data?: {
    user?: User;
    token?: string;
    refreshToken?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/User`;

  private readonly tokenKey = 'foodie_access_token';
  private readonly refreshTokenKey = 'foodie_refresh_token';
  private readonly userKey = 'foodie_user';

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap((response) => {
          if (
            response.responseStatus === 1 &&
            response.data &&
            this.isBrowser()
          ) {
            this.storeAuthentication(response);
          }
        })
      );
  }

  requestOtp(cellNumber: string): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(
      `${this.apiUrl}/otp`,
      { cellNumber }
    );
  }

  validateOtp(
    request: {
      userName: string;
      otp: string;
      type: number;
    }
  ): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(
      `${this.apiUrl}/validateotp`,
      request
    );
  }

  register(formData: FormData): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(this.apiUrl, formData)
      .pipe(
        tap((response) => {
          if (
            response.responseStatus === 1 &&
            response.data &&
            this.isBrowser()
          ) {
            this.storeRegistrationAuthentication(response);
          }
        })
      );
  }

  private storeAuthentication(response: LoginResponse): void {
    if (!this.isBrowser()) {
      return;
    }

    if (response.data?.token) {
      localStorage.setItem(this.tokenKey, response.data.token);
    }

    if (response.data?.refreshToken) {
      localStorage.setItem(
        this.refreshTokenKey,
        response.data.refreshToken
      );
    }

    if (response.data?.user) {
      localStorage.setItem(
        this.userKey,
        JSON.stringify(response.data.user)
      );
    }
  }

  private storeRegistrationAuthentication(
    response: RegisterResponse
  ): void {
    if (!this.isBrowser()) {
      return;
    }

    if (response.data?.token) {
      localStorage.setItem(this.tokenKey, response.data.token);
    }

    if (response.data?.refreshToken) {
      localStorage.setItem(
        this.refreshTokenKey,
        response.data.refreshToken
      );
    }

    if (response.data?.user) {
      localStorage.setItem(
        this.userKey,
        JSON.stringify(response.data.user)
      );
    }
  }

  getToken(): string | null {
    return this.isBrowser()
      ? localStorage.getItem(this.tokenKey)
      : null;
  }

  getRefreshToken(): string | null {
    return this.isBrowser()
      ? localStorage.getItem(this.refreshTokenKey)
      : null;
  }

  getCurrentUser(): User | null {
    if (!this.isBrowser()) {
      return null;
    }

    const value = localStorage.getItem(this.userKey);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as User;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserId(): number | null {
    const user = this.getCurrentUser() as
      | (User & { userId?: number })
      | null;

    const id = Number(user?.id ?? user?.userId);

    return Number.isFinite(id) && id > 0 ? id : null;
  }

  logout(): void {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  clearAuthentication(): void {
    this.logout();
  }
}

