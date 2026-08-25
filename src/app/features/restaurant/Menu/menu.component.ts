import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

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

  isLoadingRestaurant = false;

  restaurantError = '';



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

        return;

      }


      this.restaurantId = Number(id);


      this.loadRestaurant();

      this.loadMenu();

    });

  }



  // =========================================
  // LOAD RESTAURANT
  // =========================================

  private loadRestaurant(): void {

    this.isLoadingRestaurant = true;

    this.restaurantError = '';


    this.restaurantService
      .getRestaurantById(this.restaurantId)
      .subscribe({

        next: (restaurant: Restaurant) => {

          this.restaurant = restaurant;

          this.isLoadingRestaurant = false;


          console.log(
            'Restaurant Details:',
            restaurant
          );

        },


        error: (error) => {

          this.isLoadingRestaurant = false;

          console.error(
            'Restaurant API Error:',
            error
          );


          this.restaurantError =
            error?.error?.message ||
            'Unable to load restaurant.';

        }

      });

  }



  // =========================================
  // LOAD MENU
  // =========================================

  private loadMenu(): void {

    this.menuItems =
      this.menuService.getMenuByRestaurantId(
        this.restaurantId
      );


    this.categories = [
      'All',

      ...new Set(
        this.menuItems.map(
          item => item.category
        )
      )

    ];

  }



  // =========================================
  // FILTER MENU
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

    this.selectedCategory = category;

  }



  // =========================================
  // ADD TO CART
  // =========================================

  addToCart(
    item: MenuItem
  ): void {

    this.cartService.addItem(item);

  }



  // =========================================
  // CART COUNT
  // =========================================

  get cartItemCount(): number {

    return this.cartService.getItemCount();

  }

}