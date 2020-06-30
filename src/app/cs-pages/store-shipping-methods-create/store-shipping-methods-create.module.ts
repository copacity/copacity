import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreShippingMethodsCreatePageRoutingModule } from './store-shipping-methods-create-routing.module';

import { StoreShippingMethodsCreatePage } from './store-shipping-methods-create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StoreShippingMethodsCreatePageRoutingModule
  ],
  declarations: [StoreShippingMethodsCreatePage]
})
export class StoreShippingMethodsCreatePageModule {}
