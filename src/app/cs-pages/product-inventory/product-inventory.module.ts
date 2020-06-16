import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductInventoryPageRoutingModule } from './product-inventory-routing.module';

import { ProductInventoryPage } from './product-inventory.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductInventoryPageRoutingModule
  ],
  declarations: [ProductInventoryPage]
})
export class ProductInventoryPageModule {}
