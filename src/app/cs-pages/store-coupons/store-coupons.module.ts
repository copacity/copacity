import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreCouponsPageRoutingModule } from './store-coupons-routing.module';

import { StoreCouponsPage } from './store-coupons.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoreCouponsPageRoutingModule
  ],
  declarations: [StoreCouponsPage]
})
export class StoreCouponsPageModule {}
