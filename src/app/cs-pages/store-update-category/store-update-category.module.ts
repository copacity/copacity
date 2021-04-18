import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StoreUpdateCategoryPageRoutingModule } from './store-update-category-routing.module';

import { StoreUpdateCategoryPage } from './store-update-category.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    StoreUpdateCategoryPageRoutingModule
  ],
  declarations: [StoreUpdateCategoryPage]
})
export class StoreUpdateCategoryPageModule {}
