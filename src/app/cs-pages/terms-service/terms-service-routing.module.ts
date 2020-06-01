import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TermsServicePage } from './terms-service.page';

const routes: Routes = [
  {
    path: '',
    component: TermsServicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TermsServicePageRoutingModule {}
