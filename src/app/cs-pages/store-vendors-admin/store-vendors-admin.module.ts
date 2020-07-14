import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreVendorsAdminPageRoutingModule } from './store-vendors-admin-routing.module';

import { StoreVendorsAdminPage } from './store-vendors-admin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoreVendorsAdminPageRoutingModule
  ],
  declarations: [StoreVendorsAdminPage]
})
export class StoreVendorsAdminPageModule {}
