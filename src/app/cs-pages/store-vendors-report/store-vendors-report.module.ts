import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreVendorsReportPageRoutingModule } from './store-vendors-report-routing.module';

import { StoreVendorsReportPage } from './store-vendors-report.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StoreVendorsReportPageRoutingModule
  ],
  declarations: [StoreVendorsReportPage]
})
export class StoreVendorsReportPageModule {}
