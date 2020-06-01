import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatusNamePipe } from './order-status-name.pipe';
import { StoreStatusNamePipe } from './store-status-name.pipe';
import { StoreCategoryNamePipe } from './store-category-name.pipe';
import { NotificationStatusNamePipe } from './notification-status-name.pipe';
import { SectorNamePipe } from './sector-name.pipe';

@NgModule({
  declarations: [OrderStatusNamePipe, StoreStatusNamePipe, SectorNamePipe, NotificationStatusNamePipe, StoreCategoryNamePipe],
  imports: [
    CommonModule
  ],
  exports: [OrderStatusNamePipe, StoreStatusNamePipe, SectorNamePipe, NotificationStatusNamePipe, StoreCategoryNamePipe],
  providers: [StoreCategoryNamePipe, SectorNamePipe]
})
export class PipesModule { }
