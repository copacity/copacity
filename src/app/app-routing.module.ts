import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./cs-pages/home/home.module').then( m => m.HomePageModule)},
  {
    path: 'store/:id',
    loadChildren: () => import('./cs-pages/store/store.module').then( m => m.StorePageModule)
  },
  {
    path: 'cart',
    loadChildren: () => import('./cs-pages/cart/cart.module').then( m => m.CartPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./cs-pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'search/:id',
    loadChildren: () => import('./cs-pages/search/search.module').then( m => m.SearchPageModule)
  },
  {
    path: 'store-create',
    loadChildren: () => import('./cs-pages/store-create/store-create.module').then( m => m.StoreCreatePageModule)
  },
  {
    path: 'store-update',
    loadChildren: () => import('./cs-pages/store-update/store-update.module').then( m => m.StoreUpdatePageModule)
  },
  {
    path: 'product-create/:id',
    loadChildren: () => import('./cs-pages/product-create/product-create.module').then( m => m.ProductCreatePageModule)
  },
  {
    path: 'product-update/:id',
    loadChildren: () => import('./cs-pages/product-update/product-update.module').then( m => m.ProductUpdatePageModule)
  },
  {
    path: 'product-categories',
    loadChildren: () => import('./cs-pages/product-categories/product-categories.module').then( m => m.ProductCategoriesPageModule)
  },
  {
    path: 'order-create',
    loadChildren: () => import('./cs-pages/order-create/order-create.module').then( m => m.OrderCreatePageModule)
  },
  {
    path: 'product-detail/:id',
    loadChildren: () => import('./cs-pages/product-detail/product-detail.module').then( m => m.ProductDetailPageModule)
  },
  {
    path: 'order-detail',
    loadChildren: () => import('./cs-pages/order-detail/order-detail.module').then( m => m.OrderDetailPageModule)
  },
  {
    path: 'address-list',
    loadChildren: () => import('./cs-pages/address-list/address-list.module').then( m => m.AddressListPageModule)
  },
  {
    path: 'address-create',
    loadChildren: () => import('./cs-pages/address-create/address-create.module').then( m => m.AddressCreatePageModule)
  },
  {
    path: 'product-categories-create',
    loadChildren: () => import('./cs-pages/product-categories-create/product-categories-create.module').then( m => m.ProductCategoriesCreatePageModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('./cs-pages/contact/contact.module').then( m => m.ContactPageModule)
  },
  {
    path: 'profile-update',
    loadChildren: () => import('./cs-pages/profile-update/profile-update.module').then( m => m.ProfileUpdatePageModule)
  },
  {
    path: 'notifications-history',
    loadChildren: () => import('./cs-pages/notifications-history/notifications-history.module').then( m => m.NotificationsHistoryPageModule)
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./cs-pages/privacy-policy/privacy-policy.module').then( m => m.PrivacyPolicyPageModule)
  },
  {
    path: 'terms-service',
    loadChildren: () => import('./cs-pages/terms-service/terms-service.module').then( m => m.TermsServicePageModule)
  },
  {
    path: 'order-list',
    loadChildren: () => import('./cs-pages/order-list/order-list.module').then( m => m.OrderListPageModule)
  },
  {
    path: 'store-coupons',
    loadChildren: () => import('./cs-pages/store-coupons/store-coupons.module').then( m => m.StoreCouponsPageModule)
  },
  {
    path: 'store-points',
    loadChildren: () => import('./cs-pages/store-points/store-points.module').then( m => m.StorePointsPageModule)
  }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
