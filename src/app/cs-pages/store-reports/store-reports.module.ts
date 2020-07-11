import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreReportsPageRoutingModule } from './store-reports-routing.module';

import { StoreReportsPage } from './store-reports.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StoreReportsPageRoutingModule
  ],
  declarations: [StoreReportsPage]
})
export class StoreReportsPageModule {}
