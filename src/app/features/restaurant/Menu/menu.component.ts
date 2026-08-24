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

  restaurantId!: number;

  restaurant?: Restaurant;

  menuItems: MenuItem[] = [];

  categories: string[] = [];

  selectedCategory = 'All';


  constructor(
    private route: ActivatedRoute,

    private restaurantService: RestaurantService,

    private menuService: MenuService,

    private cartService: CartService
  ) {}


  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      if (!id) {

        return;

      }

      this.restaurantId = Number(id);


      this.restaurant =
        this.restaurantService.getRestaurantById(
          this.restaurantId
        );


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

    });

  }


  get filteredMenuItems(): MenuItem[] {

    if (this.selectedCategory === 'All') {

      return this.menuItems;

    }

    return this.menuItems.filter(
      item =>
        item.category === this.selectedCategory
    );

  }


  selectCategory(category: string): void {

    this.selectedCategory = category;

  }


  addToCart(item: MenuItem): void {

    this.cartService.addItem(item);

  }


  get cartItemCount(): number {

    return this.cartService.getItemCount();

  }

}