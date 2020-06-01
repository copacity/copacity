import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationsHistoryPageRoutingModule } from './notifications-history-routing.module';

import { NotificationsHistoryPage } from './notifications-history.page';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { PipesModule } from 'src/app/cs-pipes/pipes.module';
import { ComponentsModule } from 'src/app/cs-components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SuperTabsModule,
    IonicModule,
    NotificationsHistoryPageRoutingModule,
    PipesModule,
    ComponentsModule
  ],
  declarations: [NotificationsHistoryPage]
})
export class NotificationsHistoryPageModule {}
