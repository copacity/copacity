import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreCouponsPage } from './store-coupons.page';

const routes: Routes = [
  {
    path: '',
    component: StoreCouponsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreCouponsPageRoutingModule {}
