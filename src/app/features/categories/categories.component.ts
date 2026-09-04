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

  categories:
    FoodCategory[] = [];


  // =========================================
  // FOOD ITEMS
  // =========================================

  foodItems:
    FoodItem[] = [];


  // =========================================
  // SELECTED CATEGORY
  // =========================================

  selectedCategoryId:
    number | null = null;


  selectedCategoryName =
    '';


  // =========================================
  // CATEGORY LOADING
  // =========================================

  isLoadingCategories =
    false;


  // =========================================
  // FOOD LOADING
  // =========================================

  isLoadingFood =
    false;


  // =========================================
  // ERROR
  // =========================================

  errorMessage =
    '';


  foodErrorMessage =
    '';


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

    this.route.queryParams

      .subscribe(
        params => {

          const categoryId =
            Number(
              params['categoryId']
            );


          const categoryName =
            String(
              params['categoryName'] ||
              ''
            );


          // ===================================
          // CATEGORY SELECTED
          // ===================================

          if (
            Number.isFinite(categoryId) &&
            categoryId > 0
          ) {

            this.selectedCategoryId =
              categoryId;


            this.selectedCategoryName =
              categoryName;


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

    this.isLoadingCategories =
      true;

    this.errorMessage =
      '';


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
          categories:
            FoodCategory[]
        ) => {

          this.categories =
            categories;

          this.isLoadingCategories =
            false;

        },


        // =====================================
        // ERROR
        // =====================================

        error: (
          error: unknown
        ) => {

          this.isLoadingCategories =
            false;

          this.categories =
            [];


          console.error(
            'Categories API Error:',
            error
          );


          this.errorMessage =
            'Unable to load categories.';

        }

      });

  }


  // =========================================
  // LOAD FOOD ITEMS BY CATEGORY
  //
  // GET /FoodItem
  //
  // CategoryId = selected category
  // =========================================

  loadFoodItems(
    categoryId: number
  ): void {

    this.isLoadingFood =
      true;

    this.foodErrorMessage =
      '';

    this.foodItems =
      [];


    console.log(
      '========================================'
    );

    console.log(
      'LOADING FOOD ITEMS'
    );

    console.log(
      'Category ID:',
      categoryId
    );

    console.log(
      '========================================'
    );


    this.foodItemService

      .getFoodItems(

        undefined,

        categoryId,

        1

      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next: (
          items:
            FoodItem[]
        ) => {

          this.foodItems =
            items || [];

          this.isLoadingFood =
            false;


          console.log(
            'Food items loaded:',
            this.foodItems
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

          this.foodItems =
            [];


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

    this.selectedCategoryId =
      category.id;


    this.selectedCategoryName =
      category.name;


    // =======================================
    // UPDATE URL
    // =======================================

    this.route.queryParams
      .subscribe()
      .unsubscribe();


    // =======================================
    // LOAD FOOD ITEMS
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
      categoryName
        .toLowerCase()
        .trim();


    if (
      name.includes('fast')
    ) {

      return '🍟';

    }


    if (
      name.includes('chinese') ||
      name.includes('chinees')
    ) {

      return '🥡';

    }


    if (
      name.includes('desi')
    ) {

      return '🍛';

    }


    if (
      name.includes('biryani')
    ) {

      return '🍚';

    }


    if (
      name.includes('pizza')
    ) {

      return '🍕';

    }


    if (
      name.includes('bbq')
    ) {

      return '🍗';

    }


    if (
      name.includes('burger')
    ) {

      return '🍔';

    }


    if (
      name.includes('dessert')
    ) {

      return '🍮';

    }


    if (
      name.includes('drink')
    ) {

      return '🥤';

    }


    return '🍽️';

  }


  // =========================================
  // FOOD IMAGE
  // =========================================

  getFoodImage(
    item: FoodItem
  ): string {

    if (
      item.images &&
      item.images.length > 0 &&
      item.images[0]?.name
    ) {

      const image =
        item.images[0].name;


      // =====================================
      // ABSOLUTE IMAGE URL
      // =====================================

      if (
        image.startsWith('http')
      ) {

        return image;

      }


      // =====================================
      // API IMAGE URL
      // =====================================

      return (
        environment.tajImageApiUrl +
        image
      );

    }


    return '';

  }


  // =========================================
  // GET FOOD ITEM PRICE
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
  // CLEAR CATEGORY
  // =========================================

  showAllCategories(): void {

    this.selectedCategoryId =
      null;


    this.selectedCategoryName =
      '';


    this.foodItems =
      [];

  }

}