import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreUpdatePage } from './store-update.page';

const routes: Routes = [
  {
    path: '',
    component: StoreUpdatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreUpdatePageRoutingModule {}
