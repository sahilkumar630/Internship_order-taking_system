import { Component } from '@angular/core';

@Component({
  selector: 'app-category-list',
  imports: [],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent {

  categories = [
    {
      name: 'All',
      icon: '🍽️'
    },
    {
      name: 'Deals',
      icon: '🏷️'
    },
    {
      name: 'Burger',
      icon: '🍔'
    },
    {
      name: 'Pizza',
      icon: '🍕'
    },
    {
      name: 'Dessert',
      icon: '🍰'
    },
    {
      name: 'Drinks',
      icon: '🥤'
    }
  ];

}