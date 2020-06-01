import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductCreatePageRoutingModule } from './product-create-routing.module';

import { ProductCreatePage } from './product-create.page';
import { ComponentsModule } from 'src/app/cs-components/components.module';
import { SuperTabsModule } from '@ionic-super-tabs/angular';

@NgModule({
  imports: [
    CommonModule,
    SuperTabsModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    ProductCreatePageRoutingModule,
    ComponentsModule
  ],
  declarations: [ProductCreatePage]
})
export class ProductCreatePageModule {}
