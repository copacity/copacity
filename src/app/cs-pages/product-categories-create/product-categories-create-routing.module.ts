import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductCategoriesCreatePage } from './product-categories-create.page';

const routes: Routes = [
  {
    path: '',
    component: ProductCategoriesCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductCategoriesCreatePageRoutingModule {}
