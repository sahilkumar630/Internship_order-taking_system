import { Routes } from '@angular/router';

export const routes: Routes = [

  // ==========================
  // DEFAULT
  // ==========================

  {
    path: '',

    loadComponent: () =>
      import('./features/home/home.component')
        .then(m => m.HomeComponent)
  },


  // ==========================
  // AUTH
  // ==========================

  {
    path: 'login',

    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: 'register',

    loadComponent: () =>
      import('./features/auth/register/register.component')
        .then(m => m.RegisterComponent)
  },


  // ==========================
  // LOCATION
  // ==========================

  {
    path: 'location',

    loadComponent: () =>
      import('./features/location/location.component')
        .then(m => m.LocationComponent)
  },


  // ==========================
  // HOME
  // ==========================

  {
    path: 'home',

    loadComponent: () =>
      import('./features/home/home.component')
        .then(m => m.HomeComponent)
  },


  // ==========================
  // CATEGORIES
  // ==========================

  {
    path: 'categories',

    loadComponent: () =>
      import('./features/categories/categories.component')
        .then(m => m.CategoriesComponent)
  },


  // ==========================
  // RESTAURANTS
  // ==========================

  {
    path: 'restaurants',

    loadComponent: () =>
      import('./features/restaurant/restaurant-list/restaurant-list.component')
        .then(m => m.RestaurantListComponent)
  },

  {
    path: 'restaurant/:id',

    loadComponent: () =>
      import('./features/restaurant/restaurant-details/restaurant-details.component')
        .then(m => m.RestaurantDetailsComponent)
  },


  // ==========================
  // RESTAURANT MENU
  // ==========================

  {
    path: 'restaurant/:id/menu',

    loadComponent: () =>
      import('./features/restaurant/menu/menu.component')
        .then(m => m.MenuComponent)
  },


  // ==========================
  // DEALS
  // ==========================

  {
    path: 'deals',

    loadComponent: () =>
      import('./features/deals/deals.component')
        .then(m => m.DealsComponent)
  },


  // ==========================
  // CART
  // ==========================

  {
    path: 'cart',

    loadComponent: () =>
      import('./features/cart/cart.component')
        .then(m => m.CartComponent)
  },


  // ==========================
  // CHECKOUT
  // ==========================

  {
    path: 'checkout',

    loadComponent: () =>
      import('./features/checkout/checkout.component')
        .then(m => m.CheckoutComponent)
  },


  // ==========================
  // ORDERS
  // ==========================

  {
    path: 'orders',

    loadComponent: () =>
      import('./features/orders/order-list/order-list.component')
        .then(m => m.OrderListComponent)
  },

  {
    path: 'orders/:id',

    loadComponent: () =>
      import('./features/orders/order-details/order-details.component')
        .then(m => m.OrderDetailsComponent)
  },

  {
    path: 'orders/:id/tracking',

    loadComponent: () =>
      import('./features/orders/order-tracking/order-tracking.component')
        .then(m => m.OrderTrackingComponent)
  },


  // ==========================
  // PROFILE
  // ==========================

  {
    path: 'profile',

    loadComponent: () =>
      import('./features/profile/profile.component')
        .then(m => m.ProfileComponent)
  },


  // ==========================
  // UNKNOWN ROUTE
  // ==========================

  {
    path: '**',

    redirectTo: 'login'
  }

];