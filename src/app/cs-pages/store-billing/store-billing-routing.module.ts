import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreBillingPage } from './store-billing.page';

const routes: Routes = [
  {
    path: '',
    component: StoreBillingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreBillingPageRoutingModule {}
