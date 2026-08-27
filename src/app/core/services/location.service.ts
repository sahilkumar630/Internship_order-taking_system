import { Injectable } from '@angular/core';

export interface UserLocation {
  latitude: number;
  longitude: number;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private readonly locationKey = 'foodie_user_location';


  // =========================================
  // SAVE LOCATION
  // =========================================

  saveLocation(location: UserLocation): void {

    localStorage.setItem(
      this.locationKey,
      JSON.stringify(location)
    );

  }


  // =========================================
  // GET LOCATION
  // =========================================

  getLocation(): UserLocation | null {

    const location =
      localStorage.getItem(
        this.locationKey
      );

    if (!location) {

      return null;

    }

    try {

      return JSON.parse(
        location
      ) as UserLocation;

    }
    catch {

      return null;

    }

  }


  // =========================================
  // CHECK LOCATION
  // =========================================

  hasLocation(): boolean {

    return this.getLocation() !== null;

  }


  // =========================================
  // CLEAR LOCATION
  // =========================================

  clearLocation(): void {

    localStorage.removeItem(
      this.locationKey
    );

  }

}