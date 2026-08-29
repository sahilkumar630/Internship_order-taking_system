import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  LocationService
} from '../../core/services/location.service';

import {
  UserLocation
} from '../../shared/models/location.model';


@Component({
  selector: 'app-location',

  imports: [
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
  // SELECTED LOCATION
  // =========================================

  selectedLocation:
    UserLocation | null = null;


  // =========================================
  // UI STATE
  // =========================================

  isLoading =
    false;

  errorMessage =
    '';

  showManualLocation =
    false;


  // =========================================
  // MANUAL LOCATION
  // =========================================

  selectedCity =
    '';

  selectedArea =
    '';


  // =========================================
  // RETURN FLOW
  // =========================================

  private returnUrl:
    string | null = null;

  private addItemId:
    number | null = null;


  // =========================================
  // CITIES
  // =========================================

  cities: string[] = [

    'Karachi',

    'Lahore',

    'Islamabad',

    'Rawalpindi',

    'Faisalabad',

    'Multan',

    'Hyderabad'

  ];


  // =========================================
  // AREAS
  // =========================================

  areas: string[] = [

    'DHA',

    'Clifton',

    'Gulshan-e-Iqbal',

    'Gulistan-e-Johar',

    'North Nazimabad',

    'PECHS',

    'Saddar',

    'Bahadurabad',

    'Nazimabad',

    'Korangi'

  ];


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
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.selectedLocation =
      this.locationService.getLocation();


    // =========================================
    // READ RETURN PARAMETERS
    // =========================================

    this.returnUrl =
      this.route.snapshot.queryParamMap
        .get('returnUrl');


    const addItem =
      this.route.snapshot.queryParamMap
        .get('addItem');


    if (addItem) {

      const itemId =
        Number(addItem);


      if (!Number.isNaN(itemId)) {

        this.addItemId =
          itemId;

      }

    }


    console.log(
      'Location return flow:',
      {
        returnUrl:
          this.returnUrl,

        addItemId:
          this.addItemId
      }
    );


    // =========================================
    // IF LOCATION ALREADY EXISTS
    // =========================================

    if (this.selectedLocation) {

      this.showManualLocation =
        false;

    }

  }


  // =========================================
  // USE CURRENT LOCATION
  // =========================================

  useCurrentLocation(): void {

    this.isLoading =
      true;

    this.errorMessage =
      '';

    this.showManualLocation =
      false;


    this.locationService

      .getCurrentLocation()

      .then(
        (location: UserLocation) => {

          this.selectedLocation =
            location;

          this.isLoading =
            false;


          console.log(
            'Current location:',
            location
          );


          // -----------------------------------
          // CONTINUE ORIGINAL FLOW
          // OR RETURN TO MENU
          // -----------------------------------

          this.continueAfterLocation();

        }
      )

      .catch(
        (error: Error) => {

          this.isLoading =
            false;


          console.error(
            'Location Error:',
            error
          );


          this.errorMessage =
            error.message ||
            'Unable to get your location.';


          // -----------------------------------
          // SHOW MANUAL OPTION
          // -----------------------------------

          this.showManualLocation =
            true;

        }
      );

  }


  // =========================================
  // SHOW MANUAL LOCATION
  // =========================================

  showManual(): void {

    this.openManualLocation();

  }


  // =========================================
  // OPEN MANUAL LOCATION
  // =========================================

  openManualLocation(): void {

    this.errorMessage =
      '';

    this.showManualLocation =
      true;

  }


  // =========================================
  // CLOSE MANUAL LOCATION
  // =========================================

  closeManualLocation(): void {

    this.showManualLocation =
      false;

    this.errorMessage =
      '';

  }


  // =========================================
  // SAVE MANUAL LOCATION
  // =========================================

  saveManualLocation(): void {

    this.errorMessage =
      '';


    // =========================================
    // VALIDATE CITY
    // =========================================

    if (!this.selectedCity) {

      this.errorMessage =
        'Please select your city.';

      return;

    }


    // =========================================
    // VALIDATE AREA
    // =========================================

    if (!this.selectedArea) {

      this.errorMessage =
        'Please select your area.';

      return;

    }


    // =========================================
    // GET COORDINATES
    // =========================================

    const coordinates =
      this.getAreaCoordinates(

        this.selectedCity,

        this.selectedArea

      );


    if (!coordinates) {

      this.errorMessage =
        'Coordinates are not available for this location yet.';

      return;

    }


    // =========================================
    // CREATE LOCATION
    // =========================================

    const location:
      UserLocation = {

      latitude:
        coordinates.latitude,

      longitude:
        coordinates.longitude,

      address:
        `${this.selectedArea}, ${this.selectedCity}`,

      source:
        'manual'

    };


    // =========================================
    // SAVE
    // =========================================

    this.locationService
      .saveLocation(
        location
      );


    this.selectedLocation =
      location;


    console.log(
      'Manual location:',
      location
    );


    // =========================================
    // CONTINUE ORIGINAL FLOW
    // OR RETURN TO MENU
    // =========================================

    this.continueAfterLocation();

  }


  // =========================================
  // CONTINUE WITH MANUAL LOCATION
  // =========================================

  continueWithManualLocation(): void {

    this.saveManualLocation();

  }


  // =========================================
  // CONTINUE AFTER LOCATION
  // =========================================

  private continueAfterLocation(): void {

    // =========================================
    // ADD-TO-CART FLOW
    // =========================================

    if (
      this.returnUrl &&
      this.addItemId !== null
    ) {

      console.log(
        'Returning to menu after location selection.',
        {
          returnUrl:
            this.returnUrl,

          addItemId:
            this.addItemId
        }
      );


      this.router.navigateByUrl(

        `${this.returnUrl}?addItem=${this.addItemId}`

      );

      return;

    }


    // =========================================
    // NORMAL LOCATION FLOW
    // =========================================

    this.goToHome();

  }


  // =========================================
  // GET AREA COORDINATES
  // =========================================

  private getAreaCoordinates(

    city: string,

    area: string

  ): {

    latitude: number;

    longitude: number;

  } | null {


    // =========================================
    // KARACHI AREAS
    // =========================================

    if (city === 'Karachi') {

      const karachiAreas: {

        [key: string]: {

          latitude: number;

          longitude: number;

        };

      } = {

        'DHA': {

          latitude:
            24.8138,

          longitude:
            67.0307

        },


        'Clifton': {

          latitude:
            24.8138,

          longitude:
            67.0281

        },


        'Gulshan-e-Iqbal': {

          latitude:
            24.9207,

          longitude:
            67.0927

        },


        'Gulistan-e-Johar': {

          latitude:
            24.9056,

          longitude:
            67.1248

        },


        'North Nazimabad': {

          latitude:
            24.9434,

          longitude:
            67.0547

        },


        'PECHS': {

          latitude:
            24.8697,

          longitude:
            67.0656

        },


        'Saddar': {

          latitude:
            24.8580,

          longitude:
            67.0099

        },


        'Bahadurabad': {

          latitude:
            24.8836,

          longitude:
            67.0738

        },


        'Nazimabad': {

          latitude:
            24.9126,

          longitude:
            67.0314

        },


        'Korangi': {

          latitude:
            24.8297,

          longitude:
            67.1403

        }

      };


      return (
        karachiAreas[area] ||
        null
      );

    }


    // =========================================
    // CITY COORDINATES
    // =========================================

    const cityCoordinates: {

      [key: string]: {

        latitude: number;

        longitude: number;

      };

    } = {

      'Lahore': {

        latitude:
          31.5204,

        longitude:
          74.3587

      },


      'Islamabad': {

        latitude:
          33.6844,

        longitude:
          73.0479

      },


      'Rawalpindi': {

        latitude:
          33.5651,

        longitude:
          73.0169

      },


      'Faisalabad': {

        latitude:
          31.4504,

        longitude:
          73.1350

      },


      'Multan': {

        latitude:
          30.1575,

        longitude:
          71.5249

      },


      'Hyderabad': {

        latitude:
          25.3960,

        longitude:
          68.3578

      }

    };


    return (
      cityCoordinates[city] ||
      null
    );

  }


  // =========================================
  // GO HOME
  // =========================================

  private goToHome(): void {

    this.router.navigate([
      '/home'
    ]);

  }


  // =========================================
  // CHANGE LOCATION
  // =========================================

  changeLocation(): void {

    this.errorMessage =
      '';

    this.showManualLocation =
      true;

  }


  // =========================================
  // LOCATION DISPLAY NAME
  // =========================================

  get locationDisplayName(): string {

    if (!this.selectedLocation) {

      return 'Your location';

    }


    return this.selectedLocation.address;

  }

}