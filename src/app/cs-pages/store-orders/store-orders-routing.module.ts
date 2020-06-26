import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreOrdersPage } from './store-orders.page';

const routes: Routes = [
  {
    path: '',
    component: StoreOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreOrdersPageRoutingModule {}
