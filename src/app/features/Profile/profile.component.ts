import {
  Component,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  User
} from '../../shared/models/user.model';


@Component({
  selector: 'app-profile',

  imports: [],

  templateUrl: './profile.component.html',

  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {


  // =========================================
  // USER
  // =========================================

  currentUser: User | null = null;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private readonly authService: AuthService,

    private readonly router: Router

  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.currentUser =
      this.authService.getCurrentUser();


    if (!this.currentUser) {

      this.router.navigate([
        '/login'
      ]);

    }

  }


  // =========================================
  // PROFILE PICTURE
  // =========================================

  get profilePicture(): string {

    return (
      this.currentUser?.profilePictureURL ||
      ''
    );

  }


  // =========================================
  // DISPLAY NAME
  // =========================================

  get displayName(): string {

    return (
      this.currentUser?.userFriendlyName ||
      this.currentUser?.name ||
      'Foodie User'
    );

  }


  // =========================================
  // BACK
  // =========================================

  goBack(): void {

    this.router.navigate([
      '/orders'
    ]);

  }


  // =========================================
  // ADDRESSES
  // =========================================

  openAddresses(): void {

    this.router.navigate([
      '/location'
    ]);

  }



}