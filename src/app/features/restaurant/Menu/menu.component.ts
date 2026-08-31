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
  // CART STATE
  // =========================================

  isAddingToCart = false;

  cartMessage = '';


  // =========================================
  // RESTAURANT SWITCH STATE
  // =========================================

  showRestaurantSwitchDialog = false;

  currentCartRestaurantName =
    'another restaurant';

  pendingSwitchItem:
    MenuItem | null = null;

  isSwitchingRestaurant = false;


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


        // =====================================
        // RESTAURANT ID NOT FOUND
        // =====================================

        if (!id) {

          this.errorMessage =
            'Restaurant ID not found.';

          return;

        }


        // =====================================
        // CONVERT ID
        // =====================================

        const restaurantId =
          Number(id);


        // =====================================
        // INVALID ID
        // =====================================

        if (
          Number.isNaN(
            restaurantId
          )
        ) {

          this.errorMessage =
            'Invalid restaurant ID.';

          return;

        }


        // =====================================
        // SAVE RESTAURANT ID
        // =====================================

        this.restaurantId =
          restaurantId;


        console.log(
          'Restaurant / Business Location ID:',
          this.restaurantId
        );


        // =====================================
        // CHECK PENDING ITEM
        // =====================================

        this.getPendingAddItem();


        // =====================================
        // LOAD RESTAURANT
        // =====================================

        this.loadRestaurant();


        // =====================================
        // LOAD MENU
        // =====================================

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
    // PREVENT DOUBLE CLICK
    // =========================================

    if (
      this.isAddingToCart ||
      this.isSwitchingRestaurant
    ) {

      return;

    }


    // =========================================
    // CLEAR MESSAGE
    // =========================================

    this.cartMessage =
      '';


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
    // BUSINESS LOCATION ID
    // =========================================

    const businessLocationId =
      Number(this.restaurantId);


    // =========================================
    // VALIDATE BUSINESS LOCATION ID
    // =========================================

    if (
      !businessLocationId ||
      Number.isNaN(
        businessLocationId
      )
    ) {

      console.error(
        'Invalid business location ID:',
        this.restaurantId
      );


      this.cartMessage =
        'Invalid restaurant location.';

      return;

    }


    // =========================================
    // GET CURRENT CART
    // =========================================

    const currentCart =
      this.cartService
        .getCurrentCart();


    console.log(
      'Current cart before add:',
      currentCart
    );


    // =========================================
    // DIFFERENT RESTAURANT
    // =========================================

    if (
      currentCart &&
      currentCart.cartItems &&
      currentCart.cartItems.length > 0 &&
      Number(currentCart.businessLocationId) !==
        businessLocationId
    ) {

      this.pendingSwitchItem =
        item;


      this.currentCartRestaurantName =
        this.getCurrentCartRestaurantName(
          currentCart.businessLocationId
        );


      this.showRestaurantSwitchDialog =
        true;


      console.log(
        'Different restaurant detected.'
      );


      return;

    }


    // =========================================
    // SAME RESTAURANT / EMPTY CART
    // =========================================

    this.performAddToCart(
      item,
      businessLocationId
    );

  }


  // =========================================
  // PERFORM ADD TO CART
  // =========================================

  private performAddToCart(
    item: MenuItem,
    businessLocationId: number
  ): void {

    if (
      this.isAddingToCart
    ) {

      return;

    }


    this.isAddingToCart =
      true;


    console.log(
      'Adding item to API cart:',
      {
        businessLocationId:
          businessLocationId,

        itemId:
          item.id,

        quantity:
          1
      }
    );


    this.cartService

      .addItem(
        item,
        businessLocationId
      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next:
          cart => {

            this.isAddingToCart =
              false;


            this.cartMessage =
              'Item added to cart successfully.';


            console.log(
              'Item added to API cart:',
              cart
            );

          },


        // =====================================
        // ERROR
        // =====================================

        error:
          error => {

            this.isAddingToCart =
              false;


            console.error(
              'Add to Cart API Error:',
              error
            );


            this.cartMessage =
              error?.error?.message ||
              'Unable to add item to cart.';

          }

      });

  }


  // =========================================
  // GET CURRENT CART RESTAURANT NAME
  // =========================================

 // =========================================
// GET CURRENT CART RESTAURANT NAME
// =========================================

private getCurrentCartRestaurantName(
  businessLocationId: number
): string {

  return `Restaurant #${businessLocationId}`;

}


  // =========================================
  // CANCEL RESTAURANT SWITCH
  // =========================================

  cancelRestaurantSwitch(): void {

    console.log(
      'Restaurant switch cancelled.'
    );


    this.showRestaurantSwitchDialog =
      false;


    this.pendingSwitchItem =
      null;


    this.currentCartRestaurantName =
      'another restaurant';

  }


  // =========================================
  // CONFIRM RESTAURANT SWITCH
  // =========================================

  confirmRestaurantSwitch(): void {

    // =========================================
    // VALIDATE PENDING ITEM
    // =========================================

    if (
      !this.pendingSwitchItem
    ) {

      return;

    }


    // =========================================
    // PREVENT DOUBLE CLICK
    // =========================================

    if (
      this.isSwitchingRestaurant
    ) {

      return;

    }


    const item =
      this.pendingSwitchItem;


    const businessLocationId =
      Number(this.restaurantId);


    // =========================================
    // VALIDATE RESTAURANT
    // =========================================

    if (
      !businessLocationId ||
      Number.isNaN(
        businessLocationId
      )
    ) {

      console.error(
        'Invalid restaurant ID:',
        this.restaurantId
      );


      return;

    }


    const currentCart =
      this.cartService
        .getCurrentCart();


    // =========================================
    // NO OLD CART
    // =========================================

    if (
      !currentCart ||
      currentCart.cartItems.length === 0
    ) {

      this.closeSwitchDialog();


      this.performAddToCart(
        item,
        businessLocationId
      );


      return;

    }


    this.isSwitchingRestaurant =
      true;


    this.cartMessage =
      '';


    console.log(
      'Clearing old restaurant cart:',
      currentCart.businessLocationId
    );


    // =========================================
    // CLEAR OLD CART
    // =========================================

    this.cartService

      .clearCart(
        currentCart.businessLocationId
      )

      .subscribe({

        // =====================================
        // CLEAR SUCCESS
        // =====================================

        next:
          () => {

            console.log(
              'Old restaurant cart cleared.'
            );


            this.closeSwitchDialog();


            this.addAfterRestaurantSwitch(
              item,
              businessLocationId
            );

          },


        // =====================================
        // CLEAR ERROR
        // =====================================

        error:
          error => {

            console.error(
              'Clear Cart Error:',
              error
            );


            this.isSwitchingRestaurant =
              false;


            this.cartMessage =
              error?.error?.message ||
              'Unable to clear the existing cart.';

          }

      });

  }


  // =========================================
  // ADD AFTER RESTAURANT SWITCH
  // =========================================

  private addAfterRestaurantSwitch(
    item: MenuItem,
    businessLocationId: number
  ): void {

    console.log(
      'Adding item from new restaurant:',
      {
        businessLocationId,
        itemId: item.id
      }
    );


    this.cartService

      .addItem(
        item,
        businessLocationId
      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next:
          cart => {

            this.isSwitchingRestaurant =
              false;


            this.cartMessage =
              'Restaurant switched successfully.';


            console.log(
              'New restaurant item added:',
              cart
            );

          },


        // =====================================
        // ERROR
        // =====================================

        error:
          error => {

            this.isSwitchingRestaurant =
              false;


            console.error(
              'Add after restaurant switch failed:',
              error
            );


            this.cartMessage =
              error?.error?.message ||
              'Restaurant switched, but item could not be added.';

          }

      });

  }


  // =========================================
  // CLOSE SWITCH DIALOG
  // =========================================

  private closeSwitchDialog(): void {

    this.showRestaurantSwitchDialog =
      false;


    this.pendingSwitchItem =
      null;


    this.currentCartRestaurantName =
      'another restaurant';

  }


  // =========================================
  // CART COUNT
  // =========================================

  get cartItemCount(): number {

    return this.cartService
      .getItemCount();

  }

}