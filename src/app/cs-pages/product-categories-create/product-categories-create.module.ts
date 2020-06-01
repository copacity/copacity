import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductCategoriesCreatePageRoutingModule } from './product-categories-create-routing.module';

import { ProductCategoriesCreatePage } from './product-categories-create.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    ProductCategoriesCreatePageRoutingModule
  ],
  declarations: [ProductCategoriesCreatePage]
})
export class ProductCategoriesCreatePageModule {}
