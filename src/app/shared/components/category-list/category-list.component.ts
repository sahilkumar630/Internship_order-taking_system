import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  FoodCategory,
  FoodCategoryService
} from '../../../core/services/food-category.service';


@Component({
  selector: 'app-category-list',

  imports: [],

  templateUrl:
    './category-list.component.html',

  styleUrl:
    './category-list.component.css'
})
export class CategoryListComponent
  implements OnInit {


  // =========================================
  // SERVICES
  // =========================================

  private readonly foodCategoryService =
    inject(FoodCategoryService);

  private readonly router =
    inject(Router);


  // =========================================
  // CATEGORY LIST
  // =========================================

  @ViewChild('categoryList')
  categoryList!: ElementRef<HTMLDivElement>;


  // =========================================
  // CATEGORY SELECTED EVENT
  // =========================================

  @Output()
  categorySelected =
    new EventEmitter<FoodCategory>();


  // =========================================
  // CATEGORIES
  // =========================================

  categories: FoodCategory[] = [];


  // =========================================
  // LOADING
  // =========================================

  isLoading = false;


  // =========================================
  // ERROR
  // =========================================

  errorMessage = '';


  // =========================================
  // INITIALIZATION
  // =========================================

  ngOnInit(): void {

    this.loadCategories();

  }


  // =========================================
  // LOAD FOOD CATEGORIES
  // =========================================

  loadCategories(): void {

    this.isLoading = true;

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

          this.isLoading = false;


          console.log(
            'Food categories loaded:',
            this.categories
          );

        },


        // =====================================
        // ERROR
        // =====================================

        error: (
          error: unknown
        ) => {

          this.isLoading = false;

          this.categories = [];


          console.error(
            'Food Category API Error:',
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
            'Unable to load food categories.';

        }

      });

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
  // SELECT CATEGORY
  // =========================================

  selectCategory(
    category: FoodCategory
  ): void {

    if (!category) {

      return;

    }


    console.log(
      '========================================'
    );

    console.log(
      'CATEGORY SELECTED'
    );

    console.log(
      '========================================'
    );

    console.log(
      'Category ID:',
      category.id
    );

    console.log(
      'Category Name:',
      category.name
    );


    // =======================================
    // EMIT CATEGORY
    // =======================================

    this.categorySelected.emit(
      category
    );


    // =======================================
    // NAVIGATE TO CATEGORY PAGE
    // =======================================

    this.router.navigate(
      ['/categories'],
      {
        queryParams: {

          categoryId:
            category.id,

          categoryName:
            category.name

        }

      }
    )

      .then(
        success => {

          console.log(
            'Category navigation result:',
            success
          );

        }
      )

      .catch(
        error => {

          console.error(
            'Category navigation error:',
            error
          );

        }
      );

  }


  // =========================================
  // SCROLL RIGHT
  // =========================================

  scrollRight(): void {

    const element =
      this.categoryList?.nativeElement;


    if (!element) {

      return;

    }


    const scrollAmount =
      element.clientWidth * 0.75;


    element.scrollTo({

      left:
        element.scrollLeft +
        scrollAmount,

      behavior:
        'smooth'

    });

  }


  // =========================================
  // SCROLL LEFT
  // =========================================

  scrollLeft(): void {

    const element =
      this.categoryList?.nativeElement;


    if (!element) {

      return;

    }


    const scrollAmount =
      element.clientWidth * 0.75;


    element.scrollTo({

      left:
        element.scrollLeft -
        scrollAmount,

      behavior:
        'smooth'

    });

  }

}