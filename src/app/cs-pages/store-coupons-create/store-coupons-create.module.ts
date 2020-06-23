import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreCouponsCreatePageRoutingModule } from './store-coupons-create-routing.module';

import { StoreCouponsCreatePage } from './store-coupons-create.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    StoreCouponsCreatePageRoutingModule
  ],
  declarations: [StoreCouponsCreatePage]
})
export class StoreCouponsCreatePageModule {}
