export interface UserLocation {

  // =========================================
  // LOCATION COORDINATES
  // =========================================

  latitude: number;

  longitude: number;


  // =========================================
  // ADDRESS
  // =========================================

  address: string;


  // =========================================
  // LOCATION SOURCE
  // =========================================

  source:
    | 'current'
    | 'manual';


  // =========================================
  // BACKEND CITY ID
  // =========================================

  cityId?: number;


  // =========================================
  // BACKEND USER ADDRESS ID
  // =========================================

  userAddressId?: number;


  // =========================================
  // ADDRESS DETAILS
  // =========================================

  label?: string;

  area?: string;

  houseNumber?: string;

  floor?: string;

  apartment?: string;

  landmark?: string;


  // =========================================
  // DEFAULT ADDRESS
  // =========================================

  isDefault?: boolean;

}


/* =========================================
   CITY
========================================= */

export interface City {

  // Backend city ID
  id: number;


  // City display name
  name: string;


  // Backend province ID
  provinceId?: string;

}