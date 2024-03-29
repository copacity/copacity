import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreBillingPageRoutingModule } from './store-billing-routing.module';

import { StoreBillingPage } from './store-billing.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    StoreBillingPageRoutingModule
  ],
  declarations: [StoreBillingPage]
})
export class StoreBillingPageModule {}
