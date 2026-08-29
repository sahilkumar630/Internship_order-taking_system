import {
  Injectable,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

import { UserLocation }
  from '../../shared/models/location.model';


@Injectable({
  providedIn: 'root'
})
export class LocationService {

  // =========================================
  // STORAGE
  // =========================================

  private readonly locationKey =
    'foodie_user_location';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    @Inject(PLATFORM_ID)
    private platformId: object
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
  // GET CURRENT BROWSER LOCATION
  // =========================================

  getCurrentLocation(): Promise<UserLocation> {

    return new Promise(
      (resolve, reject) => {

        // -----------------------------------------
        // CHECK BROWSER
        // -----------------------------------------

        if (!this.isBrowser()) {

          reject(
            new Error(
              'Location can only be accessed from a browser.'
            )
          );

          return;

        }


        // -----------------------------------------
        // CHECK GEOLOCATION SUPPORT
        // -----------------------------------------

        if (!navigator.geolocation) {

          reject(
            new Error(
              'Geolocation is not supported by this browser.'
            )
          );

          return;

        }


        // -----------------------------------------
        // GET GPS LOCATION
        // -----------------------------------------

        navigator.geolocation.getCurrentPosition(

          // =======================================
          // SUCCESS
          // =======================================

          position => {

            const location: UserLocation = {

              latitude:
                position.coords.latitude,

              longitude:
                position.coords.longitude,

              address:
                'Current Location',

              source:
                'current'

            };


            // -------------------------------------
            // SAVE LOCATION
            // -------------------------------------

            this.saveLocation(
              location
            );


            resolve(
              location
            );

          },


          // =======================================
          // ERROR
          // =======================================

          error => {

            let message =
              'Unable to get your location.';


            switch (error.code) {

              case error.PERMISSION_DENIED:

                message =
                  'Location permission was denied.';

                break;


              case error.POSITION_UNAVAILABLE:

                message =
                  'Your location is currently unavailable.';

                break;


              case error.TIMEOUT:

                message =
                  'Location request timed out.';

                break;

            }


            reject(
              new Error(message)
            );

          },


          // =======================================
          // OPTIONS
          // =======================================

          {

            enableHighAccuracy:
              true,

            timeout:
              15000,

            maximumAge:
              300000

          }

        );

      }
    );

  }


  // =========================================
  // SAVE LOCATION
  // =========================================

  saveLocation(
    location: UserLocation
  ): void {

    // -----------------------------------------
    // SSR PROTECTION
    // -----------------------------------------

    if (!this.isBrowser()) {

      return;

    }


    localStorage.setItem(

      this.locationKey,

      JSON.stringify(
        location
      )

    );

  }


  // =========================================
  // GET SAVED LOCATION
  // =========================================

  getLocation(): UserLocation | null {

    // -----------------------------------------
    // SSR PROTECTION
    // -----------------------------------------

    if (!this.isBrowser()) {

      return null;

    }


    const storedLocation =
      localStorage.getItem(
        this.locationKey
      );


    if (!storedLocation) {

      return null;

    }


    try {

      return JSON.parse(
        storedLocation
      ) as UserLocation;

    }

    catch {

      console.error(
        'Invalid saved location.'
      );

      return null;

    }

  }


  // =========================================
  // CHECK LOCATION
  // =========================================

  hasLocation(): boolean {

    return (
      this.getLocation() !== null
    );

  }


  // =========================================
  // CLEAR LOCATION
  // =========================================

  clearLocation(): void {

    // -----------------------------------------
    // SSR PROTECTION
    // -----------------------------------------

    if (!this.isBrowser()) {

      return;

    }


    localStorage.removeItem(
      this.locationKey
    );

  }

}