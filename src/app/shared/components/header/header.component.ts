import {
  Component,
  HostListener,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';

import { LocationService }
  from '../../../core/services/location.service';

import { AuthService }
  from '../../../core/services/auth.service';

import { UserLocation }
  from '../../models/location.model';

import { User }
  from '../../models/user.model';


@Component({
  selector: 'app-header',

  imports: [],

  templateUrl: './header.component.html',

  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {


  // =========================================
  // LOCATION
  // =========================================

  selectedLocation: UserLocation | null = null;


  // =========================================
  // USER
  // =========================================

  currentUser: User | null = null;


  // =========================================
  // PROFILE MENU
  // =========================================

  showProfileMenu = false;


  // =========================================
  // NOTIFICATIONS
  // =========================================

  notificationCount = 3;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private readonly locationService: LocationService,

    private readonly authService: AuthService,

    private readonly router: Router

  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.loadLocation();

    this.loadUser();

  }


  // =========================================
  // LOAD SAVED LOCATION
  // =========================================

  private loadLocation(): void {

    this.selectedLocation =
      this.locationService.getLocation();

  }


  // =========================================
  // LOAD CURRENT USER
  // =========================================

  private loadUser(): void {

    this.currentUser =
      this.authService.getCurrentUser();

  }


  // =========================================
  // LOCATION DISPLAY NAME
  // =========================================

  get locationDisplayName(): string {

    if (!this.selectedLocation) {

      return 'Select your location';

    }


    return (
      this.selectedLocation.address ||
      'Select your location'
    );

  }


  // =========================================
  // USER DISPLAY NAME
  // =========================================

  get userDisplayName(): string {

    if (!this.currentUser) {

      return 'My Profile';

    }


    return (
      this.currentUser.userFriendlyName ||
      this.currentUser.name ||
      'My Profile'
    );

  }


  // =========================================
  // USER EMAIL
  // =========================================

  get userEmail(): string {

    return (
      this.currentUser?.email ||
      ''
    );

  }


  // =========================================
  // USER PROFILE PICTURE
  // =========================================

  get profilePicture(): string {

    return (
      this.currentUser?.profilePictureURL ||
      ''
    );

  }


  // =========================================
  // OPEN LOCATION PAGE
  // =========================================

  openLocation(): void {

    this.showProfileMenu = false;

    this.router.navigate([
      '/location'
    ]);

  }


  // =========================================
  // TOGGLE PROFILE MENU
  // =========================================
  //
  // Reload the user every time the profile
  // button is clicked.
  //
  // This is important because the header
  // can already be loaded before login.
  // =========================================

  toggleProfileMenu(): void {

    this.loadUser();

    this.showProfileMenu =
      !this.showProfileMenu;

  }


  // =========================================
  // OPEN PROFILE PAGE
  // =========================================

  openProfile(): void {

    this.showProfileMenu = false;

    this.router.navigate([
      '/profile'
    ]);

  }


  // =========================================
  // OPEN ADDRESSES
  // =========================================

  openAddresses(): void {

    this.showProfileMenu = false;

    this.router.navigate([
      '/location'
    ]);

  }


  // =========================================
  // OPEN ORDERS
  // =========================================

  openOrders(): void {

    this.showProfileMenu = false;

    this.router.navigate([
      '/orders'
    ]);

  }


  // =========================================
  // LOGOUT
  // =========================================

  logout(): void {

    this.showProfileMenu = false;

    this.authService.logout();

    this.currentUser = null;

    this.router.navigate([
      '/home'
    ]);

  }


  // =========================================
  // NOTIFICATIONS
  // =========================================

  openNotifications(): void {

    console.log(
      'Notifications clicked'
    );

  }


  // =========================================
  // CLOSE PROFILE MENU
  // WHEN CLICKING OUTSIDE
  // =========================================

  @HostListener(
    'document:click',
    ['$event']
  )
  onDocumentClick(
    event: MouseEvent
  ): void {

    const target =
      event.target as HTMLElement;

    if (
      !target.closest('.profile-container')
    ) {

      this.showProfileMenu = false;

    }

  }

}