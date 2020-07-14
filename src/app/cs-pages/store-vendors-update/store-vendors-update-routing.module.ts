import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreVendorsUpdatePage } from './store-vendors-update.page';

const routes: Routes = [
  {
    path: '',
    component: StoreVendorsUpdatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreVendorsUpdatePageRoutingModule {}
