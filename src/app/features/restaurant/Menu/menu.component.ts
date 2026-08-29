import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
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

import { LocationService }
  from '../../../core/services/location.service';


@Component({
  selector: 'app-menu',

  imports: [
    RouterLink
  ],

  templateUrl:
    './menu.component.html',

  styleUrl:
    './menu.component.css'
})
export class MenuComponent
  implements OnInit {


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
  // PENDING ADD-TO-CART ITEM
  // =========================================

  private pendingAddItemId:
    number | null = null;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private route:
      ActivatedRoute,

    private router:
      Router,

    private restaurantService:
      RestaurantService,

    private menuService:
      MenuService,

    private cartService:
      CartService,

    private locationService:
      LocationService

  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.route.paramMap.subscribe(
      params => {

        const id =
          params.get('id');


        if (!id) {

          this.errorMessage =
            'Restaurant ID not found.';

          return;

        }


        const restaurantId =
          Number(id);


        if (
          Number.isNaN(
            restaurantId
          )
        ) {

          this.errorMessage =
            'Invalid restaurant ID.';

          return;

        }


        this.restaurantId =
          restaurantId;


        // ===================================
        // CHECK PENDING ITEM
        // ===================================

        this.getPendingAddItem();


        // ===================================
        // LOAD RESTAURANT
        // ===================================

        this.loadRestaurant();


        // ===================================
        // LOAD MENU
        // ===================================

        this.loadMenu();

      }
    );

  }


  // =========================================
  // GET PENDING ADD ITEM
  // =========================================

  private getPendingAddItem(): void {

    const addItem =
      this.route.snapshot.queryParamMap
        .get('addItem');


    // =========================================
    // NO PENDING ITEM
    // =========================================

    if (!addItem) {

      this.pendingAddItemId =
        null;

      return;

    }


    // =========================================
    // CONVERT ITEM ID
    // =========================================

    const itemId =
      Number(addItem);


    // =========================================
    // INVALID ITEM ID
    // =========================================

    if (
      Number.isNaN(itemId)
    ) {

      this.pendingAddItemId =
        null;

      return;

    }


    // =========================================
    // SAVE PENDING ITEM
    // =========================================

    this.pendingAddItemId =
      itemId;


    console.log(
      'Pending item detected:',
      this.pendingAddItemId
    );

  }


  // =========================================
  // LOAD RESTAURANT
  // =========================================

  private loadRestaurant(): void {

    this.restaurantService

      .getRestaurantById(
        this.restaurantId
      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next:
          restaurant => {

            this.restaurant =
              restaurant;


            console.log(
              'Restaurant loaded:',
              restaurant
            );

          },


        // =====================================
        // ERROR
        // =====================================

        error:
          error => {

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

    this.isLoading =
      true;


    this.errorMessage =
      '';


    this.menuItems =
      [];


    this.categories =
      [];


    this.selectedCategory =
      'All';


    this.menuService

      .getMenuByRestaurantId(
        this.restaurantId
      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next:
          (items: MenuItem[]) => {

            this.menuItems =
              items || [];


            this.isLoading =
              false;


            console.log(
              'Menu Items:',
              this.menuItems
            );


            // =================================
            // BUILD CATEGORIES
            // =================================

            this.buildCategories();


            // =================================
            // PROCESS PENDING ITEM
            // =================================

            this.processPendingAddItem();

          },


        // =====================================
        // ERROR
        // =====================================

        error:
          error => {

            this.isLoading =
              false;


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
  // PROCESS PENDING ITEM
  // =========================================

  private processPendingAddItem(): void {

    // =========================================
    // NO PENDING ITEM
    // =========================================

    if (
      this.pendingAddItemId === null
    ) {

      return;

    }


    // =========================================
    // FIND ITEM
    // =========================================

    const item =
      this.menuItems.find(
        menuItem =>
          Number(menuItem.id) ===
          Number(this.pendingAddItemId)
      );


    // =========================================
    // ITEM NOT FOUND
    // =========================================

    if (!item) {

      console.warn(
        'Pending item was not found in the menu:',
        this.pendingAddItemId
      );


      this.pendingAddItemId =
        null;

      return;

    }


    console.log(
      'Processing pending item:',
      item
    );


    // =========================================
    // ADD ITEM
    // =========================================

    this.addToCart(item);


    // =========================================
    // CLEAR PENDING ITEM
    // =========================================

    this.pendingAddItemId =
      null;


    // =========================================
    // REMOVE QUERY PARAMETER
    // =========================================

    this.router.navigate(
      [],
      {
        relativeTo:
          this.route,

        queryParams: {},

        replaceUrl:
          true
      }
    );

  }


  // =========================================
  // BUILD CATEGORIES
  // =========================================

  private buildCategories(): void {

    const categorySet =
      new Set<string>();


    for (
      const item
      of this.menuItems
    ) {

      if (item.category) {

        categorySet.add(
          item.category
        );

      }

    }


    this.categories = [
      'All',
      ...Array.from(
        categorySet
      )
    ];


    this.selectedCategory =
      'All';

  }


  // =========================================
  // FILTER MENU ITEMS
  // =========================================

  get filteredMenuItems():
    MenuItem[] {

    // =========================================
    // ALL
    // =========================================

    if (
      this.selectedCategory ===
      'All'
    ) {

      return this.menuItems;

    }


    // =========================================
    // SELECTED CATEGORY
    // =========================================

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

    // =========================================
    // GET SAVED LOCATION
    // =========================================

    const location =
      this.locationService
        .getLocation();


    // =========================================
    // LOCATION NOT AVAILABLE
    // =========================================

    if (!location) {

      console.log(
        'Location required before adding item.'
      );


      this.router.navigate(
        ['/location'],
        {
          queryParams: {

            returnUrl:
              `/restaurant/${this.restaurantId}/menu`,

            addItem:
              item.id

          }
        }
      );


      return;

    }


    // =========================================
    // CHECK NEARBY RESTAURANT
    // =========================================

    console.log(
      'Checking restaurant availability:',
      {
        restaurantId:
          this.restaurantId,

        latitude:
          location.latitude,

        longitude:
          location.longitude
      }
    );


    this.restaurantService

      .getNearbyRestaurants(

        location.latitude,

        location.longitude

      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next:
          (restaurants: Restaurant[]) => {

            const restaurantAvailable =
              restaurants.some(
                restaurant =>
                  Number(restaurant.id) ===
                  Number(this.restaurantId)
              );


            // =================================
            // RESTAURANT AVAILABLE
            // =================================

            if (restaurantAvailable) {

              this.cartService.addItem(
                item
              );


              console.log(
                'Restaurant available. Item added to cart:',
                item
              );


              return;

            }


            // =================================
            // RESTAURANT NOT AVAILABLE
            // =================================

            console.warn(
              'Restaurant is not available at the selected location.',
              {
                restaurantId:
                  this.restaurantId,

                selectedLocation:
                  location
              }
            );


            // =================================
            // GO TO NEARBY RESTAURANTS
            // =================================

            this.router.navigate([
              '/restaurants'
            ]);

          },


        // =====================================
        // ERROR
        // =====================================

        error:
          error => {

            console.error(
              'Restaurant availability check failed:',
              error
            );

          }

      });

  }


  // =========================================
  // CART COUNT
  // =========================================

  get cartItemCount(): number {

    return this.cartService
      .getItemCount();

  }

}