import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OrderDetailPageRoutingModule } from './order-detail-routing.module';
import { OrderDetailPage } from './order-detail.page';
import { PipesModule } from 'src/app/cs-pipes/pipes.module';
import { ComponentsModule } from 'src/app/cs-components/components.module';
import { SuperTabsModule } from '@ionic-super-tabs/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SuperTabsModule,
    OrderDetailPageRoutingModule,
    PipesModule,
    ComponentsModule
  ],
  declarations: [OrderDetailPage]
})
export class OrderDetailPageModule {}
