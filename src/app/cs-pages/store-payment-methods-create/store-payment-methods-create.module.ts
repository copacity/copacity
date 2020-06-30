import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StorePaymentMethodsCreatePageRoutingModule } from './store-payment-methods-create-routing.module';

import { StorePaymentMethodsCreatePage } from './store-payment-methods-create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StorePaymentMethodsCreatePageRoutingModule
  ],
  declarations: [StorePaymentMethodsCreatePage]
})
export class StorePaymentMethodsCreatePageModule {}
