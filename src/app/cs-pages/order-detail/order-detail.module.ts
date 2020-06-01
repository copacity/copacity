import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OrderDetailPageRoutingModule } from './order-detail-routing.module';
import { OrderDetailPage } from './order-detail.page';
import { PipesModule } from 'src/app/cs-pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderDetailPageRoutingModule,
    PipesModule
  ],
  declarations: [OrderDetailPage]
})
export class OrderDetailPageModule {}
