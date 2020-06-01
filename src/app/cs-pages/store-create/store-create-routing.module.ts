import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreCreatePage } from './store-create.page';

const routes: Routes = [
  {
    path: '',
    component: StoreCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreCreatePageRoutingModule {}
