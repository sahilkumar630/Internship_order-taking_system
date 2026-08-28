import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LocationService }
  from '../../../core/services/location.service';

import { UserLocation }
  from '../../models/location.model';


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
  // NOTIFICATIONS
  // =========================================

  notificationCount = 3;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private locationService: LocationService,

    private router: Router

  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.loadLocation();

  }


  // =========================================
  // LOAD SAVED LOCATION
  // =========================================

  private loadLocation(): void {

    this.selectedLocation =
      this.locationService.getLocation();

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
  // OPEN LOCATION PAGE
  // =========================================
  //
  // Clicking the complete location area
  // takes the user to the location page.
  // =========================================

  openLocation(): void {

    this.router.navigate([
      '/location'
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

} 