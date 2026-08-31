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
  City
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

        next: cities => {

          this.cities =
            cities;

          this.isLoadingCities =
            false;

        },


        error: error => {

          this.isLoadingCities =
            false;

          this.errorMessage =
            error?.message ||
            'Unable to load cities.';

          console.error(
            'City API Error:',
            error
          );

        }

      });

  }


  // =========================================
  // USE CURRENT LOCATION
  // =========================================

  useCurrentLocation(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.locationService

      .getCurrentLocation()

      .then(location => {

        console.log(
          'Current location:',
          location
        );


        this.isLoading =
          false;


        this.continueAfterLocation();

      })

      .catch(error => {

        this.isLoading =
          false;

        this.errorMessage =
          error?.message ||
          'Unable to get your location.';

      });

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
    // CURRENT COORDINATES
    // -----------------------------------------

    const coordinates =
      this.getAreaCoordinates(
        this.selectedCity,
        this.selectedArea
      );


    // -----------------------------------------
    // ADDRESS
    // -----------------------------------------

    const address =
      `${this.selectedArea}, ${this.selectedCity}`;


    // -----------------------------------------
    // CREATE LOCATION
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


    // -----------------------------------------
    // SAVE TO BACKEND
    // -----------------------------------------

    this.locationService

      .saveLocationWithAddress(
        location
      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next: savedLocation => {

          console.log(
            'Address saved successfully:',
            savedLocation
          );


          this.isSavingAddress =
            false;


          this.continueAfterLocation();

        },


        // =====================================
        // ERROR
        // =====================================

        error: error => {

          this.isSavingAddress =
            false;

          this.errorMessage =
            error?.message ||
            'Unable to save your address. Please try again.';

          console.error(
            'Address API Error:',
            error
          );

        }

      });

  }


  // =========================================
  // CONTINUE AFTER LOCATION
  // =========================================

  private continueAfterLocation(): void {

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

    // -----------------------------------------
    // KARACHI
    // -----------------------------------------

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
          latitude: 24.8742,
          longitude: 67.0608
        },

        'DHA': {
          latitude: 24.8138,
          longitude: 67.0304
        },

        'Gulshan': {
          latitude: 24.9263,
          longitude: 67.0997
        },

        'North Nazimabad': {
          latitude: 24.9441,
          longitude: 67.0347
        },

        'Clifton': {
          latitude: 24.8138,
          longitude: 67.0287
        },

        'Johar': {
          latitude: 24.9167,
          longitude: 67.1333
        },

        'Gulistan-e-Johar': {
          latitude: 24.9180,
          longitude: 67.1330
        },

        'Saddar': {
          latitude: 24.8607,
          longitude: 67.0011
        }

      };


      return (
        coordinates[area] ||
        {
          latitude: 24.8607,
          longitude: 67.0011
        }
      );

    }


    // -----------------------------------------
    // DEFAULT
    // -----------------------------------------

    return {

      latitude:
        24.8607,

      longitude:
        67.0011

    };

  }

}