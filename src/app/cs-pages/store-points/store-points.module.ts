import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StorePointsPageRoutingModule } from './store-points-routing.module';

import { StorePointsPage } from './store-points.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StorePointsPageRoutingModule
  ],
  declarations: [StorePointsPage]
})
export class StorePointsPageModule {}
