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
  of,
  map,
  switchMap
} from 'rxjs';

import {
  UserLocation,
  City,
  SavedAddress
} from '../../shared/models/location.model';

import {
  AuthService
} from './auth.service';

import {
  environment
} from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class LocationService {

  // =========================================================
  // STORAGE
  // =========================================================

  private readonly locationKey =
    'foodie_user_location';


  // =========================================================
  // API URLS
  // =========================================================

  private readonly cityApiUrl =
    `${environment.apiUrl}/City`;

  private readonly addressApiUrl =
    `${environment.apiUrl}/User/address`;

  private readonly myAddressesApiUrl =
    `${environment.apiUrl}/User/myaddresses`;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(

    @Inject(PLATFORM_ID)
    private readonly platformId: object,

    private readonly http: HttpClient,

    private readonly authService: AuthService

  ) {}


  // =========================================================
  // BROWSER CHECK
  // =========================================================

  private isBrowser(): boolean {

    return isPlatformBrowser(
      this.platformId
    );

  }


  // =========================================================
  // GET CITIES
  // =========================================================

  getCities(): Observable<City[]> {

    return this.http
      .get<any>(
        this.cityApiUrl
      )
      .pipe(

        map(
          (response: any) => {

            console.log(
              'City API Response:',
              response
            );


            if (
              !response ||
              response.responseStatus !== 1
            ) {

              throw new Error(
                response?.message ||
                'Unable to load cities.'
              );

            }


            if (
              !Array.isArray(
                response.data
              )
            ) {

              return [];

            }


            return response.data

              .map(
                (city: any): City => ({

                  id:
                    Number(
                      city.id
                    ),

                  name:
                    String(
                      city.name ?? ''
                    ).trim(),

                  provinceId:
                    city.provinceId

                })
              )

              .filter(
                (city: City) =>

                  Number.isFinite(
                    city.id
                  ) &&

                  city.id > 0 &&

                  city.name.length > 0

              );

          }
        )

      );

  }


  // =========================================================
  // GET MY SAVED ADDRESSES
  // =========================================================

  getMyAddresses():
    Observable<SavedAddress[]> {

    /*
     * Guest users do not have backend addresses.
     *
     * Therefore:
     *
     * Guest -> []
     * Logged in -> API
     */

    if (
      !this.authService.isLoggedIn()
    ) {

      return of([]);

    }


    return this.http
      .get<any>(
        this.myAddressesApiUrl
      )
      .pipe(

        map(
          (response: any) => {

            console.log(
              'My Addresses API Response:',
              response
            );


            if (
              !response ||
              response.responseStatus !== 1
            ) {

              throw new Error(
                response?.message ||
                'Unable to load saved addresses.'
              );

            }


            if (
              !Array.isArray(
                response.data
              )
            ) {

              return [];

            }


            return response.data

              .map(
                (item: any): SavedAddress => ({

                  id:
                    Number(
                      item.id
                    ),

                  userFriendlyName:
                    item.userFriendlyName,

                  userId:
                    Number(
                      item.userId
                    ),

                  cityId:
                    Number(
                      item.cityId
                    ),

                  cityName:
                    item.cityName,

                  label:
                    item.label,

                  address:
                    item.address,

                  area:
                    item.area,

                  houseNumber:
                    item.houseNumber,

                  floor:
                    item.floor,

                  apartment:
                    item.apartment,

                  landmark:
                    item.landmark,

                  latitude:
                    Number(
                      item.latitude
                    ),

                  longitude:
                    Number(
                      item.longitude
                    ),

                  default:
                    item.default === true,

                  name:
                    item.name,

                  addedOn:
                    item.addedOn

                })
              )

              .filter(
                (address: SavedAddress) =>

                  Number.isFinite(
                    address.id
                  ) &&

                  address.id > 0

              );

          }
        )

      );

  }


  // =========================================================
  // GET CURRENT GPS LOCATION
  // =========================================================

  getCurrentLocation():
    Promise<UserLocation> {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        // -----------------------------------------------------
        // SSR PROTECTION
        // -----------------------------------------------------

        if (
          !this.isBrowser()
        ) {

          reject(
            new Error(
              'Location can only be accessed from a browser.'
            )
          );

          return;

        }


        // -----------------------------------------------------
        // BROWSER GEOLOCATION CHECK
        // -----------------------------------------------------

        if (
          !navigator.geolocation
        ) {

          reject(
            new Error(
              'Geolocation is not supported by this browser.'
            )
          );

          return;

        }


        // -----------------------------------------------------
        // GET GPS POSITION
        // -----------------------------------------------------

        navigator.geolocation.getCurrentPosition(

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


            /*
             * IMPORTANT:
             *
             * GPS location is stored locally.
             *
             * We do NOT send GPS directly to
             * /api/User/address because that API
             * requires CityId and Address.
             */

            this.saveLocation(
              location
            );


            console.log(
              'Current GPS location saved locally:',
              location
            );


            resolve(
              location
            );

          },


          error => {

            let message =
              'Unable to get your location.';


            switch (
              error.code
            ) {

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
              new Error(
                message
              )
            );

          },


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


  // =========================================================
  // SMART LOCATION SAVE
  // =========================================================

  saveLocationWithAddress(
    location: UserLocation
  ): Observable<UserLocation> {

    if (
      !location
    ) {

      throw new Error(
        'Location is required.'
      );

    }


    // =======================================================
    // GUEST
    // =======================================================

    if (
      !this.authService.isLoggedIn()
    ) {

      console.log(
        'Guest user: saving location to browser only.'
      );


      const guestLocation:
        UserLocation = {

          ...location,

          userAddressId:
            undefined

        };


      this.saveLocation(
        guestLocation
      );


      return of(
        guestLocation
      );

    }


    // =======================================================
    // LOGGED-IN USER
    // =======================================================

    console.log(
      'Logged-in user: saving location to backend.'
    );


    return this.saveAuthenticatedLocation(
      location
    );

  }


  // =========================================================
  // SAVE AUTHENTICATED LOCATION
  // =========================================================

  private saveAuthenticatedLocation(
    location: UserLocation
  ): Observable<UserLocation> {

    // -------------------------------------------------------
    // CITY VALIDATION
    // -------------------------------------------------------

    if (
      !location.cityId ||
      Number(location.cityId) <= 0
    ) {

      throw new Error(
        'A valid city ID is required.'
      );

    }


    // -------------------------------------------------------
    // ADDRESS VALIDATION
    // -------------------------------------------------------

    const address =
      String(
        location.address ?? ''
      ).trim();


    if (
      !address
    ) {

      throw new Error(
        'A delivery address is required.'
      );

    }


    // -------------------------------------------------------
    // GET EXISTING ADDRESSES
    // -------------------------------------------------------

    return this.getMyAddresses()

      .pipe(

        switchMap(
          (
            addresses: SavedAddress[]
          ) => {

            const existingAddresses =
              addresses ?? [];


            // -----------------------------------------------
            // GENERATE UNIQUE LABEL
            // -----------------------------------------------

            const uniqueLabel =
              this.generateUniqueAddressLabel(
                existingAddresses,
                location.label
              );


            /*
             * Only the first address becomes default.
             *
             * This avoids replacing the existing default
             * address every time the user adds a location.
             */

            const isDefault =
              existingAddresses.length === 0;


            const locationToSave:
              UserLocation = {

                ...location,

                label:
                  uniqueLabel,

                isDefault

              };


            console.log(
              'Final authenticated location:',
              locationToSave
            );


            // -----------------------------------------------
            // POST TO BACKEND
            // -----------------------------------------------

            return this.saveUserAddress(
              locationToSave
            )

              .pipe(

                map(
                  (
                    userAddressId: number
                  ) => {

                    const savedLocation:
                      UserLocation = {

                        ...locationToSave,

                        userAddressId

                      };


                    // ---------------------------------------
                    // ALWAYS KEEP LOCAL COPY
                    // ---------------------------------------

                    this.saveLocation(
                      savedLocation
                    );


                    console.log(
                      'Authenticated location saved:',
                      savedLocation
                    );


                    return savedLocation;

                  }
                )

              );

          }
        )

      );

  }


  // =========================================================
  // POST /api/User/address
  // =========================================================

  saveUserAddress(
    location: UserLocation
  ): Observable<number> {

    // -------------------------------------------------------
    // VALIDATE CITY
    // -------------------------------------------------------

    if (
      !location.cityId ||
      Number(location.cityId) <= 0
    ) {

      throw new Error(
        'A valid city ID is required.'
      );

    }


    // -------------------------------------------------------
    // VALIDATE LABEL
    // -------------------------------------------------------

    const label =
      String(
        location.label ?? 'Home'
      ).trim() || 'Home';


    // -------------------------------------------------------
    // VALIDATE ADDRESS
    // -------------------------------------------------------

    const address =
      String(
        location.address ?? ''
      ).trim();


    if (
      !address
    ) {

      throw new Error(
        'A delivery address is required.'
      );

    }


    // =======================================================
    // CREATE MULTIPART FORM DATA
    // =======================================================

    const formData =
      new FormData();


    // Required fields

    formData.append(
      'CityId',
      String(
        location.cityId
      )
    );


    formData.append(
      'Label',
      label
    );


    formData.append(
      'Address',
      address
    );


    // Optional fields

    formData.append(
      'Area',
      String(
        location.area ?? ''
      ).trim()
    );


    formData.append(
      'HouseNumber',
      String(
        location.houseNumber ?? ''
      ).trim()
    );


    formData.append(
      'Floor',
      String(
        location.floor ?? ''
      ).trim()
    );


    formData.append(
      'Apartment',
      String(
        location.apartment ?? ''
      ).trim()
    );


    formData.append(
      'Landmark',
      String(
        location.landmark ?? ''
      ).trim()
    );


    // Latitude

    if (
      Number.isFinite(
        Number(
          location.latitude
        )
      )
    ) {

      formData.append(
        'Latitude',
        String(
          location.latitude
        )
      );

    }
    else {

      formData.append(
        'Latitude',
        ''
      );

    }


    // Longitude

    if (
      Number.isFinite(
        Number(
          location.longitude
        )
      )
    ) {

      formData.append(
        'Longitude',
        String(
          location.longitude
        )
      );

    }
    else {

      formData.append(
        'Longitude',
        ''
      );

    }


    // Default

    formData.append(
      'Default',
      location.isDefault === true
        ? 'true'
        : 'false'
    );


    // =======================================================
    // DEBUG
    // =======================================================

    console.log(
      '========================================'
    );

    console.log(
      'POST /api/User/address'
    );

    console.log(
      '========================================'
    );


    formData.forEach(
      (
        value,
        key
      ) => {

        console.log(
          `${key}:`,
          value
        );

      }
    );


    // =======================================================
    // IMPORTANT
    // =======================================================
    //
    // DO NOT SET:
    //
    // Content-Type: multipart/form-data
    //
    // Angular/browser automatically adds:
    //
    // multipart/form-data; boundary=...
    //
    // =======================================================

    return this.http
      .post<any>(
        this.addressApiUrl,
        formData
      )

      .pipe(

        map(
          (
            response: any
          ) => {

            console.log(
              'Address API response:',
              response
            );


            if (
              response?.responseStatus === 1
            ) {

              const addressId =
                Number(
                  response.data
                );


              if (
                Number.isFinite(
                  addressId
                ) &&
                addressId > 0
              ) {

                return addressId;

              }


              throw new Error(
                'Address was saved but no valid address ID was returned.'
              );

            }


            throw new Error(
              response?.message ||
              'Unable to save address.'
            );

          }
        )

      );

  }


  // =========================================================
  // SYNC GUEST LOCATION AFTER LOGIN
  // =========================================================

  syncGuestLocationToBackend():
    Observable<UserLocation | null> {

    // -------------------------------------------------------
    // MUST BE LOGGED IN
    // -------------------------------------------------------

    if (
      !this.authService.isLoggedIn()
    ) {

      return of(null);

    }


    // -------------------------------------------------------
    // GET LOCAL LOCATION
    // -------------------------------------------------------

    const localLocation =
      this.getLocation();


    if (
      !localLocation
    ) {

      return of(null);

    }


    // -------------------------------------------------------
    // ALREADY SYNCED
    // -------------------------------------------------------

    if (
      localLocation.userAddressId &&
      Number(
        localLocation.userAddressId
      ) > 0
    ) {

      return of(
        localLocation
      );

    }


    /*
     * A GPS-only location does not contain
     * CityId and Address.
     *
     * We cannot safely invent these values.
     */

    if (
      !localLocation.cityId ||
      Number(
        localLocation.cityId
      ) <= 0 ||
      !localLocation.address ||
      !localLocation.address.trim()
    ) {

      console.log(
        'Guest location cannot be synced yet because CityId/address is missing.'
      );


      return of(
        localLocation
      );

    }


    // -------------------------------------------------------
    // SYNC
    // -------------------------------------------------------

    console.log(
      'Syncing guest location to backend...'
    );


    return this.saveAuthenticatedLocation(
      localLocation
    );

  }


  // =========================================================
  // UNIQUE ADDRESS LABEL
  // =========================================================

  private generateUniqueAddressLabel(

    addresses: SavedAddress[],

    requestedLabel?: string

  ): string {

    const baseLabel =
      String(
        requestedLabel ?? 'Home'
      ).trim() || 'Home';


    const existingLabels =
      addresses

        .map(
          (
            address: SavedAddress
          ) =>

            String(
              address.label ?? ''
            )
              .trim()
              .toLowerCase()

        )

        .filter(
          (
            label: string
          ) =>
            label.length > 0
        );


    // -------------------------------------------------------
    // LABEL AVAILABLE
    // -------------------------------------------------------

    if (
      !existingLabels.includes(
        baseLabel.toLowerCase()
      )
    ) {

      return baseLabel;

    }


    // -------------------------------------------------------
    // GENERATE Home 2, Home 3, ...
    // -------------------------------------------------------

    let counter =
      2;


    while (
      existingLabels.includes(
        `${baseLabel} ${counter}`
          .toLowerCase()
      )
    ) {

      counter++;

    }


    return `${baseLabel} ${counter}`;

  }


  // =========================================================
  // SAVE LOCATION TO BROWSER
  // =========================================================

  saveLocation(
    location: UserLocation
  ): void {

    if (
      !this.isBrowser()
    ) {

      return;

    }


    if (
      !location
    ) {

      return;

    }


    try {

      localStorage.setItem(
        this.locationKey,
        JSON.stringify(
          location
        )
      );


      console.log(
        'Location saved to browser:',
        location
      );

    }
    catch (
      error
    ) {

      console.error(
        'Unable to save location:',
        error
      );

    }

  }


  // =========================================================
  // GET BROWSER LOCATION
  // =========================================================

  getLocation():
    UserLocation | null {

    if (
      !this.isBrowser()
    ) {

      return null;

    }


    const storedLocation =
      localStorage.getItem(
        this.locationKey
      );


    if (
      !storedLocation
    ) {

      return null;

    }


    try {

      return JSON.parse(
        storedLocation
      ) as UserLocation;

    }
    catch (
      error
    ) {

      console.error(
        'Invalid stored location:',
        error
      );


      localStorage.removeItem(
        this.locationKey
      );


      return null;

    }

  }


  // =========================================================
  // GET USER ADDRESS ID
  // =========================================================

  getUserAddressId():
    number | null {

    const location =
      this.getLocation();


    if (
      !location ||
      !location.userAddressId
    ) {

      return null;

    }


    const id =
      Number(
        location.userAddressId
      );


    return (
      Number.isFinite(id) &&
      id > 0
    )
      ? id
      : null;

  }


  // =========================================================
  // GET CITY ID
  // =========================================================

  getCityId():
    number | null {

    const location =
      this.getLocation();


    if (
      !location ||
      !location.cityId
    ) {

      return null;

    }


    const id =
      Number(
        location.cityId
      );


    return (
      Number.isFinite(id) &&
      id > 0
    )
      ? id
      : null;

  }


  // =========================================================
  // GET LOCATION SOURCE
  // =========================================================

  getLocationSource():
    'current' |
    'manual' |
    null {

    const location =
      this.getLocation();


    return (
      location?.source ??
      null
    );

  }


  // =========================================================
  // HAS LOCATION
  // =========================================================

  hasLocation(): boolean {

    return (
      this.getLocation() !== null
    );

  }


  // =========================================================
  // HAS BACKEND ADDRESS
  // =========================================================

  hasSavedAddress(): boolean {

    const location =
      this.getLocation();


    return !!(
      location &&
      location.userAddressId &&
      Number(
        location.userAddressId
      ) > 0
    );

  }


  // =========================================================
  // HAS GUEST LOCATION
  // =========================================================

  hasGuestLocation(): boolean {

    const location =
      this.getLocation();


    if (
      !location
    ) {

      return false;

    }


    return !(
      location.userAddressId &&
      Number(
        location.userAddressId
      ) > 0
    );

  }


  // =========================================================
  // CLEAR LOCATION
  // =========================================================

  clearLocation(): void {

    if (
      !this.isBrowser()
    ) {

      return;

    }


    localStorage.removeItem(
      this.locationKey
    );


    console.log(
      'Browser location cleared.'
    );

  }

}