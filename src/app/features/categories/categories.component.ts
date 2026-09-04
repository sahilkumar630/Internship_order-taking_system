import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  FoodCategory,
  FoodCategoryService
} from '../../core/services/food-category.service';

import {
  FoodItem,
  FoodItemService
} from '../../core/services/food-item.service';

import {
  environment
} from '../../../environments/environment';


@Component({

  selector: 'app-categories',

  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl:
    './categories.component.html',

  styleUrl:
    './categories.component.css'

})
export class CategoriesComponent
  implements OnInit {


  // =========================================
  // CATEGORIES
  // =========================================

  categories: FoodCategory[] = [];


  // =========================================
  // FOOD ITEMS
  // =========================================

  foodItems: FoodItem[] = [];


  // =========================================
  // SELECTED CATEGORY
  // =========================================

  selectedCategoryId:
    number | null = null;

  selectedCategoryName = '';


  // =========================================
  // CATEGORY LOADING
  // =========================================

  isLoadingCategories = false;


  // =========================================
  // FOOD LOADING
  // =========================================

  isLoadingFood = false;


  // =========================================
  // CATEGORY ERROR
  // =========================================

  errorMessage = '';


  // =========================================
  // FOOD ERROR
  // =========================================

  foodErrorMessage = '';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private readonly foodCategoryService:
      FoodCategoryService,

    private readonly foodItemService:
      FoodItemService,

    private readonly route:
      ActivatedRoute

  ) {}


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    // =======================================
    // LOAD CATEGORIES
    // =======================================

    this.loadCategories();


    // =======================================
    // READ CATEGORY FROM URL
    // =======================================

    this.route.queryParams.subscribe(
      params => {

        const categoryId =
          Number(
            params['categoryId']
          );


        const categoryName =
          String(
            params['categoryName'] || ''
          );


        // ===================================
        // VALID CATEGORY
        // ===================================

        if (
          Number.isFinite(categoryId) &&
          categoryId > 0
        ) {

          this.selectedCategoryId =
            categoryId;

          this.selectedCategoryName =
            categoryName;


          // =================================
          // LOAD CATEGORY FOOD
          // =================================

          this.loadFoodItems(
            categoryId
          );

        }

      }
    );

  }


  // =========================================
  // LOAD ALL CATEGORIES
  // =========================================

  loadCategories(): void {

    this.isLoadingCategories = true;

    this.errorMessage = '';


    console.log(
      '========================================'
    );

    console.log(
      'LOADING FOOD CATEGORIES'
    );

    console.log(
      '========================================'
    );


    this.foodCategoryService

      .getFoodCategories(
        undefined,
        1
      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next: (
          categories: FoodCategory[]
        ) => {

          this.categories =
            categories || [];

          this.isLoadingCategories =
            false;


          console.log(
            'Categories loaded:',
            this.categories
          );

        },


        // =====================================
        // ERROR
        // =====================================

        error: (
          error: unknown
        ) => {

          this.isLoadingCategories =
            false;

          this.categories = [];


          console.error(
            'Categories API Error:',
            error
          );


          const apiError =
            error as {
              error?: {
                message?: string;
              };
            };


          this.errorMessage =
            apiError?.error?.message ||
            'Unable to load categories.';

        }

      });

  }


  // =========================================
  // LOAD FOOD ITEMS BY CATEGORY
  //
  // API:
  //
  // GET /FoodItem
  //
  // CategoryId = selected category
  // LanguageCode = 1
  // =========================================

  loadFoodItems(
    categoryId: number
  ): void {

    if (
      !Number.isFinite(categoryId) ||
      categoryId <= 0
    ) {

      return;

    }


    this.isLoadingFood = true;

    this.foodErrorMessage = '';

    this.foodItems = [];


    console.log(
      '========================================'
    );

    console.log(
      'LOADING CATEGORY FOOD MENU'
    );

    console.log(
      '========================================'
    );

    console.log(
      'Category ID:',
      categoryId
    );


    this.foodItemService

      .getFoodItemsByCategory(
        categoryId,
        1
      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next: (
          items: FoodItem[]
        ) => {

          this.foodItems =
            items || [];

          this.isLoadingFood =
            false;


          console.log(
            'Food items loaded:',
            this.foodItems
          );

          console.log(
            'Food item count:',
            this.foodItems.length
          );

        },


        // =====================================
        // ERROR
        // =====================================

        error: (
          error: unknown
        ) => {

          this.isLoadingFood =
            false;

          this.foodItems = [];


          console.error(
            'FoodItem API Error:',
            error
          );


          const apiError =
            error as {
              error?: {
                message?: string;
              };
            };


          this.foodErrorMessage =
            apiError?.error?.message ||
            'Unable to load food items.';

        }

      });

  }


  // =========================================
  // SELECT ANOTHER CATEGORY
  // =========================================

  selectCategory(
    category: FoodCategory
  ): void {

    if (!category) {

      return;

    }


    this.selectedCategoryId =
      category.id;


    this.selectedCategoryName =
      category.name;


    // =======================================
    // CLEAR OLD FOOD ITEMS
    // =======================================

    this.foodItems = [];

    this.foodErrorMessage = '';


    // =======================================
    // LOAD NEW CATEGORY FOOD
    // =======================================

    this.loadFoodItems(
      category.id
    );

  }


  // =========================================
  // GET CATEGORY ICON
  // =========================================

  getCategoryIcon(
    categoryName: string
  ): string {

    const name =
      (categoryName || '')
        .toLowerCase()
        .trim();


    // =======================================
    // FAST FOOD
    // =======================================

    if (
      name.includes('fast')
    ) {

      return '🍟';

    }


    // =======================================
    // CHINESE
    // =======================================

    if (
      name.includes('chinese') ||
      name.includes('chinees')
    ) {

      return '🥡';

    }


    // =======================================
    // DESI
    // =======================================

    if (
      name.includes('desi')
    ) {

      return '🍛';

    }


    // =======================================
    // BIRYANI
    // =======================================

    if (
      name.includes('biryani')
    ) {

      return '🍚';

    }


    // =======================================
    // PIZZA
    // =======================================

    if (
      name.includes('pizza')
    ) {

      return '🍕';

    }


    // =======================================
    // BBQ
    // =======================================

    if (
      name.includes('bbq')
    ) {

      return '🍗';

    }


    // =======================================
    // BURGER
    // =======================================

    if (
      name.includes('burger')
    ) {

      return '🍔';

    }


    // =======================================
    // DESSERT
    // =======================================

    if (
      name.includes('dessert')
    ) {

      return '🍮';

    }


    // =======================================
    // DRINKS
    // =======================================

    if (
      name.includes('drink')
    ) {

      return '🥤';

    }


    // =======================================
    // DEFAULT
    // =======================================

    return '🍽️';

  }


  // =========================================
  // GET FOOD IMAGE
  // =========================================

  getFoodImage(
    item: FoodItem
  ): string {

    if (
      !item ||
      !item.images ||
      item.images.length === 0
    ) {

      return '';

    }


    const image =
      item.images[0]?.name;


    if (!image) {

      return '';

    }


    // =======================================
    // ABSOLUTE IMAGE URL
    // =======================================

    if (
      image.startsWith('http')
    ) {

      return image;

    }


    // =======================================
    // API IMAGE URL
    // =======================================

    return (
      environment.tajImageApiUrl +
      image
    );

  }


  // =========================================
  // GET FOOD PRICE
  // =========================================

  getFoodPrice(
    item: FoodItem
  ): number {

    if (
      item.discountPrice > 0 &&
      item.discountPrice < item.price
    ) {

      return item.discountPrice;

    }


    return item.price;

  }


  // =========================================
  // CHECK DISCOUNT
  // =========================================

  hasDiscount(
    item: FoodItem
  ): boolean {

    return (
      item.discountPrice > 0 &&
      item.discountPrice < item.price
    );

  }


  // =========================================
  // GET RESTAURANT / BUSINESS LOCATION
  // =========================================

  getBusinessLocationId(
    item: FoodItem
  ): number | null {

    if (
      !item.businessLocations ||
      item.businessLocations.length === 0
    ) {

      return null;

    }


    const id =
      Number(
        item.businessLocations[0]?.id
      );


    if (
      !Number.isFinite(id) ||
      id <= 0
    ) {

      return null;

    }


    return id;

  }


  // =========================================
  // CLEAR SELECTED CATEGORY
  // =========================================

  showAllCategories(): void {

    this.selectedCategoryId =
      null;


    this.selectedCategoryName =
      '';


    this.foodItems =
      [];

    this.foodErrorMessage =
      '';

  }

}