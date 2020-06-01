import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductCategoriesPage } from './product-categories.page';

const routes: Routes = [
  {
    path: '',
    component: ProductCategoriesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductCategoriesPageRoutingModule {}
