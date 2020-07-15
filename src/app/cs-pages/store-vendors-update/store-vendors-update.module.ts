import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreVendorsUpdatePageRoutingModule } from './store-vendors-update-routing.module';

import { StoreVendorsUpdatePage } from './store-vendors-update.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    StoreVendorsUpdatePageRoutingModule
  ],
  declarations: [StoreVendorsUpdatePage]
})
export class StoreVendorsUpdatePageModule {}
