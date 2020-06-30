import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StorePaymentMethodsCreatePage } from './store-payment-methods-create.page';

const routes: Routes = [
  {
    path: '',
    component: StorePaymentMethodsCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StorePaymentMethodsCreatePageRoutingModule {}
