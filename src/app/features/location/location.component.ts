import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
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

  savedAddresses: SavedAddress[] = [];


  // =========================================
  // SELECTED SAVED ADDRESS
  // =========================================

  selectedAddressId:
    number | null = null;


  // =========================================
  // AREAS
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
  // RETURN ROUTE
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
      ActivatedRoute

  ) {}


  // =========================================
  // INIT
  // =========================================

  ngOnInit(): void {

    this.returnUrl =
      this.route.snapshot.queryParamMap
        .get('returnUrl')
      || '/home';


    this.loadCities();

    this.loadSavedAddresses();

  }


  // =========================================
  // LOAD CITIES
  // =========================================

  private loadCities(): void {

    this.isLoadingCities = true;

    this.errorMessage = '';


    this.locationService

      .getCities()

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next: (cities: City[]) => {

          this.cities =
            cities ?? [];


          this.isLoadingCities =
            false;


          console.log(
            'Cities loaded:',
            this.cities
          );

        },


        // =====================================
        // ERROR
        // =====================================

        error: (error: unknown) => {

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

    this.isLoadingAddresses =
      true;


    this.locationService

      .getMyAddresses()

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next: (addresses: SavedAddress[]) => {

          this.savedAddresses =
            addresses ?? [];


          this.isLoadingAddresses =
            false;


          console.log(
            'Saved addresses:',
            this.savedAddresses
          );


          // -----------------------------------
          // SELECT DEFAULT ADDRESS
          // -----------------------------------

          const defaultAddress =
            this.savedAddresses.find(
              address =>
                address.default === true
            );


          if (defaultAddress) {

            this.selectSavedAddress(
              defaultAddress
            );

          }

        },


        // =====================================
        // ERROR
        // =====================================

        error: (error: unknown) => {

          this.isLoadingAddresses =
            false;


          console.error(
            'Saved Address API Error:',
            error
          );


          /*
           * Do not block the user from adding
           * a new address if the saved-address
           * API fails.
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


    // -----------------------------------------
    // SAVE SELECTED ADDRESS ID
    // -----------------------------------------

    this.selectedAddressId =
      address.id;


    // -----------------------------------------
    // CREATE USER LOCATION
    // -----------------------------------------

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
          address.cityId,

        userAddressId:
          address.id,

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
          address.default

      };


    // -----------------------------------------
    // SAVE LOCATION LOCALLY
    // -----------------------------------------

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

    this.isLoading = true;

    this.errorMessage = '';


    this.locationService

      .getCurrentLocation()

      .then(
        (location: UserLocation) => {

          console.log(
            'Current GPS location:',
            location
          );


          this.isLoading =
            false;


          /*
           * Current GPS location does not
           * automatically have a backend
           * userAddressId.
           *
           * Therefore GPS coordinates are saved
           * locally. Checkout will require a
           * backend saved address before an order
           * can be placed.
           */

          this.continueAfterLocation();

        }
      )

      .catch(
        (error: unknown) => {

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

    this.showManualLocation =
      true;


    this.errorMessage =
      '';

  }


  // =========================================
  // CLOSE MANUAL LOCATION
  // =========================================

  closeManualLocation(): void {

    this.showManualLocation =
      false;


    this.selectedCity =
      '';


    this.selectedCityId =
      null;


    this.selectedArea =
      '';

  }


  // =========================================
  // CITY CHANGE
  // =========================================

  onCityChange(): void {

    const city =
      this.cities.find(
        item =>
          item.name ===
          this.selectedCity
      );


    this.selectedCityId =
      city?.id ??
      null;


    this.selectedArea =
      '';

  }


  // =========================================
  // SAVE MANUAL LOCATION
  // =========================================

  saveManualLocation(): void {

    // -----------------------------------------
    // VALIDATE CITY
    // -----------------------------------------

    if (
      !this.selectedCityId
    ) {

      this.errorMessage =
        'Please select a valid city.';

      return;

    }


    // -----------------------------------------
    // VALIDATE AREA
    // -----------------------------------------

    if (
      !this.selectedArea
    ) {

      this.errorMessage =
        'Please select your delivery area.';

      return;

    }


    this.isSavingAddress =
      true;


    this.errorMessage =
      '';


    // -----------------------------------------
    // GET AREA COORDINATES
    // -----------------------------------------

    const coordinates =
      this.getAreaCoordinates(

        this.selectedCity,

        this.selectedArea

      );


    // -----------------------------------------
    // CREATE ADDRESS
    // -----------------------------------------

    const address =
      `${this.selectedArea}, ${this.selectedCity}`;


    // -----------------------------------------
    // CREATE LOCATION OBJECT
    // -----------------------------------------

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
          true

      };


    console.log(
      'Creating new address:',
      location
    );


    // -----------------------------------------
    // SAVE ADDRESS TO BACKEND
    // -----------------------------------------

    this.locationService

      .saveLocationWithAddress(
        location
      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next: (savedLocation: UserLocation) => {

          console.log(
            'Address saved successfully:',
            savedLocation
          );


          this.isSavingAddress =
            false;


          // -----------------------------------
          // SAVE BACKEND ADDRESS LOCALLY
          // -----------------------------------

          if (
            savedLocation
          ) {

            this.locationService.saveLocation(
              savedLocation
            );


            this.userAddressWasSaved(
              savedLocation
            );

          }


          // -----------------------------------
          // CONTINUE
          // -----------------------------------

          this.continueAfterLocation();

        },


        // =====================================
        // ERROR
        // =====================================

        error: (error: unknown) => {

          this.isSavingAddress =
            false;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to save your address. Please try again.'
            );


          console.error(
            'Address API Error:',
            error
          );

        }

      });

  }


  // =========================================
  // HANDLE SAVED ADDRESS
  // =========================================

  private userAddressWasSaved(
    location: UserLocation
  ): void {

    if (
      !location.userAddressId
    ) {

      console.warn(
        'Address was saved but userAddressId was not returned.'
      );


      return;

    }


    this.selectedAddressId =
      location.userAddressId;


    console.log(
      'Backend userAddressId:',
      location.userAddressId
    );

  }


  // =========================================
  // CONTINUE AFTER LOCATION
  // =========================================
  //
  // IMPORTANT:
  // This method is public because the HTML
  // template calls it directly.
  //

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


    // =========================================
    // KARACHI
    // =========================================

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


        // -------------------------------------
        // PECHS
        // -------------------------------------

        'PECHS': {

          latitude:
            24.8742,

          longitude:
            67.0608

        },


        // -------------------------------------
        // DHA
        // -------------------------------------

        'DHA': {

          latitude:
            24.8138,

          longitude:
            67.0304

        },


        // -------------------------------------
        // GULSHAN
        // -------------------------------------

        'Gulshan': {

          latitude:
            24.9263,

          longitude:
            67.0997

        },


        // -------------------------------------
        // NORTH NAZIMABAD
        // -------------------------------------

        'North Nazimabad': {

          latitude:
            24.9441,

          longitude:
            67.0347

        },


        // -------------------------------------
        // CLIFTON
        // -------------------------------------

        'Clifton': {

          latitude:
            24.8138,

          longitude:
            67.0287

        },


        // -------------------------------------
        // JOHAR
        // -------------------------------------

        'Johar': {

          latitude:
            24.9167,

          longitude:
            67.1333

        },


        // -------------------------------------
        // GULISTAN-E-JOHAR
        // -------------------------------------

        'Gulistan-e-Johar': {

          latitude:
            24.9180,

          longitude:
            67.1330

        },


        // -------------------------------------
        // SADDAR
        // -------------------------------------

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


    // =========================================
    // DEFAULT COORDINATES
    // =========================================

    return {

      latitude:
        24.8607,

      longitude:
        67.0011

    };

  }


  // =========================================
  // ERROR MESSAGE HELPER
  // =========================================

  private getErrorMessage(
    error: unknown,
    fallback: string
  ): string {

    if (
      error instanceof Error &&
      error.message
    ) {

      return error.message;

    }


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