import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  ActivatedRoute
} from '@angular/router';

import {
  LocationService
} from '../../core/services/location.service';

import {
  UserLocation,
  City,
  SavedAddress
} from '../../shared/models/location.model';


@Component({

  selector: 'app-location',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './location.component.html',

  styleUrl:
    './location.component.css'

})
export class LocationComponent
  implements OnInit {


  // =========================================
  // CITIES
  // =========================================

  cities: City[] = [];


  // =========================================
  // SAVED ADDRESSES
  // =========================================

  savedAddresses:
    SavedAddress[] = [];


  // =========================================
  // SELECTED SAVED ADDRESS
  // =========================================

  selectedAddressId:
    number | null = null;


  // =========================================
  // MANUAL AREAS
  // =========================================

  areas: string[] = [

    'PECHS',

    'DHA',

    'Gulshan',

    'North Nazimabad',

    'Clifton',

    'Johar',

    'Gulistan-e-Johar',

    'Saddar'

  ];


  // =========================================
  // SELECTED CITY
  // =========================================

  selectedCity = '';

  selectedCityId:
    number | null = null;


  // =========================================
  // SELECTED AREA
  // =========================================

  selectedArea = '';


  // =========================================
  // UI STATE
  // =========================================

  isLoading = false;

  isSavingAddress = false;

  isLoadingCities = false;

  isLoadingAddresses = false;

  showManualLocation = false;

  errorMessage = '';


  // =========================================
  // RETURN URL
  // =========================================

  private returnUrl =
    '/home';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private locationService:
      LocationService,

    private router:
      Router,

    private route:
      ActivatedRoute,

    @Inject(PLATFORM_ID)
    private platformId: object

  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.returnUrl =
      this.route.snapshot.queryParamMap
        .get('returnUrl')
      || '/home';


    // =======================================
    // SSR / PRERENDER PROTECTION
    // =======================================

    /*
     * Do not execute authenticated API calls
     * while Angular is prerendering on the
     * server.
     *
     * /api/User/myaddresses requires the
     * logged-in user's authorization token.
     */

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {

      return;

    }


    // =======================================
    // BROWSER INITIALIZATION
    // =======================================

    this.loadCities();

    this.loadSavedAddresses();

  }


  // =========================================
  // LOAD CITIES
  // =========================================

  private loadCities(): void {

    if (
      this.isLoadingCities
    ) {

      return;

    }


    this.isLoadingCities =
      true;


    this.locationService

      .getCities()

      .subscribe({

        next: (
          cities: City[]
        ) => {

          this.cities =
            cities ?? [];


          this.isLoadingCities =
            false;


          console.log(
            'Cities loaded:',
            this.cities
          );

        },


        error: (
          error: unknown
        ) => {

          this.isLoadingCities =
            false;


          console.error(
            'City API Error:',
            error
          );


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load cities.'
            );

        }

      });

  }


  // =========================================
  // LOAD SAVED ADDRESSES
  // =========================================

  private loadSavedAddresses(): void {

    if (
      this.isLoadingAddresses
    ) {

      return;

    }


    this.isLoadingAddresses =
      true;


    this.locationService

      .getMyAddresses()

      .subscribe({

        next: (
          addresses: SavedAddress[]
        ) => {

          this.savedAddresses =
            addresses ?? [];


          this.isLoadingAddresses =
            false;


          console.log(
            'Saved addresses loaded:',
            this.savedAddresses
          );


          // =================================
          // FIND DEFAULT ADDRESS
          // =================================

          const defaultAddress =
            this.savedAddresses.find(
              address =>
                address.default === true
            );


          // =================================
          // SELECT DEFAULT ADDRESS
          // =================================

          if (
            defaultAddress
          ) {

            this.selectSavedAddress(
              defaultAddress
            );

          }

        },


        error: (
          error: unknown
        ) => {

          this.isLoadingAddresses =
            false;


          console.error(
            'Saved Address API Error:',
            error
          );


          /*
           * Do not block manual address
           * creation if saved addresses
           * cannot be loaded.
           */

        }

      });

  }


  // =========================================
  // SELECT SAVED ADDRESS
  // =========================================

  selectSavedAddress(
    address: SavedAddress
  ): void {

    if (
      !address ||
      !address.id
    ) {

      return;

    }


    const addressId =
      Number(
        address.id
      );


    if (
      !Number.isFinite(
        addressId
      ) ||
      addressId <= 0
    ) {

      return;

    }


    // =======================================
    // SET SELECTED ADDRESS
    // =======================================

    this.selectedAddressId =
      addressId;


    // =======================================
    // BUILD USER LOCATION
    // =======================================

    const location:
      UserLocation = {

      latitude:
        Number(
          address.latitude ?? 0
        ),

      longitude:
        Number(
          address.longitude ?? 0
        ),

      address:
        address.address ??
        '',

      source:
        'manual',

      cityId:
        Number(
          address.cityId
        ),

      userAddressId:
        addressId,

      label:
        address.label,

      area:
        address.area,

      houseNumber:
        address.houseNumber,

      floor:
        address.floor,

      apartment:
        address.apartment,

      landmark:
        address.landmark,

      isDefault:
        address.default === true

    };


    // =======================================
    // SAVE LOCATION LOCALLY
    // =======================================

    this.locationService.saveLocation(
      location
    );


    console.log(
      'Selected saved address:',
      location
    );

  }


  // =========================================
  // USE CURRENT LOCATION
  // =========================================

  useCurrentLocation(): void {

    if (
      this.isLoading ||
      this.isSavingAddress
    ) {

      return;

    }


    // =======================================
    // BROWSER CHECK
    // =======================================

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {

      return;

    }


    this.isLoading =
      true;

    this.errorMessage =
      '';


    // =======================================
    // GET GPS LOCATION
    // =======================================

    this.locationService

      .getCurrentLocation()

      .then(
        (
          location: UserLocation
        ) => {

          console.log(
            'Current GPS location:',
            location
          );


          // =================================
          // STOP LOADING
          // =================================

          this.isLoading =
            false;


          // =================================
          // SAVE GPS LOCATION
          // =================================

          this.locationService.saveLocation(
            location
          );


          /*
           * GPS location normally does not
           * contain a backend userAddressId.
           *
           * Therefore we save the location
           * locally and continue.
           *
           * Checkout can determine whether
           * a backend address is required.
           */

          this.continueAfterLocation();

        }
      )

      .catch(
        (
          error: unknown
        ) => {

          this.isLoading =
            false;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to get your location.'
            );


          console.error(
            'Current Location Error:',
            error
          );

        }
      );

  }


  // =========================================
  // OPEN MANUAL LOCATION
  // =========================================

  openManualLocation(): void {

    if (
      this.isLoading ||
      this.isSavingAddress
    ) {

      return;

    }


    // =======================================
    // CLEAR PREVIOUS SELECTION
    // =======================================

    this.selectedAddressId =
      null;


    this.selectedCity =
      '';

    this.selectedCityId =
      null;

    this.selectedArea =
      '';


    // =======================================
    // OPEN FORM
    // =======================================

    this.showManualLocation =
      true;

    this.errorMessage =
      '';

  }


  // =========================================
  // CLOSE MANUAL LOCATION
  // =========================================

  closeManualLocation(): void {

    if (
      this.isSavingAddress
    ) {

      return;

    }


    this.showManualLocation =
      false;


    this.selectedCity =
      '';

    this.selectedCityId =
      null;

    this.selectedArea =
      '';


    this.errorMessage =
      '';

  }


  // =========================================
  // CITY CHANGE
  // =========================================

  onCityChange(): void {

    this.selectedCityId =
      null;


    this.selectedArea =
      '';


    // =======================================
    // FIND CITY
    // =======================================

    const city =
      this.cities.find(
        item =>
          item.name ===
          this.selectedCity
      );


    if (
      !city
    ) {

      this.errorMessage =
        'Please select a valid city.';

      return;

    }


    // =======================================
    // SAVE CITY ID
    // =======================================

    this.selectedCityId =
      Number(
        city.id
      );


    this.errorMessage =
      '';

  }


  // =========================================
  // SAVE MANUAL LOCATION
  // =========================================

  saveManualLocation(): void {

    // =======================================
    // PREVENT DOUBLE SUBMISSION
    // =======================================

    if (
      this.isSavingAddress
    ) {

      return;

    }


    // =======================================
    // VALIDATE CITY
    // =======================================

    if (
      !this.selectedCityId ||
      this.selectedCityId <= 0
    ) {

      this.errorMessage =
        'Please select a valid city.';

      return;

    }


    // =======================================
    // VALIDATE AREA
    // =======================================

    if (
      !this.selectedArea
    ) {

      this.errorMessage =
        'Please select your delivery area.';

      return;

    }


    // =======================================
    // START SAVING
    // =======================================

    this.isSavingAddress =
      true;

    this.errorMessage =
      '';


    // =======================================
    // GET COORDINATES
    // =======================================

    const coordinates =
      this.getAreaCoordinates(

        this.selectedCity,

        this.selectedArea

      );


    // =======================================
    // ADDRESS TEXT
    // =======================================

    const address =
      `${this.selectedArea}, ${this.selectedCity}`;


    // =======================================
    // BUILD USER LOCATION
    // =======================================

    const location:
      UserLocation = {

      latitude:
        coordinates.latitude,

      longitude:
        coordinates.longitude,

      address,

      source:
        'manual',

      cityId:
        this.selectedCityId,

      label:
        'Home',

      area:
        this.selectedArea,

      isDefault:
        false

    };


    console.log(
      'Manual address request:',
      location
    );


    // =======================================
    // SAVE ADDRESS TO BACKEND
    // =======================================

    this.locationService

      .saveLocationWithAddress(
        location
      )

      .subscribe({

        // ===================================
        // SUCCESS
        // ===================================

        next: (
          savedLocation: UserLocation
        ) => {

          console.log(
            'Address saved successfully:',
            savedLocation
          );


          // =================================
          // STOP LOADING
          // =================================

          this.isSavingAddress =
            false;


          // =================================
          // SAVE LOCALLY
          // =================================

          this.locationService.saveLocation(
            savedLocation
          );


          // =================================
          // SET ADDRESS ID
          // =================================

          if (
            savedLocation.userAddressId
          ) {

            this.selectedAddressId =
              Number(
                savedLocation.userAddressId
              );

          }


          // =================================
          // CLOSE FORM
          // =================================

          this.showManualLocation =
            false;


          // =================================
          // NAVIGATE
          // =================================

          this.continueAfterLocation();

        },


        // ===================================
        // ERROR
        // ===================================

        error: (
          error: unknown
        ) => {

          this.isSavingAddress =
            false;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to save your address. Please try again.'
            );


          console.error(
            'Manual Address API Error:',
            error
          );

        }

      });

  }


  // =========================================
  // CONTINUE AFTER LOCATION
  // =========================================

  continueAfterLocation(): void {

    this.router.navigateByUrl(
      this.returnUrl
    );

  }


  // =========================================
  // AREA COORDINATES
  // =========================================

  private getAreaCoordinates(

    city: string,

    area: string

  ): {
    latitude: number;
    longitude: number;
  } {

    // =======================================
    // KARACHI
    // =======================================

    if (
      city === 'Karachi'
    ) {

      const coordinates:
        Record<
          string,
          {
            latitude: number;
            longitude: number;
          }
        > = {

        'PECHS': {

          latitude:
            24.8742,

          longitude:
            67.0608

        },


        'DHA': {

          latitude:
            24.8138,

          longitude:
            67.0304

        },


        'Gulshan': {

          latitude:
            24.9263,

          longitude:
            67.0997

        },


        'North Nazimabad': {

          latitude:
            24.9441,

          longitude:
            67.0347

        },


        'Clifton': {

          latitude:
            24.8138,

          longitude:
            67.0287

        },


        'Johar': {

          latitude:
            24.9167,

          longitude:
            67.1333

        },


        'Gulistan-e-Johar': {

          latitude:
            24.9180,

          longitude:
            67.1330

        },


        'Saddar': {

          latitude:
            24.8607,

          longitude:
            67.0011

        }

      };


      return (
        coordinates[area] ||
        {
          latitude:
            24.8607,

          longitude:
            67.0011
        }
      );

    }


    // =======================================
    // DEFAULT COORDINATES
    // =======================================

    return {

      latitude:
        24.8607,

      longitude:
        67.0011

    };

  }


  // =========================================
  // ERROR MESSAGE
  // =========================================

  private getErrorMessage(

    error: unknown,

    fallback: string

  ): string {

    // =======================================
    // ERROR OBJECT
    // =======================================

    if (
      error instanceof Error &&
      error.message
    ) {

      return error.message;

    }


    // =======================================
    // HTTP / API ERROR
    // =======================================

    if (
      typeof error === 'object' &&
      error !== null
    ) {

      const apiError =
        error as {

          error?: {

            message?: string;

          };

          message?: string;

        };


      return (
        apiError.error?.message ||
        apiError.message ||
        fallback
      );

    }


    return fallback;

  }

}