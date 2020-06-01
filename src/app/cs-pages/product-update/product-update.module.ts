import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductUpdatePageRoutingModule } from './product-update-routing.module';

import { ProductUpdatePage } from './product-update.page';
import { ComponentsModule } from 'src/app/cs-components/components.module';
import { SuperTabsModule } from '@ionic-super-tabs/angular';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    SuperTabsModule,
    ProductUpdatePageRoutingModule,
    ComponentsModule
  ],
  declarations: [ProductUpdatePage]
})
export class ProductUpdatePageModule {}
