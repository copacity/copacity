import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreVendorsAdminPage } from './store-vendors-admin.page';

const routes: Routes = [
  {
    path: '',
    component: StoreVendorsAdminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreVendorsAdminPageRoutingModule {}
