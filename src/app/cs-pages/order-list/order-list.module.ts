import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderListPageRoutingModule } from './order-list-routing.module';

import { OrderListPage } from './order-list.page';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { ComponentsModule } from 'src/app/cs-components/components.module';
import { PipesModule } from 'src/app/cs-pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    SuperTabsModule,
    FormsModule,
    PipesModule,
    IonicModule,
    OrderListPageRoutingModule,
    ComponentsModule
  ],
  declarations: [OrderListPage]
})
export class OrderListPageModule {}
