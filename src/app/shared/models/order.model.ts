export interface OrderItem {
  itemId: number;
  name: string;
  category: string | null;
  description: string;
  price: number;
  totalPrice: number;
  quantity: number;
  images: string[];
}

export interface OrderCart {
  businessLocationId: number;
  businessLocationName: string;
  cartItems: OrderItem[];
  id: number;
  name: string | null;
  addedOn: string;
}

export interface OrderAddress {
  userFriendlyName: string;
  userId: number;
  cityId: number;
  cityName: string;
  label: string;
  address: string;
  area: string;
  houseNumber: string;
  floor: string;
  apartment: string;
  landmark: string;
  latitude: number;
  longitude: number;
  default: boolean;
  id: number;
  name: string | null;
  addedOn: string;
}

export interface Order {
  orderNumber: string;
  businessLocationId: number;
  businessLocationName: string;
  totalAmount: number;
  orderTypeId: number;
  orderType: string;
  statusId: number;
  status: string;
  userAddressId: number;
  userAddress: OrderAddress | null;
  cartId: number;
  cart: OrderCart;
  notes: string;
  id: number;
  name: string | null;
  addedOn: string;
}