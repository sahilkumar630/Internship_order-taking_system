import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  EMPTY
} from 'rxjs';

import { FoodSearchService }
  from '../../../core/services/food-search.service';


@Component({
  selector: 'app-search-bar',

  imports: [
    FormsModule
  ],

  templateUrl:
    './search-bar.component.html',

  styleUrl:
    './search-bar.component.css'
})
export class SearchBarComponent
  implements OnDestroy {


  // =========================================
  // BUSINESS LOCATION ID
  // =========================================

  @Input()
  businessLocationId:
    number | null = null;


  // =========================================
  // SEARCH QUERY
  // =========================================

  searchQuery = '';


  // =========================================
  // SUGGESTIONS
  // =========================================

  suggestions: string[] = [];

  showSuggestions = false;


  // =========================================
  // SEARCH STATE
  // =========================================

  isSearching = false;


  // =========================================
  // SEARCH RESULTS
  // =========================================

  @Output()
  searchResults =
    new EventEmitter<any[]>();


  // =========================================
  // SEARCH INPUT STREAM
  // =========================================

  private searchInput$ =
    new Subject<string>();


  // =========================================
  // DESTROY STREAM
  // =========================================

  private destroy$ =
    new Subject<void>();


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private foodSearchService:
      FoodSearchService
  ) {

    this.setupSuggestionSearch();

  }


  // =========================================
  // SETUP SUGGESTION SEARCH
  // =========================================

  private setupSuggestionSearch(): void {

    this.searchInput$

      .pipe(

        // Wait until user stops typing
        debounceTime(300),

        // Don't call API for the same query
        distinctUntilChanged(),

        // Cancel previous request when
        // a new query arrives
        switchMap(query => {

          if (!query) {

            this.suggestions = [];

            this.showSuggestions = false;

            this.isSearching = false;

            return EMPTY;

          }


          if (
            this.businessLocationId === null
          ) {

            this.suggestions = [];

            this.showSuggestions = false;

            this.isSearching = false;

            console.warn(
              'Business location ID is not available.'
            );

            return EMPTY;

          }


          this.isSearching = true;


          return this.foodSearchService
            .getSuggestions(

              query,

              this.businessLocationId

            );

        }),

        takeUntil(
          this.destroy$
        )

      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next: response => {

          this.isSearching = false;


          this.suggestions =
            this.extractSuggestions(
              response
            );


          this.showSuggestions =
            this.suggestions.length > 0;

        },


        // =====================================
        // ERROR
        // =====================================

        error: error => {

          this.isSearching = false;

          this.suggestions = [];

          this.showSuggestions = false;


          console.error(
            'Suggestions API Error:',
            error
          );

        }

      });

  }


  // =========================================
  // SEARCH INPUT
  // =========================================

  onSearchInput(): void {

    const query =
      this.searchQuery.trim();


    // -----------------------------------------
    // EMPTY QUERY
    // -----------------------------------------

    if (!query) {

      this.suggestions = [];

      this.showSuggestions = false;

      this.isSearching = false;

      return;

    }


    // -----------------------------------------
    // BUSINESS LOCATION REQUIRED
    // -----------------------------------------

    if (
      this.businessLocationId === null
    ) {

      this.suggestions = [];

      this.showSuggestions = false;

      console.warn(
        'Business location ID is not available.'
      );

      return;

    }


    // -----------------------------------------
    // SEND QUERY TO STREAM
    // -----------------------------------------

    this.searchInput$.next(
      query
    );

  }


  // =========================================
  // SELECT SUGGESTION
  // =========================================

  selectSuggestion(
    suggestion: string
  ): void {

    this.searchQuery =
      suggestion;


    this.showSuggestions =
      false;


    this.suggestions = [];


    this.search();

  }


  // =========================================
  // SEARCH
  // =========================================

  search(): void {

    const query =
      this.searchQuery.trim();


    if (!query) {

      return;

    }


    if (
      this.businessLocationId === null
    ) {

      console.warn(
        'Business location ID is not available.'
      );

      return;

    }


    // -----------------------------------------
    // HIDE SUGGESTIONS
    // -----------------------------------------

    this.showSuggestions =
      false;


    this.suggestions = [];


    // -----------------------------------------
    // SHOW LOADING
    // -----------------------------------------

    this.isSearching = true;


    // -----------------------------------------
    // SEARCH API
    // -----------------------------------------

    this.foodSearchService

      .searchFoodItems(

        query,

        this.businessLocationId

      )

      .pipe(

        takeUntil(
          this.destroy$
        )

      )

      .subscribe({

        // =====================================
        // SUCCESS
        // =====================================

        next: response => {

          this.isSearching = false;


          const results =
            this.extractResults(
              response
            );


          this.searchResults.emit(
            results
          );


          console.log(
            'Food search results:',
            results
          );

        },


        // =====================================
        // ERROR
        // =====================================

        error: error => {

          this.isSearching = false;


          console.error(
            'Food Search API Error:',
            error
          );

        }

      });

  }


  // =========================================
  // EXTRACT SUGGESTIONS
  // =========================================

  private extractSuggestions(
    response: any
  ): string[] {

    if (
      !response ||
      !Array.isArray(response.data)
    ) {

      return [];

    }


    return response.data

      .map(
        (item: any) => {

          // API returns a string
          if (
            typeof item === 'string'
          ) {

            return item;

          }


          // API returns an object
          return (
            item?.name ??
            item?.itemName ??
            item?.foodItemName ??
            ''
          );

        }
      )

      .filter(
        (value: string) =>
          value.trim().length > 0
      );

  }


  // =========================================
  // EXTRACT SEARCH RESULTS
  // =========================================

  private extractResults(
    response: any
  ): any[] {

    if (
      !response ||
      !Array.isArray(response.data)
    ) {

      return [];

    }


    return response.data;

  }


  // =========================================
  // CLEANUP
  // =========================================

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }

}