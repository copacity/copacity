import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StorePqrsfPage } from './store-pqrsf.page';

const routes: Routes = [
  {
    path: '',
    component: StorePqrsfPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StorePqrsfPageRoutingModule {}
