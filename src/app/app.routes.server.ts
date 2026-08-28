import {
  RenderMode,
  ServerRoute
} from '@angular/ssr';


export const serverRoutes: ServerRoute[] = [

  // =========================================
  // RESTAURANT DETAILS
  // =========================================
  //
  // Dynamic restaurant ID.
  // Example:
  // /restaurant/224
  //
  // This should be rendered on the client
  // because restaurant IDs come dynamically
  // from the API.
  // =========================================

  {
    path: 'restaurant/:id',
    renderMode: RenderMode.Client
  },


  // =========================================
  // RESTAURANT MENU
  // =========================================
  //
  // Dynamic restaurant ID.
  // Example:
  // /restaurant/224/menu
  // =========================================

  {
    path: 'restaurant/:id/menu',
    renderMode: RenderMode.Client
  },


  // =========================================
  // ORDER DETAILS
  // =========================================
  //
  // Dynamic order ID.
  // Example:
  // /orders/123
  // =========================================

  {
    path: 'orders/:id',
    renderMode: RenderMode.Client
  },


  // =========================================
  // ORDER TRACKING
  // =========================================
  //
  // Dynamic order ID.
  // Example:
  // /orders/123/tracking
  // =========================================

  {
    path: 'orders/:id/tracking',
    renderMode: RenderMode.Client
  },


  // =========================================
  // ALL OTHER ROUTES
  // =========================================
  //
  // Static pages can continue using
  // prerendering.
  // =========================================

  {
    path: '**',
    renderMode: RenderMode.Prerender
  }

];