import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreOrdersPageRoutingModule } from './store-orders-routing.module';

import { StoreOrdersPage } from './store-orders.page';
import { PipesModule } from 'src/app/cs-pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PipesModule,
    IonicModule,
    StoreOrdersPageRoutingModule
  ],
  declarations: [StoreOrdersPage]
})
export class StoreOrdersPageModule {}
