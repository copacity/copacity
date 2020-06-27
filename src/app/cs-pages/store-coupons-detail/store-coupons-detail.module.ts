import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreCouponsDetailPageRoutingModule } from './store-coupons-detail-routing.module';

import { StoreCouponsDetailPage } from './store-coupons-detail.page';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { ComponentsModule } from 'src/app/cs-components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SuperTabsModule,
    IonicModule,
    StoreCouponsDetailPageRoutingModule,
    ComponentsModule
  ],
  declarations: [StoreCouponsDetailPage]
})
export class StoreCouponsDetailPageModule {}
