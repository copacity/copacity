import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreCouponsDetailPage } from './store-coupons-detail.page';

const routes: Routes = [
  {
    path: '',
    component: StoreCouponsDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreCouponsDetailPageRoutingModule {}
