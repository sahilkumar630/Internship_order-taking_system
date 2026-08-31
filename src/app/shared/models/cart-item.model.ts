export interface CartItem {

  itemId: number;

  name: string;

  category: string;

  description: string;

  price: number;

  totalPrice: number;

  quantity: number;

  images: any[];

}


export interface Cart {

  businessLocationId: number;

  cartItems: CartItem[];

}