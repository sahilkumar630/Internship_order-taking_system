export interface RestaurantImage {
  imageId: number;
  imageUrl: string;
  imageName: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface RestaurantDayRanges {
  [day: string]: TimeRange[];
}

export interface Restaurant {

  // =========================================
  // BACKEND IDENTIFIERS
  // =========================================

  businessId: number;

  id: number;


  // =========================================
  // BASIC INFORMATION
  // =========================================

  businessName: string;

  name: string;

  description: string | null;

  locationName: string | null;

  address: string;

  cityId: number;

  cityName: string;


  // =========================================
  // LOCATION
  // =========================================

  latitude: number;

  longitude: number;


  // =========================================
  // BUSINESS INFORMATION
  // =========================================

  businessCategoryId: number;

  businessCategoryName: string;

  isDefault: boolean;

  integrationCode: string;

  merchantID: string | null;


  // =========================================
  // CONTACT
  // =========================================

  pocName: string | null;

  pocPhone: string | null;

  email: string | null;


  // =========================================
  // STATUS / RATING
  // =========================================

  isOpen: boolean;

  rating: number;

  raters: number;


  // =========================================
  // IMAGES
  // =========================================

  images: RestaurantImage[];

  logoUrl: string | null;


  // =========================================
  // SCHEDULE
  // =========================================

  todayDayRange: TimeRange[];

  dayRanges: RestaurantDayRanges;


  // =========================================
  // OTHER BACKEND DATA
  // =========================================

  items: unknown[];

  addedOn: string;


  // =========================================
  // FRONTEND DISPLAY FIELDS
  // =========================================
  //
  // These are mapped by RestaurantService
  // from the backend response.
  //

  image: string;

  cuisine: string;

  deliveryTime: string;

  deliveryFee: string;

  discount: string;

}