import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreUpdateCategoryPage } from './store-update-category.page';

const routes: Routes = [
  {
    path: '',
    component: StoreUpdateCategoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreUpdateCategoryPageRoutingModule {}
