import { Injectable } from '@angular/core';

import { MenuItem }
  from '../../shared/models/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private menuItems: MenuItem[] = [

    // ==========================
    // HOT N SPICY
    // ==========================

    {
      id: 1,
      restaurantId: 1,
      name: 'Classic Beef Burger',
      description: 'Juicy beef patty with cheese, lettuce and special sauce.',
      price: 650,
      category: 'Burgers',
      image: '🍔',
      isPopular: true
    },

    {
      id: 2,
      restaurantId: 1,
      name: 'Chicken BBQ Pizza',
      description: 'Loaded pizza with BBQ chicken and mozzarella cheese.',
      price: 950,
      category: 'Pizza',
      image: '🍕',
      isPopular: true
    },

    {
      id: 3,
      restaurantId: 1,
      name: 'BBQ Platter',
      description: 'Grilled chicken, seekh kebab and delicious BBQ selection.',
      price: 1250,
      category: 'BBQ',
      image: '🍗',
      isPopular: true
    },

    {
      id: 4,
      restaurantId: 1,
      name: 'Chicken Wings',
      description: 'Crispy chicken wings with our signature sauce.',
      price: 550,
      category: 'BBQ',
      image: '🍗',
      isPopular: false
    },


    // ==========================
    // PIZZA MAX
    // ==========================

    {
      id: 5,
      restaurantId: 2,
      name: 'Pepperoni Pizza',
      description: 'Classic pepperoni pizza with mozzarella cheese.',
      price: 1100,
      category: 'Pizza',
      image: '🍕',
      isPopular: true
    },

    {
      id: 6,
      restaurantId: 2,
      name: 'Chicken Fajita Pizza',
      description: 'Chicken fajita with fresh vegetables and cheese.',
      price: 1050,
      category: 'Pizza',
      image: '🍕',
      isPopular: true
    },

    {
      id: 7,
      restaurantId: 2,
      name: 'Garlic Bread',
      description: 'Freshly baked garlic bread with cheese.',
      price: 350,
      category: 'Sides',
      image: '🥖',
      isPopular: false
    },


    // ==========================
    // BURGER LAB
    // ==========================

    {
      id: 8,
      restaurantId: 3,
      name: 'Lab Original Burger',
      description: 'Signature beef burger with special Lab sauce.',
      price: 750,
      category: 'Burgers',
      image: '🍔',
      isPopular: true
    },

    {
      id: 9,
      restaurantId: 3,
      name: 'Firehouse Burger',
      description: 'Spicy beef burger with jalapenos and cheese.',
      price: 850,
      category: 'Burgers',
      image: '🌶️',
      isPopular: true
    },

    {
      id: 10,
      restaurantId: 3,
      name: 'Loaded Fries',
      description: 'Crispy fries loaded with cheese and special sauce.',
      price: 450,
      category: 'Sides',
      image: '🍟',
      isPopular: false
    },


    // ==========================
    // BIRYANI OF KARACHI
    // ==========================

    {
      id: 11,
      restaurantId: 4,
      name: 'Chicken Biryani',
      description: 'Traditional Karachi-style chicken biryani.',
      price: 450,
      category: 'Biryani',
      image: '🍛',
      isPopular: true
    },

    {
      id: 12,
      restaurantId: 4,
      name: 'Beef Biryani',
      description: 'Spicy beef biryani with traditional Karachi flavors.',
      price: 550,
      category: 'Biryani',
      image: '🍛',
      isPopular: true
    },

    {
      id: 13,
      restaurantId: 4,
      name: 'Raita',
      description: 'Fresh chilled yogurt raita.',
      price: 100,
      category: 'Sides',
      image: '🥣',
      isPopular: false
    }

  ];


  getMenuItems(): MenuItem[] {

    return this.menuItems;

  }


  getMenuByRestaurantId(
    restaurantId: number
  ): MenuItem[] {

    return this.menuItems.filter(
      item => item.restaurantId === restaurantId
    );

  }


  getMenuItemById(
    id: number
  ): MenuItem | undefined {

    return this.menuItems.find(
      item => item.id === id
    );

  }

}