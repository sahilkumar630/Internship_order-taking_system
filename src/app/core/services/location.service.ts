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
  map
} from 'rxjs';

import {
  UserLocation,
  City
} from '../../shared/models/location.model';

import {
  environment
} from '../../../environments/environment';


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
  // API URLS
  // =========================================

  private readonly cityApiUrl =
    `${environment.apiUrl}/City`;


  private readonly addressApiUrl =
    `${environment.apiUrl}/User/address`;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    @Inject(PLATFORM_ID)
    private platformId: object,

    private http: HttpClient

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
  // GET CITIES
  // =========================================

  getCities(): Observable<City[]> {

    return this.http

      .get<any>(
        this.cityApiUrl
      )

      .pipe(

        map(response => {

          // -----------------------------------
          // VALIDATE RESPONSE
          // -----------------------------------

          if (
            !response ||
            response.responseStatus !== 1 ||
            !Array.isArray(response.data)
          ) {

            throw new Error(
              response?.message ||
              'Unable to load cities.'
            );

          }


          // -----------------------------------
          // MAP CITY DATA
          // -----------------------------------

          return response.data

            .map(
              (city: any): City => ({

                id:
                  Number(city.id),

                name:
                  String(city.name ?? ''),

                provinceId:
                  city.provinceId

              })
            )

            .filter(
              (city: City) =>
                city.id > 0 &&
                city.name.trim().length > 0
            );

        })

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

            const location:
              UserLocation = {

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
            // SAVE LOCAL LOCATION
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
  // SAVE USER ADDRESS TO API
  // =========================================

  saveUserAddress(
    location: UserLocation
  ): Observable<number> {

    // -----------------------------------------
    // VALIDATE CITY ID
    // -----------------------------------------

    if (
      !location.cityId ||
      location.cityId <= 0
    ) {

      throw new Error(
        'A valid city ID is required.'
      );

    }


    // -----------------------------------------
    // CREATE FORM DATA
    // -----------------------------------------

    const formData =
      new FormData();


    // -----------------------------------------
    // REQUIRED FIELDS
    // -----------------------------------------

    formData.append(
      'CityId',
      String(
        location.cityId
      )
    );


    formData.append(
      'Label',
      location.label ||
      'Home'
    );


    formData.append(
      'Address',
      location.address
    );


    // -----------------------------------------
    // OPTIONAL FIELDS
    // -----------------------------------------

    formData.append(
      'Area',
      location.area || ''
    );


    formData.append(
      'HouseNumber',
      location.houseNumber || ''
    );


    formData.append(
      'Floor',
      location.floor || ''
    );


    formData.append(
      'Apartment',
      location.apartment || ''
    );


    formData.append(
      'Landmark',
      location.landmark || ''
    );


    formData.append(
      'Latitude',
      String(
        location.latitude
      )
    );


    formData.append(
      'Longitude',
      String(
        location.longitude
      )
    );


    formData.append(
      'Default',
      String(
        location.isDefault ?? true
      )
    );


    // -----------------------------------------
    // SEND ADDRESS TO API
    // -----------------------------------------

    return this.http

      .post<any>(
        this.addressApiUrl,
        formData
      )

      .pipe(

        map(response => {

          // -----------------------------------
          // VALIDATE RESPONSE
          // -----------------------------------

          if (
            !response ||
            response.responseStatus !== 1
          ) {

            throw new Error(
              response?.message ||
              'Unable to save address.'
            );

          }


          // -----------------------------------
          // GET USER ADDRESS ID
          // -----------------------------------

          const userAddressId =
            Number(
              response.data
            );


          if (
            !userAddressId
          ) {

            throw new Error(
              'Address was saved but no address ID was returned.'
            );

          }


          return userAddressId;

        })

      );

  }


  // =========================================
  // SAVE LOCATION + ADDRESS
  // =========================================

  saveLocationWithAddress(
    location: UserLocation
  ): Observable<UserLocation> {

    return this

      .saveUserAddress(
        location
      )

      .pipe(

        map(
          (userAddressId: number) => {

            const updatedLocation:
              UserLocation = {

                ...location,

                userAddressId

              };


            // ---------------------------------
            // SAVE COMPLETE LOCATION
            // ---------------------------------

            this.saveLocation(
              updatedLocation
            );


            return updatedLocation;

          }
        )

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
  // GET USER ADDRESS ID
  // =========================================

  getUserAddressId(): number | null {

    const location =
      this.getLocation();


    if (
      !location?.userAddressId
    ) {

      return null;

    }


    return Number(
      location.userAddressId
    );

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