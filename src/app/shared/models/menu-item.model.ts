export interface MenuItem {

  id: number;

  name: string;

  description: string;

  itemCategory: string;

  itemCategoryId: number;

  preparationTimeMinutes: number;

  price: number;

  priceLabel: string;

  discountPrice: number;

  discountPriceLabel: string;

  rating: number;

  raters: number;

  isDeal: boolean;

  image: string;

  restaurantId: number;

  category: string;

  isPopular: boolean;

}