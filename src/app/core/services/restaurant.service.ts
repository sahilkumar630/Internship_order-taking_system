import { Injectable } from '@angular/core';

import { Restaurant }
  from '../../shared/models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  private restaurants: Restaurant[] = [

    {
      id: 1,
      name: 'Hot N Spicy',
      cuisine: 'Pakistani • BBQ • Fast Food',
      rating: 4.5,
      deliveryTime: '30-40 min',
      deliveryFee: 'Free Delivery',
      discount: '20% OFF',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'
    },

    {
      id: 2,
      name: 'Pizza Max',
      cuisine: 'Pizza • Fast Food',
      rating: 4.3,
      deliveryTime: '25-35 min',
      deliveryFee: 'Free Delivery',
      discount: '15% OFF',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002'
    },

    {
      id: 3,
      name: 'Burger Lab',
      cuisine: 'Burgers • Fast Food',
      rating: 4.6,
      deliveryTime: '25-35 min',
      deliveryFee: 'Rs. 60',
      discount: '25% OFF',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'
    },

    {
      id: 4,
      name: 'Biryani of Karachi',
      cuisine: 'Biryani • Pakistani',
      rating: 4.7,
      deliveryTime: '30-40 min',
      deliveryFee: 'Free Delivery',
      discount: '10% OFF',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe'
    }

  ];


  getRestaurants(): Restaurant[] {

    return this.restaurants;

  }


  getRestaurantById(id: number): Restaurant | undefined {

    return this.restaurants.find(
      restaurant => restaurant.id === id
    );

  }

}