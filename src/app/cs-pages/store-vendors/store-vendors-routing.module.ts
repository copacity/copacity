import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreVendorsPage } from './store-vendors.page';

const routes: Routes = [
  {
    path: '',
    component: StoreVendorsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreVendorsPageRoutingModule {}
