import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StorePointsPage } from './store-points.page';

const routes: Routes = [
  {
    path: '',
    component: StorePointsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StorePointsPageRoutingModule {}
