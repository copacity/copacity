import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreVendorsPageRoutingModule } from './store-vendors-routing.module';

import { StoreVendorsPage } from './store-vendors.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    StoreVendorsPageRoutingModule
  ],
  declarations: [StoreVendorsPage]
})
export class StoreVendorsPageModule {}
