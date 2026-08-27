import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { Restaurant }
  from '../../../shared/models/restaurant.model';

import { MenuItem }
  from '../../../shared/models/menu-item.model';

import { RestaurantService }
  from '../../../core/services/restaurant.service';

import { MenuService }
  from '../../../core/services/menu.service';

import { CartService }
  from '../../../core/services/cart.service';


@Component({
  selector: 'app-menu',

  imports: [
    RouterLink
  ],

  templateUrl: './menu.component.html',

  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {

  // =========================================
  // RESTAURANT
  // =========================================

  restaurantId!: number;

  restaurant?: Restaurant;


  // =========================================
  // MENU
  // =========================================

  menuItems: MenuItem[] = [];

  categories: string[] = [];

  selectedCategory = 'All';


  // =========================================
  // UI STATE
  // =========================================

  isLoading = false;

  errorMessage = '';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private menuService: MenuService,
    private cartService: CartService
  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      if (!id) {

        this.errorMessage =
          'Restaurant ID not found.';

        return;

      }


      const restaurantId =
        Number(id);


      if (Number.isNaN(restaurantId)) {

        this.errorMessage =
          'Invalid restaurant ID.';

        return;

      }


      this.restaurantId =
        restaurantId;


      this.loadRestaurant();

      this.loadMenu();

    });

  }


  // =========================================
  // LOAD RESTAURANT
  // =========================================

  private loadRestaurant(): void {

    this.restaurantService
      .getRestaurantById(this.restaurantId)
      .subscribe({

        next: restaurant => {

          this.restaurant =
            restaurant;

          console.log(
            'Restaurant loaded:',
            restaurant
          );

        },

        error: error => {

          console.error(
            'Restaurant API Error:',
            error
          );

        }

      });

  }


  // =========================================
  // LOAD MENU
  // =========================================

  private loadMenu(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.menuItems = [];

    this.categories = [];

    this.selectedCategory = 'All';


    this.menuService
      .getMenuByRestaurantId(this.restaurantId)
      .subscribe({

        next: (items: MenuItem[]) => {

          this.menuItems =
            items || [];

          this.isLoading = false;


          console.log(
            'Menu Items:',
            this.menuItems
          );


          this.buildCategories();

        },


        error: error => {

          this.isLoading = false;


          console.error(
            'Menu API Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to load menu items.';

        }

      });

  }


  // =========================================
  // BUILD CATEGORIES
  // =========================================

  private buildCategories(): void {

    const categorySet =
      new Set<string>();


    for (const item of this.menuItems) {

      if (item.category) {

        categorySet.add(
          item.category
        );

      }

    }


    this.categories = [
      'All',
      ...Array.from(categorySet)
    ];


    this.selectedCategory =
      'All';

  }


  // =========================================
  // FILTER MENU ITEMS
  // =========================================

  get filteredMenuItems(): MenuItem[] {

    if (
      this.selectedCategory === 'All'
    ) {

      return this.menuItems;

    }


    return this.menuItems.filter(
      item =>
        item.category ===
        this.selectedCategory
    );

  }


  // =========================================
  // SELECT CATEGORY
  // =========================================

  selectCategory(
    category: string
  ): void {

    this.selectedCategory =
      category;

  }


  // =========================================
  // ADD TO CART
  // =========================================

  addToCart(
    item: MenuItem
  ): void {

    this.cartService.addItem(item);


    console.log(
      'Added to cart:',
      item
    );

  }


  // =========================================
  // CART COUNT
  // =========================================

  get cartItemCount(): number {

    return this.cartService
      .getItemCount();

  }

}