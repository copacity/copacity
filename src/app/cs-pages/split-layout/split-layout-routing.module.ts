import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SplitLayoutPage } from './split-layout.page';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '',
    component: SplitLayoutPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'store/:id',
        loadChildren: () => import('../store/store.module').then(m => m.StorePageModule)
      },
      {
        path: 'product-detail/:id',
        loadChildren: () => import('../product-detail/product-detail.module').then(m => m.ProductDetailPageModule)
      },
      {
        path: 'contact',
        loadChildren: () => import('../contact/contact.module').then( m => m.ContactPageModule)
      },
      {
        path: 'order-list',
        loadChildren: () => import('../order-list/order-list.module').then( m => m.OrderListPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SplitLayoutPageRoutingModule { }
