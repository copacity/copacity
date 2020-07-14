import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreVendorsReportPage } from './store-vendors-report.page';

const routes: Routes = [
  {
    path: '',
    component: StoreVendorsReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreVendorsReportPageRoutingModule {}
