import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import { AuthService }
  from '../../../core/services/auth.service';


@Component({
  selector: 'app-login',

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;

  isLoading = false;

  errorMessage = '';


  constructor(
    private fb: FormBuilder,

    private authService: AuthService,

    private router: Router
  ) {

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
  // LOGIN
  // =========================================

  login(): void {

    this.errorMessage = '';


    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;

    }


    this.isLoading = true;


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


    this.authService
      .login(request)
      .subscribe({

        next: response => {

          this.isLoading = false;


          if (
            response.responseStatus === 1
          ) {

            this.router.navigate([
              '/location'
            ]);

            return;

          }


          this.errorMessage =
            response.message ||
            'Login failed.';

        },


        error: error => {

          this.isLoading = false;


          console.error(
            'Login API Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to login. Please check your username and password.';

        }

      });

  }

}