import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductDetailPageRoutingModule } from './product-detail-routing.module';

import { ProductDetailPage } from './product-detail.page';
import { ComponentsModule } from 'src/app/cs-components/components.module';
import { SuperTabsModule } from '@ionic-super-tabs/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SuperTabsModule,
    IonicModule,
    ProductDetailPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ProductDetailPage]
})
export class ProductDetailPageModule {}
