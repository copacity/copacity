import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductInventoryPage } from './product-inventory.page';

const routes: Routes = [
  {
    path: '',
    component: ProductInventoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductInventoryPageRoutingModule {}
