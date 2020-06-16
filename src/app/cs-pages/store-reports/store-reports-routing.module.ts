import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreReportsPage } from './store-reports.page';

const routes: Routes = [
  {
    path: '',
    component: StoreReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreReportsPageRoutingModule {}
