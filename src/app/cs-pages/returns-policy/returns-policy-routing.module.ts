import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReturnsPolicyPage } from './returns-policy.page';

const routes: Routes = [
  {
    path: '',
    component: ReturnsPolicyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReturnsPolicyPageRoutingModule {}
