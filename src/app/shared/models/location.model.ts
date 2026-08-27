export interface UserLocation {

  latitude: number;

  longitude: number;

  address: string;

  source: 'current' | 'manual';

}