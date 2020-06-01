import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificationsHistoryPage } from './notifications-history.page';

const routes: Routes = [
  {
    path: '',
    component: NotificationsHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsHistoryPageRoutingModule {}
