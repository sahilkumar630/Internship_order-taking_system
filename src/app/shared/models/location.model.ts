export interface UserLocation {

  latitude: number;

  longitude: number;

  address: string;

  source: 'current' | 'manual';

  // =========================================
  // BACKEND CITY ID
  // =========================================

  cityId?: number;


  // =========================================
  // BACKEND SAVED ADDRESS ID
  // =========================================

  userAddressId?: number;


  // =========================================
  // ADDRESS INFORMATION
  // =========================================

  label?: string;

  area?: string;

  houseNumber?: string;

  floor?: string;

  apartment?: string;

  landmark?: string;

  isDefault?: boolean;

}


export interface City {

  id: number;

  name: string;

  provinceId?: string;

}


export interface SavedAddress {

  id: number;

  userFriendlyName?: string;

  userId?: number;

  cityId?: number;

  cityName?: string;

  label?: string;

  address?: string;

  area?: string;

  houseNumber?: string;

  floor?: string;

  apartment?: string;

  landmark?: string;

  latitude?: number;

  longitude?: number;

  default?: boolean;

  name?: string | null;

  addedOn?: string;

}